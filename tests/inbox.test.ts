import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({ embedTexts: vi.fn(), streamChat: vi.fn() }));
vi.mock("@/server/ai/openai", async (original) => ({
  ...(await original<typeof import("@/server/ai/openai")>()),
  embedTexts: mocks.embedTexts,
  streamChat: mocks.streamChat,
}));
vi.mock("@/server/jobs/queue", () => ({ enqueueIngest: vi.fn(async () => {}) }));

import { GET as widgetStream } from "@/app/api/widget/stream/route";
import { decodeSystemEvent, encodeSystemEvent } from "@/lib/system-events";
import { answerMessage } from "@/server/ai/answer";
import { tenantDb } from "@/server/db/tenant";
import {
  closeConversation,
  getConversation,
  inboxCounts,
  InboxError,
  listConversations,
  reopenConversation,
  returnToAi,
  sendAgentMessage,
  takeOver,
} from "@/server/inbox";
import { subscribe, type ChatEvent } from "@/server/realtime/bus";
import { createWidgetToken } from "@/server/widget/token";
import { createTenant } from "./helpers";

beforeEach(() => {
  mocks.embedTexts.mockReset().mockImplementation(async (texts: string[]) => texts.map(() => Array(1536).fill(0.01)));
  mocks.streamChat.mockReset().mockImplementation(async function* () {
    yield '{"answered":true,"wants_human":false,"name":null,"phone":null,"email":null}\n';
    yield "AI reply.";
  });
});

async function setup(name: string) {
  const t = await createTenant(name);
  const workspaceId = t.workspace.id;
  const db = tenantDb(workspaceId);
  const scope = { db, workspaceId };
  const agent = { id: t.user.id, name: "Sara Agent", email: t.user.email };
  const open = async (visitorId: string, extra: Record<string, unknown> = {}) =>
    (await db.conversation.create({ data: { workspaceId, visitorId, ...extra } })).id;
  return { ...t, workspaceId, db, scope, agent, open };
}

async function customerSays(workspaceId: string, conversationId: string, text: string) {
  let result;
  for await (const event of answerMessage({ workspaceId, conversationId, text })) if (event.type === "done") result = event.result;
  return result!;
}

/** Collect bus events for one workspace while `run` executes. */
async function capture(workspaceId: string, run: () => Promise<unknown>) {
  const events: ChatEvent[] = [];
  const stop = subscribe((e) => {
    if (e.workspaceId === workspaceId) events.push(e);
  });
  await run();
  stop();
  return events;
}

describe("system events", () => {
  it("round-trips codes and details", () => {
    expect(decodeSystemEvent(encodeSystemEvent("agent_joined", "Sara"))).toEqual({ code: "agent_joined", detail: "Sara" });
    expect(decodeSystemEvent(encodeSystemEvent("closed"))).toEqual({ code: "closed", detail: null });
    expect(decodeSystemEvent(encodeSystemEvent("agent_joined", "A|B"))?.detail).toBe("A B");
    expect(decodeSystemEvent("Customer asked to talk to a human.")).toBeNull();
    expect(decodeSystemEvent("event:made_up")).toBeNull();
  });
});

describe("human takeover", () => {
  it("pauses the AI while an agent has the conversation and resumes it afterwards", async () => {
    const t = await setup("Takeover Flow");
    const id = await t.open("visitor-takeover-0001");

    expect((await customerSays(t.workspaceId, id, "Hello")).reply).toBe("AI reply.");

    await takeOver(t.scope, id, t.agent);
    expect(await t.db.conversation.findUniqueOrThrow({ where: { id } })).toMatchObject({ status: "human", assignedAgentId: t.user.id });

    // The customer writes again: stored for the agent, but the AI stays silent.
    mocks.streamChat.mockClear();
    const paused = await customerSays(t.workspaceId, id, "Are you a person?");
    expect(paused).toMatchObject({ reply: null, skipped: "human_takeover" });
    expect(mocks.streamChat).not.toHaveBeenCalled();

    await sendAgentMessage(t.scope, id, t.agent, "Yes, this is Sara. How can I help?");
    await returnToAi(t.scope, id);
    expect(await t.db.conversation.findUniqueOrThrow({ where: { id } })).toMatchObject({ status: "ai", assignedAgentId: null });
    expect((await customerSays(t.workspaceId, id, "Thanks")).reply).toBe("AI reply.");

    const detail = (await getConversation(t.scope, id))!;
    expect(detail.messages.map((m) => m.role)).toEqual(["customer", "assistant", "system", "customer", "agent", "system", "customer", "assistant"]);
    expect(decodeSystemEvent(detail.messages[2].content)).toEqual({ code: "agent_joined", detail: "Sara Agent" });
    expect(detail.messages[4]).toMatchObject({ content: "Yes, this is Sara. How can I help?", author: { email: t.user.email } });
    // The agent's reply is part of the history the model sees afterwards.
    const lastPrompt = mocks.streamChat.mock.calls.at(-1)![0] as { role: string; content: string }[];
    expect(lastPrompt.some((m) => m.role === "assistant" && m.content.includes("this is Sara"))).toBe(true);
  });

  it("only lets agents reply after taking over, and not on closed chats", async () => {
    const t = await setup("Takeover Rules");
    const id = await t.open("visitor-takeover-0002");

    await expect(sendAgentMessage(t.scope, id, t.agent, "hi")).rejects.toMatchObject({ code: "not_taken_over" });
    expect(await t.db.message.count()).toBe(0);

    await closeConversation(t.scope, id);
    await expect(takeOver(t.scope, id, t.agent)).rejects.toMatchObject({ code: "closed" });
    await expect(returnToAi(t.scope, id)).rejects.toBeInstanceOf(InboxError);

    await reopenConversation(t.scope, id);
    expect((await t.db.conversation.findUniqueOrThrow({ where: { id } })).status).toBe("ai");
    await takeOver(t.scope, id, t.agent);
    await sendAgentMessage(t.scope, id, t.agent, "hi");
    expect(await t.db.message.count({ where: { role: "agent" } })).toBe(1);
  });

  it("cannot act on another workspace's conversation", async () => {
    const a = await setup("Takeover Iso A");
    const b = await setup("Takeover Iso B");
    const bId = await b.open("visitor-b-00000001");

    for (const attempt of [
      () => takeOver(a.scope, bId, a.agent),
      () => sendAgentMessage(a.scope, bId, a.agent, "intruding"),
      () => closeConversation(a.scope, bId),
      () => returnToAi(a.scope, bId),
      () => reopenConversation(a.scope, bId),
    ]) {
      await expect(attempt()).rejects.toMatchObject({ code: "not_found" });
    }
    expect(await getConversation(a.scope, bId)).toBeNull();
    expect(await b.db.conversation.findUniqueOrThrow({ where: { id: bId } })).toMatchObject({ status: "ai", assignedAgentId: null });
    expect(await b.db.message.count()).toBe(0);
  });
});

describe("inbox list", () => {
  it("filters, counts, searches, and hides dashboard test chats", async () => {
    const t = await setup("Inbox List");
    const ai = await t.open("visitor-list-0001", { visitorName: "Omar", visitorPhone: "+971501112222" });
    const waiting = await t.open("visitor-list-0002", { status: "needs_human", visitorName: "Fatima" });
    const closed = await t.open("visitor-list-0003", { status: "closed" });
    await t.open("visitor-list-0004", { isTest: true });
    await t.db.message.create({ data: { workspaceId: t.workspaceId, conversationId: ai, role: "customer", content: "Do you do teeth whitening?" } });
    await takeOver(t.scope, waiting, t.agent);

    const ids = async (filter: Parameters<typeof listConversations>[1]["filter"], search?: string) =>
      (await listConversations(t.scope, { filter, search })).map((c) => c.id).sort();

    expect(await ids("all")).toEqual([ai, waiting, closed].sort());
    expect(await ids("needs_human")).toEqual([waiting]); // a taken-over chat stays under "needs human"
    expect(await ids("ai")).toEqual([ai]);
    expect(await ids("closed")).toEqual([closed]);
    expect(await inboxCounts(t.scope)).toMatchObject({ all: 3, needs_human: 1, ai: 1, closed: 1 });

    expect(await ids("all", "omar")).toEqual([ai]);
    expect(await ids("all", "5011122")).toEqual([ai]);
    expect(await ids("all", "WHITENING")).toEqual([ai]);
    expect(await ids("all", "joined")).toEqual([]); // system events are not searchable text
    expect(await ids("all", "nothing matches this")).toEqual([]);

    const [row] = await listConversations(t.scope, { filter: "ai" });
    expect(row.preview).toEqual({ role: "customer", content: "Do you do teeth whitening?" });
  });

  it("marks a conversation unread on a customer message and read when opened", async () => {
    const t = await setup("Inbox Unread");
    const id = await t.open("visitor-unread-0001", { unread: false });

    await customerSays(t.workspaceId, id, "Hello");
    expect((await inboxCounts(t.scope)).unread).toBe(1);
    expect((await listConversations(t.scope, { filter: "all" }))[0].unread).toBe(true);

    await getConversation(t.scope, id);
    expect((await inboxCounts(t.scope)).unread).toBe(0);
  });

  it("never lists another workspace's conversations", async () => {
    const a = await setup("Inbox Iso A");
    const b = await setup("Inbox Iso B");
    await b.open("visitor-b-00000002", { visitorName: "B customer" });
    expect(await listConversations(a.scope, { filter: "all" })).toEqual([]);
    expect(await listConversations(a.scope, { filter: "all", search: "B customer" })).toEqual([]);
    expect((await inboxCounts(a.scope)).all).toBe(0);
  });
});

describe("realtime events", () => {
  it("announces customer messages, AI replies and agent actions, scoped to the workspace", async () => {
    const a = await setup("Realtime A");
    const b = await setup("Realtime B");
    const id = await a.open("visitor-realtime-0001");

    const forB: ChatEvent[] = [];
    const stopB = subscribe((e) => {
      if (e.workspaceId === b.workspaceId) forB.push(e);
    });

    const chat = await capture(a.workspaceId, () => customerSays(a.workspaceId, id, "Hello"));
    expect(chat.filter((e) => e.type === "message")).toHaveLength(2); // customer + assistant
    expect(chat.every((e) => e.conversationId === id)).toBe(true);
    // Events carry ids only, never message text.
    expect(JSON.stringify(chat)).not.toContain("Hello");
    expect(JSON.stringify(chat)).not.toContain("AI reply");

    const takeover = await capture(a.workspaceId, () => takeOver(a.scope, id, a.agent));
    expect(takeover.map((e) => e.type)).toEqual(["message", "conversation"]);

    const reply = await capture(a.workspaceId, () => sendAgentMessage(a.scope, id, a.agent, "Hi from Sara"));
    expect(reply).toHaveLength(1);
    expect(reply[0]).toMatchObject({ type: "message", conversationId: id });

    stopB();
    expect(forB).toEqual([]);
  });
});

describe("widget live stream", () => {
  const VISITOR = "visitor_stream_0123456789";

  async function openStream(token: string, visitorId: string, conversationId: string) {
    const controller = new AbortController();
    const res = await widgetStream(
      new Request(`https://chat.example.com/api/widget/stream?visitorId=${visitorId}&conversationId=${conversationId}`, {
        headers: { authorization: `Bearer ${token}` },
        signal: controller.signal,
      }),
    );
    return { res, controller };
  }

  /** Read events until `count` non-ready ones have arrived. */
  async function read(res: Response, count: number) {
    const reader = res.body!.pipeThrough(new TextDecoderStream()).getReader();
    const out: { event: string; data: Record<string, unknown> }[] = [];
    let buffer = "";
    while (out.length < count) {
      const { done, value } = await reader.read();
      if (done) break;
      buffer += value;
      let end: number;
      while ((end = buffer.indexOf("\n\n")) !== -1) {
        const block = buffer.slice(0, end);
        buffer = buffer.slice(end + 2);
        const event = /event: (.*)/.exec(block)![1];
        if (event !== "ready" && event !== "ping") out.push({ event, data: JSON.parse(/data: (.*)/.exec(block)![1]) });
      }
    }
    return out;
  }

  it("delivers agent replies and takeover events to the visitor, without the agent's name", async () => {
    const t = await setup("Stream Flow");
    const id = await t.open(VISITOR);
    const { res, controller } = await openStream(createWidgetToken(t.workspaceId), VISITOR, id);
    expect(res.status).toBe(200);
    expect(res.headers.get("content-type")).toContain("text/event-stream");

    const pending = read(res, 3);
    await takeOver(t.scope, id, t.agent);
    await sendAgentMessage(t.scope, id, t.agent, "Hello, Sara here.");
    // An AI reply must NOT be sent on this stream (the widget already gets it on its own request).
    await t.db.message.create({ data: { workspaceId: t.workspaceId, conversationId: id, role: "assistant", content: "from the AI" } });
    await returnToAi(t.scope, id);

    const events = await pending;
    controller.abort();
    expect(events.map((e) => e.event)).toEqual(["event", "message", "event"]);
    expect(events[0].data).toMatchObject({ code: "agent_joined" });
    expect(JSON.stringify(events[0].data)).not.toContain("Sara Agent");
    expect(events[1].data).toMatchObject({ role: "agent", content: "Hello, Sara here." });
    expect(events[2].data).toMatchObject({ code: "returned_to_ai" });
  });

  it("refuses to open for someone else's conversation, another workspace, or without a token", async () => {
    const a = await setup("Stream Iso A");
    const b = await setup("Stream Iso B");
    const id = await a.open(VISITOR);

    expect((await openStream(createWidgetToken(a.workspaceId), "visitor_someone_else_0000", id)).res.status).toBe(404);
    expect((await openStream(createWidgetToken(b.workspaceId), VISITOR, id)).res.status).toBe(404);
    expect((await openStream("forged.token", VISITOR, id)).res.status).toBe(401);
  });
});

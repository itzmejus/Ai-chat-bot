import { beforeEach, describe, expect, it, vi } from "vitest";

/**
 * Fake embeddings with meaning: each topic word owns one dimension (within the
 * first 256, which is the part kept for question grouping), so messages about
 * the same topic are "similar" and different topics are not.
 */
const TOPICS = ["price", "hours", "parking", "insurance", "implant"];
const fakeEmbedding = (text: string) => {
  const v = Array(1536).fill(0);
  TOPICS.forEach((topic, i) => {
    if (text.toLowerCase().includes(topic)) v[i] = 1;
  });
  if (v.every((x) => x === 0)) v[200] = 1;
  return v;
};

const mocks = vi.hoisted(() => ({ embedTexts: vi.fn(), streamChat: vi.fn(), answered: true }));
vi.mock("@/server/ai/openai", async (original) => ({
  ...(await original<typeof import("@/server/ai/openai")>()),
  embedTexts: mocks.embedTexts,
  streamChat: mocks.streamChat,
}));
vi.mock("@/server/jobs/queue", () => ({ enqueueIngest: vi.fn(async () => {}) }));
// No one is signed in during tests.
vi.mock("@/server/auth/session", () => ({ getWorkspaceContext: async () => null }));

import { GET as exportRoute } from "@/app/api/leads/export/route";
import { answerMessage } from "@/server/ai/answer";
import { compactEmbedding, conversationsPerDay, groupQuestions, looksLikeQuestion, overviewCounts, questionInsights, startOfTodayInUae } from "@/server/analytics";
import { prisma } from "@/server/db/prisma";
import { tenantDb } from "@/server/db/tenant";
import { csvCell, leadCounts, leadsToCsv, listLeads, setLeadStatus } from "@/server/leads";
import { createTenant } from "./helpers";

beforeEach(() => {
  mocks.answered = true;
  mocks.embedTexts.mockReset().mockImplementation(async (texts: string[]) => texts.map(fakeEmbedding));
  mocks.streamChat.mockReset().mockImplementation(async function* () {
    yield JSON.stringify({ answered: mocks.answered, wants_human: false, name: null, phone: null, email: null }) + "\n";
    yield mocks.answered ? "Here is the answer." : "I don't have that information.";
  });
});

async function setup(name: string) {
  const t = await createTenant(name);
  const workspaceId = t.workspace.id;
  const db = tenantDb(workspaceId);
  /** A customer asks something in a brand-new conversation. */
  const ask = async (text: string, opts: { answered?: boolean; isTest?: boolean } = {}) => {
    mocks.answered = opts.answered ?? true;
    const conversation = await db.conversation.create({ data: { workspaceId, visitorId: `v-${Math.random().toString(36).slice(2)}-0000`, isTest: opts.isTest ?? false } });
    const stream = answerMessage({ workspaceId, conversationId: conversation.id, text });
    while (!(await stream.next()).done); // run the answer to completion
    return conversation.id;
  };
  return { ...t, workspaceId, db, ask };
}

describe("question grouping", () => {
  it("shrinks embeddings to 256 normalised dimensions", () => {
    const compact = compactEmbedding(Array.from({ length: 1536 }, (_, i) => (i < 3 ? 2 : 0)));
    expect(compact).toHaveLength(256);
    expect(Math.hypot(...compact)).toBeCloseTo(1, 6);
  });

  it("groups similar vectors and ranks groups by size", () => {
    const row = (content: string, vector: number[], minutesAgo: number) => ({ content, conversationId: content, createdAt: new Date(Date.now() - minutesAgo * 60_000), vector });
    const groups = groupQuestions([
      row("price now", [1, 0], 1),
      row("hours", [0, 1], 2),
      row("price earlier", [0.98, 0.2], 3),
      row("price oldest", [0.95, 0.31], 4),
    ]);
    expect(groups.map((g) => [g.text, g.count])).toEqual([
      ["price now", 3], // newest wording represents the group
      ["hours", 1],
    ]);
  });

  it("leaves out greetings and messages containing contact details", () => {
    expect(looksLikeQuestion("How much is teeth cleaning?")).toBe(true);
    expect(looksLikeQuestion("كم سعر تنظيف الأسنان؟")).toBe(true);
    expect(looksLikeQuestion("hi")).toBe(false);
    expect(looksLikeQuestion("I'd like to book. I'm Omar, my number is 050 123 4567")).toBe(false);
    expect(looksLikeQuestion("اسمي فاطمة ورقمي 0559876543")).toBe(false);
    expect(looksLikeQuestion("you can email me at omar@example.com")).toBe(false);
    expect(looksLikeQuestion("Do you have 2 or 3 branches in Dubai?")).toBe(true);
  });

  it("builds 'most asked' and 'unanswered' from real customer messages only", async () => {
    const t = await setup("Insights");
    await t.ask("What is the price of cleaning?");
    await t.ask("Cleaning price please?");
    const latestPrice = await t.ask("How much is the price for whitening?");
    await t.ask("What are your opening hours?");
    await t.ask("Do you have parking for patients?", { answered: false });
    const latestParking = await t.ask("Is parking free at the clinic?", { answered: false });
    await t.ask("hi"); // too short to be a question
    await t.ask("Is implant surgery available here?", { isTest: true, answered: false }); // dashboard test chat

    const { top, unanswered } = await questionInsights(t.workspaceId);

    expect(top.map((g) => [g.text, g.count])).toEqual([
      ["How much is the price for whitening?", 3],
      ["Is parking free at the clinic?", 2],
      ["What are your opening hours?", 1],
    ]);
    expect(top[0].conversationId).toBe(latestPrice);
    expect(unanswered.map((g) => [g.text, g.count])).toEqual([["Is parking free at the clinic?", 2]]);
    expect(unanswered[0].conversationId).toBe(latestParking);
    // The question row itself carries the "unanswered" mark.
    expect(await t.db.message.count({ where: { role: "customer", answered: false } })).toBe(3);
  });

  it("never mixes in another workspace's questions", async () => {
    const a = await setup("Insights Iso A");
    const b = await setup("Insights Iso B");
    await b.ask("What is the price of B's secret service?", { answered: false });

    expect(await questionInsights(a.workspaceId)).toEqual({ top: [], unanswered: [] });
    expect((await questionInsights(b.workspaceId)).top).toHaveLength(1);
  });
});

describe("overview numbers", () => {
  it("finds the start of the UAE day", () => {
    // 21:30 UTC on the 2nd is already 01:30 on the 3rd in Dubai.
    expect(startOfTodayInUae(new Date("2026-10-02T21:30:00Z")).toISOString()).toBe("2026-10-02T20:00:00.000Z");
    expect(startOfTodayInUae(new Date("2026-10-02T19:59:00Z")).toISOString()).toBe("2026-10-01T20:00:00.000Z");
  });

  it("counts conversations, today's conversations, leads and needs-human, excluding test chats", async () => {
    const t = await setup("Counts");
    const w = t.workspaceId;
    const yesterday = new Date(startOfTodayInUae().getTime() - 3 * 60 * 60 * 1000);
    await t.db.conversation.createMany({
      data: [
        { workspaceId: w, visitorId: "v-counts-000001", status: "ai" },
        { workspaceId: w, visitorId: "v-counts-000002", status: "needs_human" },
        { workspaceId: w, visitorId: "v-counts-000003", status: "human" },
        { workspaceId: w, visitorId: "v-counts-000004", status: "closed", createdAt: yesterday },
        { workspaceId: w, visitorId: "v-counts-000005", status: "needs_human", isTest: true },
      ],
    });
    await t.db.lead.createMany({ data: [{ workspaceId: w, name: "A", phone: "1" }, { workspaceId: w, name: "B", phone: "2", status: "contacted" }] });

    expect(await overviewCounts(t.db)).toEqual({
      total: 4,
      today: 3,
      leads: 2,
      newLeads: 1,
      needsHuman: 1,
      byStatus: { ai: 1, needs_human: 1, human: 1, closed: 1 },
    });
  });

  it("returns one row per day, including days with no conversations, for this workspace only", async () => {
    const a = await setup("Daily A");
    const b = await setup("Daily B");
    const day = 86_400_000;
    await a.db.conversation.createMany({
      data: [
        { workspaceId: a.workspaceId, visitorId: "v-daily-0000001" },
        { workspaceId: a.workspaceId, visitorId: "v-daily-0000002" },
        { workspaceId: a.workspaceId, visitorId: "v-daily-0000003", createdAt: new Date(Date.now() - 3 * day) },
        { workspaceId: a.workspaceId, visitorId: "v-daily-0000004", createdAt: new Date(Date.now() - 40 * day) }, // outside the window
        { workspaceId: a.workspaceId, visitorId: "v-daily-0000005", isTest: true },
      ],
    });
    await b.db.conversation.create({ data: { workspaceId: b.workspaceId, visitorId: "v-daily-b-00001" } });

    const days = await conversationsPerDay(a.workspaceId, 14);
    expect(days).toHaveLength(14);
    expect(days.at(-1)!.conversations).toBe(2); // today
    expect(days.at(-4)!.conversations).toBe(1); // three days ago
    expect(days.reduce((sum, d) => sum + d.conversations, 0)).toBe(3);
    expect(days.map((d) => d.day)).toEqual([...days.map((d) => d.day)].sort()); // oldest first
  });
});

describe("leads", () => {
  it("lists, filters, searches and counts leads of this workspace only", async () => {
    const a = await setup("Leads A");
    const b = await setup("Leads B");
    await a.db.lead.createMany({
      data: [
        { workspaceId: a.workspaceId, name: "Fatima Al Mansoori", phone: "+971501234567", email: "fatima@example.com" },
        { workspaceId: a.workspaceId, name: "Omar", phone: "+971559876543", status: "contacted" },
        { workspaceId: a.workspaceId, name: "Layla", email: "layla@example.com", status: "converted" },
      ],
    });
    await b.db.lead.create({ data: { workspaceId: b.workspaceId, name: "Fatima from B", phone: "+971500000000" } });

    expect(await leadCounts(a.db)).toEqual({ all: 3, new: 1, contacted: 1, converted: 1 });
    expect((await listLeads(a.db)).map((l) => l.name).sort()).toEqual(["Fatima Al Mansoori", "Layla", "Omar"]);
    expect((await listLeads(a.db, { status: "contacted" })).map((l) => l.name)).toEqual(["Omar"]);
    expect((await listLeads(a.db, { search: "fatima" })).map((l) => l.name)).toEqual(["Fatima Al Mansoori"]);
    expect((await listLeads(a.db, { search: "5598" })).map((l) => l.name)).toEqual(["Omar"]);
    expect((await listLeads(a.db, { search: "LAYLA@" })).map((l) => l.name)).toEqual(["Layla"]);
  });

  it("changes status only for leads of its own workspace", async () => {
    const a = await setup("Lead Status A");
    const b = await setup("Lead Status B");
    const mine = await a.db.lead.create({ data: { workspaceId: a.workspaceId, name: "Mine" } });
    const theirs = await b.db.lead.create({ data: { workspaceId: b.workspaceId, name: "Theirs" } });

    expect(await setLeadStatus(a.db, mine.id, "converted")).toBe(true);
    expect(await setLeadStatus(a.db, theirs.id, "converted")).toBe(false);
    expect((await prisma.lead.findUniqueOrThrow({ where: { id: theirs.id } })).status).toBe("new");
    expect((await prisma.lead.findUniqueOrThrow({ where: { id: mine.id } })).status).toBe("converted");
  });

  it("writes CSV that is safe to open in a spreadsheet", () => {
    expect(csvCell('He said "hi"')).toBe('"He said ""hi"""');
    expect(csvCell("line\nbreak, comma")).toBe('"line\nbreak, comma"');
    expect(csvCell(null)).toBe('""');
    // Values a spreadsheet would run as formulas are defused.
    expect(csvCell("=HYPERLINK(\"http://evil\",\"click\")")).toBe('"\'=HYPERLINK(""http://evil"",""click"")"');
    expect(csvCell("+971501234567")).toBe('"\'+971501234567"');
    expect(csvCell("@cmd")).toBe('"\'@cmd"');

    const csv = leadsToCsv(
      [{ id: "1", name: "فاطمة", phone: "+971501234567", email: null, status: "new", conversationId: "c1", createdAt: new Date("2026-10-02T08:00:00Z") }],
      (id) => `https://app.example.com/dashboard/inbox?c=${id}`,
    );
    expect(csv.startsWith("﻿")).toBe(true); // BOM so Excel reads Arabic correctly
    const [header, row] = csv.slice(1).trim().split("\r\n");
    expect(header).toBe('"Name","Phone","Email","Status","Date","Conversation"');
    expect(row).toBe('"فاطمة","\'+971501234567","","new","2026-10-02T08:00:00.000Z","https://app.example.com/dashboard/inbox?c=c1"');
  });

  it("refuses the export without a login", async () => {
    // No session in tests: the route must answer 401 rather than leak leads.
    const res = await exportRoute(new Request("https://app.example.com/api/leads/export"));
    expect(res.status).toBe(401);
  });
});

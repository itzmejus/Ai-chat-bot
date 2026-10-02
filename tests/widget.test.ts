import { beforeEach, describe, expect, it, vi } from "vitest";

// OpenAI is mocked: these tests are about the widget's gatekeeping, not the answers.
const mocks = vi.hoisted(() => ({ embedTexts: vi.fn(), streamChat: vi.fn() }));
vi.mock("@/server/ai/openai", async (original) => ({
  ...(await original<typeof import("@/server/ai/openai")>()),
  embedTexts: mocks.embedTexts,
  streamChat: mocks.streamChat,
}));
vi.mock("@/server/jobs/queue", () => ({ enqueueIngest: vi.fn(async () => {}) }));

import { GET as embed } from "@/app/embed/[key]/route";
import { POST as humanRoute } from "@/app/api/widget/human/route";
import { POST as messageRoute } from "@/app/api/widget/message/route";
import { POST as sessionRoute } from "@/app/api/widget/session/route";
import { POST as startRoute } from "@/app/api/widget/start/route";
import { frameAncestors, isOriginAllowed, normalizeDomain } from "@/lib/widget-domains";
import { tenantDb } from "@/server/db/tenant";
import { createWidgetToken, verifyWidgetToken } from "@/server/widget/token";
import { createTenant } from "./helpers";

beforeEach(() => {
  mocks.embedTexts.mockReset().mockImplementation(async (texts: string[]) => texts.map(() => Array(1536).fill(0.01)));
  mocks.streamChat.mockReset().mockImplementation(async function* () {
    yield '{"answered":true,"wants_human":false,"name":null,"phone":null,"email":null}\n';
    yield "Hello from the assistant.";
  });
});

const VISITOR = "visitor_0123456789abcdef";

/** Load the embed page as a browser would when `site` shows the widget in an iframe. */
async function loadEmbed(key: string, opts: { referer?: string; dest?: string; preview?: string } = {}) {
  const headers: Record<string, string> = { "sec-fetch-dest": opts.dest ?? "iframe" };
  if (opts.referer) headers.referer = opts.referer;
  const url = `https://chat.example.com/embed/${key}${opts.preview ? `?preview=${encodeURIComponent(opts.preview)}` : ""}`;
  const res = await embed(new Request(url, { headers }), { params: Promise.resolve({ key }) });
  const html = await res.text();
  const json = /<script type="application\/json" id="widget-config">(.*?)<\/script>/.exec(html)?.[1];
  return { status: res.status, csp: res.headers.get("content-security-policy") ?? "", html, config: json ? JSON.parse(json) : null };
}

function call(route: (r: Request) => Promise<Response>, token: string | null, body: unknown, ip = "203.0.113.5") {
  return route(
    new Request("https://chat.example.com/api/widget/x", {
      method: "POST",
      headers: { "content-type": "application/json", "x-forwarded-for": ip, ...(token ? { authorization: `Bearer ${token}` } : {}) },
      body: JSON.stringify(body),
    }),
  );
}

/** Read a whole SSE response into its events. */
async function events(res: Response) {
  const text = await res.text();
  return text
    .split("\n\n")
    .filter(Boolean)
    .map((block) => ({ event: /event: (.*)/.exec(block)![1], data: JSON.parse(/data: (.*)/.exec(block)![1]) }));
}

async function tenantWithDomains(name: string, domains: string[]) {
  const t = await createTenant(name);
  const db = tenantDb(t.workspace.id);
  await db.widgetSettings.updateMany({ data: { allowedDomains: domains } });
  return { ...t, db, key: t.workspace.publicKey, workspaceId: t.workspace.id };
}

describe("domain whitelist rules", () => {
  it("normalises what people type into bare domains", () => {
    expect(normalizeDomain("https://www.Shop.ae/contact?x=1")).toBe("shop.ae");
    expect(normalizeDomain("  blog.shop.ae  ")).toBe("blog.shop.ae");
    expect(normalizeDomain("http://localhost:5500/test.html")).toBe("localhost:5500");
    expect(normalizeDomain("localhost")).toBe("localhost");
    for (const bad of ["", "shop", "not a domain", "shop..ae", "*.shop.ae", "shop.ae:abc", "javascript:alert(1)", "-shop.ae"]) {
      expect(normalizeDomain(bad), bad).toBeNull();
    }
  });

  it("allows the listed domain and its subdomains, and nothing that merely looks similar", () => {
    const allowed = ["shop.ae", "localhost"];
    for (const ok of ["https://shop.ae", "https://www.shop.ae/page", "http://blog.shop.ae", "http://localhost:5500/test.html"]) {
      expect(isOriginAllowed(ok, allowed), ok).toBe(true);
    }
    for (const bad of ["https://evilshop.ae", "https://shop.ae.evil.com", "https://shop.com", "https://ae", "ftp://shop.ae", "null", "", "https://notlocalhost"]) {
      expect(isOriginAllowed(bad, allowed), bad).toBe(false);
    }
    expect(isOriginAllowed("https://shop.ae", [])).toBe(false);
    // An entry with a port only matches that port.
    expect(isOriginAllowed("http://localhost:5500", ["localhost:5500"])).toBe(true);
    expect(isOriginAllowed("http://localhost:3000", ["localhost:5500"])).toBe(false);
  });

  it("builds the frame-ancestors list", () => {
    expect(frameAncestors([])).toBe("'none'");
    expect(frameAncestors(["shop.ae"])).toBe("https://shop.ae https://*.shop.ae http://shop.ae http://*.shop.ae");
    expect(frameAncestors(["localhost"])).toBe("https://localhost:* http://localhost:*");
    expect(frameAncestors([], ["https://app.example.com"])).toBe("https://app.example.com");
  });
});

describe("widget tokens", () => {
  it("round-trips and rejects forged, altered or expired tokens", () => {
    const token = createWidgetToken("ws_1");
    expect(verifyWidgetToken(token)).toMatchObject({ w: "ws_1", preview: false });
    expect(verifyWidgetToken(createWidgetToken("ws_1", { preview: true }))?.preview).toBe(true);

    const [body, signature] = token.split(".");
    const forgedBody = Buffer.from(JSON.stringify({ w: "ws_2", preview: false, exp: 9999999999 })).toString("base64url");
    expect(verifyWidgetToken(`${forgedBody}.${signature}`)).toBeNull();
    expect(verifyWidgetToken(`${body}.${signature.slice(0, -2)}xx`)).toBeNull();
    expect(verifyWidgetToken(createWidgetToken("ws_1", { ttlSeconds: -10 }))).toBeNull();
    for (const junk of [null, undefined, "", "abc", "a.b.c"]) expect(verifyWidgetToken(junk)).toBeNull();
  });
});

describe("embed page (where the whitelist is enforced)", () => {
  it("serves the widget to a whitelisted site with a matching frame-ancestors policy", async () => {
    const t = await tenantWithDomains("Embed Allowed", ["shop.ae"]);
    const res = await loadEmbed(t.key, { referer: "https://www.shop.ae/" });

    expect(res.status).toBe(200);
    expect(res.csp).toContain("frame-ancestors https://shop.ae https://*.shop.ae");
    expect(res.csp).not.toContain("app.example.com");
    expect(res.config).toMatchObject({ key: t.key, businessName: "Embed Allowed", preview: false });
    expect(verifyWidgetToken(res.config.token)).toMatchObject({ w: t.workspaceId, preview: false });
    expect(res.html).toContain('src="/widget-app.js"');
  });

  it("refuses sites that are not on the list, and issues no token", async () => {
    const t = await tenantWithDomains("Embed Blocked", ["shop.ae"]);
    for (const referer of ["https://evil.com/", "https://shop.ae.evil.com/", "https://evilshop.ae/"]) {
      const res = await loadEmbed(t.key, { referer });
      expect(res.status, referer).toBe(403);
      expect(res.config).toBeNull();
      expect(res.html).not.toContain("token");
      expect(res.csp).toBe("frame-ancestors 'none'");
    }
  });

  it("refuses everything when no website has been approved", async () => {
    const t = await tenantWithDomains("Embed Empty", []);
    expect((await loadEmbed(t.key, { referer: "https://shop.ae/" })).status).toBe(403);
    expect((await loadEmbed(t.key)).status).toBe(403);
  });

  it("refuses being opened directly in a browser tab", async () => {
    const t = await tenantWithDomains("Embed Direct", ["shop.ae"]);
    expect((await loadEmbed(t.key, { dest: "document" })).status).toBe(403);
  });

  it("still sends frame-ancestors when the browser hides the referring page", async () => {
    const t = await tenantWithDomains("Embed NoReferer", ["shop.ae"]);
    const res = await loadEmbed(t.key);
    expect(res.status).toBe(200);
    expect(res.csp).toContain("frame-ancestors https://shop.ae");
  });

  it("returns 404 for unknown or malformed keys", async () => {
    expect((await loadEmbed("pk_00000000000000000000000000000000")).status).toBe(404);
    expect((await loadEmbed("../../etc/passwd")).status).toBe(404);
  });

  it("lets the dashboard preview frame it only with a preview token for the same workspace", async () => {
    const a = await tenantWithDomains("Embed Preview A", []);
    const b = await tenantWithDomains("Embed Preview B", []);

    const ok = await loadEmbed(a.key, { referer: "https://app.example.com/dashboard/widget", preview: createWidgetToken(a.workspaceId, { preview: true }) });
    expect(ok.status).toBe(200);
    expect(ok.csp).toContain("frame-ancestors https://app.example.com;");
    expect(ok.config).toMatchObject({ preview: true, previewOrigin: "https://app.example.com" });
    expect(verifyWidgetToken(ok.config.token)?.preview).toBe(true);

    // A preview opened from another dashboard address (www., the host's own domain) names that address.
    const www = await loadEmbed(a.key, { preview: createWidgetToken(a.workspaceId, { preview: true, origin: "https://www.app.example.com" }) });
    expect(www.csp).toContain("frame-ancestors https://www.app.example.com;");
    expect(www.csp).not.toContain("https://app.example.com");
    expect(www.config.previewOrigin).toBe("https://www.app.example.com");

    // Another workspace's preview token, or an ordinary chat token, does not unlock it.
    expect((await loadEmbed(a.key, { preview: createWidgetToken(b.workspaceId, { preview: true }) })).status).toBe(403);
    expect((await loadEmbed(a.key, { preview: createWidgetToken(a.workspaceId) })).status).toBe(403);
  });

  it("escapes business text so it cannot break out of the config block", async () => {
    const t = await tenantWithDomains("Embed </script><script>alert(1)</script>", ["shop.ae"]);
    const res = await loadEmbed(t.key, { referer: "https://shop.ae/" });
    expect(res.html).not.toContain("<script>alert(1)");
    expect(res.config.businessName).toBe("Embed </script><script>alert(1)</script>");
  });
});

describe("public chat API", () => {
  it("rejects calls without a valid token", async () => {
    for (const route of [messageRoute, sessionRoute, startRoute, humanRoute]) {
      expect((await call(route, null, { visitorId: VISITOR, text: "hi" })).status).toBe(401);
      expect((await call(route, "forged.token", { visitorId: VISITOR, text: "hi" })).status).toBe(401);
    }
    expect(mocks.streamChat).not.toHaveBeenCalled();
  });

  it("answers a message, creates the conversation, and restores it for the same visitor only", async () => {
    const t = await tenantWithDomains("Chat Basic", ["shop.ae"]);
    const token = createWidgetToken(t.workspaceId);

    const res = await call(messageRoute, token, { visitorId: VISITOR, text: "Hello" });
    expect(res.status).toBe(200);
    const stream = await events(res);
    expect(stream.map((e) => e.event)).toEqual(["conversation", "token", "done"]);
    const conversationId = stream[0].data.id as string;
    expect(stream[1].data.text).toBe("Hello from the assistant.");

    const conversation = await t.db.conversation.findUniqueOrThrow({ where: { id: conversationId } });
    expect(conversation).toMatchObject({ channel: "web", visitorId: VISITOR, isTest: false });

    const mine = await (await call(sessionRoute, token, { visitorId: VISITOR, conversationId })).json();
    expect(mine.messages.map((m: { role: string }) => m.role)).toEqual(["customer", "assistant"]);

    // Another visitor who somehow knows the conversation id gets nothing, and cannot post into it.
    const other = await (await call(sessionRoute, token, { visitorId: "visitor_someone_else_000", conversationId })).json();
    expect(other).toEqual({ conversationId: null, status: null, messages: [] });
    const hijack = await events(await call(messageRoute, token, { visitorId: "visitor_someone_else_000", conversationId, text: "hi" }, "203.0.113.9"));
    expect(hijack[0].data.id).not.toBe(conversationId);
    expect(await t.db.message.count({ where: { conversationId } })).toBe(2);
  });

  it("cannot reach another workspace's conversation with its own token", async () => {
    const a = await tenantWithDomains("Chat Cross A", ["a.ae"]);
    const b = await tenantWithDomains("Chat Cross B", ["b.ae"]);
    const bConversation = await b.db.conversation.create({ data: { workspaceId: b.workspaceId, visitorId: VISITOR } });
    await b.db.message.create({ data: { workspaceId: b.workspaceId, conversationId: bConversation.id, role: "customer", content: "B private" } });

    const session = await (await call(sessionRoute, createWidgetToken(a.workspaceId), { visitorId: VISITOR, conversationId: bConversation.id })).json();
    expect(session.messages).toEqual([]);
  });

  it("limits how fast one visitor can send messages", async () => {
    const t = await tenantWithDomains("Chat Limit", ["shop.ae"]);
    const token = createWidgetToken(t.workspaceId);
    const visitorId = "visitor_rate_limited_0001";
    const statuses: number[] = [];
    for (let i = 0; i < 14; i++) {
      const res = await call(messageRoute, token, { visitorId, text: `message ${i}` }, "203.0.113.77");
      statuses.push(res.status);
      await res.text();
    }
    expect(statuses.slice(0, 12).every((s) => s === 200)).toBe(true);
    expect(statuses.slice(12)).toEqual([429, 429]);
    expect(mocks.streamChat).toHaveBeenCalledTimes(12);
  });

  it("validates input", async () => {
    const t = await tenantWithDomains("Chat Invalid", ["shop.ae"]);
    const token = createWidgetToken(t.workspaceId);
    expect((await call(messageRoute, token, { visitorId: "short", text: "hi" })).status).toBe(400);
    expect((await call(messageRoute, token, { visitorId: VISITOR, text: "" })).status).toBe(400);
    expect((await call(messageRoute, token, { visitorId: VISITOR, text: "x".repeat(2001) })).status).toBe(400);
    expect((await call(startRoute, token, { visitorId: VISITOR, name: "Ali", phone: "not a phone" })).status).toBe(400);
  });

  it("requires the pre-chat form when the business turned it on, and records the lead", async () => {
    const t = await tenantWithDomains("Chat Form", ["shop.ae"]);
    await t.db.widgetSettings.updateMany({ data: { preChatForm: true } });
    const token = createWidgetToken(t.workspaceId);

    const blocked = await call(messageRoute, token, { visitorId: VISITOR, text: "Hello" });
    expect(blocked.status).toBe(400);
    expect(await blocked.json()).toEqual({ error: "form_required" });

    const started = await (await call(startRoute, token, { visitorId: VISITOR, name: "Fatima", phone: "+971 50 123 4567" })).json();
    expect(await t.db.lead.findMany()).toMatchObject([{ name: "Fatima", phone: "+971 50 123 4567", conversationId: started.conversationId }]);

    const res = await call(messageRoute, token, { visitorId: VISITOR, conversationId: started.conversationId, text: "Hello" });
    expect(res.status).toBe(200);
    await res.text();
  });

  it("flags the conversation when the visitor asks for a human, in their language", async () => {
    const t = await tenantWithDomains("Chat Human", ["shop.ae"]);
    const token = createWidgetToken(t.workspaceId);

    const body = await (await call(humanRoute, token, { visitorId: VISITOR, locale: "ar" })).json();
    expect(body.message.content).toMatch(/[؀-ۿ]/);
    expect(await t.db.conversation.findUniqueOrThrow({ where: { id: body.conversationId } })).toMatchObject({ status: "needs_human", unread: true });
    expect(mocks.streamChat).not.toHaveBeenCalled();
  });

  it("marks dashboard preview chats as tests and keeps them out of leads", async () => {
    const t = await tenantWithDomains("Chat Preview", []);
    await t.db.widgetSettings.updateMany({ data: { preChatForm: true } });
    const token = createWidgetToken(t.workspaceId, { preview: true });

    const started = await (await call(startRoute, token, { visitorId: VISITOR, name: "Owner", phone: "+971500000000" })).json();
    expect((await t.db.conversation.findUniqueOrThrow({ where: { id: started.conversationId } })).isTest).toBe(true);
    expect(await t.db.lead.count()).toBe(0);
  });
});

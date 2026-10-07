import bcrypt from "bcryptjs";
import { beforeEach, describe, expect, it, vi } from "vitest";

// OpenAI is mocked: the seed must work end to end without the network.
const mocks = vi.hoisted(() => ({ embedTexts: vi.fn() }));
vi.mock("@/server/ai/openai", async (original) => ({
  ...(await original<typeof import("@/server/ai/openai")>()),
  embedTexts: mocks.embedTexts,
}));

import { DEMO_EMAIL, DEMO_PUBLIC_KEY, seedDemo } from "../prisma/demo";
import { GET as embed } from "@/app/embed/[key]/route";
import { questionInsights } from "@/server/analytics";
import { searchChunks } from "@/server/db/chunks";
import { prisma } from "@/server/db/prisma";
import { tenantDb } from "@/server/db/tenant";
import { createTenant } from "./helpers";

beforeEach(() => {
  mocks.embedTexts.mockReset().mockImplementation(async (texts: string[]) => texts.map((_, i) => Array.from({ length: 1536 }, (_, d) => (d === i % 1536 ? 1 : 0.001))));
});

describe("demo seed", () => {
  it("creates the dental clinic with a processed knowledge base, chats and leads", async () => {
    const result = await seedDemo({ password: "demo-password" });
    const db = tenantDb(result.workspaceId);

    const user = await prisma.user.findUniqueOrThrow({ where: { email: DEMO_EMAIL } });
    expect(await bcrypt.compare("demo-password", user.passwordHash!)).toBe(true);
    expect(await db.membership.findFirst({ where: { userId: user.id } })).toMatchObject({ role: "owner" });

    // English and Arabic FAQs plus the notes, all embedded.
    const sources = await db.knowledgeSource.findMany();
    expect(result.sources).toEqual({ ready: sources.length, failed: 0 });
    expect(sources.filter((s) => s.type === "faq" && /[؀-ۿ]/.test(s.title)).length).toBeGreaterThanOrEqual(5);
    expect(sources.filter((s) => s.type === "faq" && /^[A-Za-z]/.test(s.title)).length).toBeGreaterThanOrEqual(5);
    expect(sources.some((s) => s.type === "notes")).toBe(true);
    // Services the assistant can show as cards.
    expect(await db.product.count()).toBe(result.products);
    expect(result.products).toBeGreaterThanOrEqual(5);
    const found = await searchChunks(result.workspaceId, Array(1536).fill(0.01), 50);
    expect(found.length).toBeGreaterThanOrEqual(sources.length);

    // Every inbox status is represented, and nothing is dated in the future.
    const conversations = await db.conversation.findMany();
    expect(new Set(conversations.map((c) => c.status))).toEqual(new Set(["ai", "needs_human", "human", "closed"]));
    expect(conversations.every((c) => c.lastMessageAt.getTime() <= Date.now() && !c.isTest)).toBe(true);
    expect(await db.lead.count()).toBe(result.leads);
    expect(new Set((await db.lead.findMany()).map((l) => l.status))).toEqual(new Set(["new", "contacted", "converted"]));

    // The overview's question lists have data.
    const insights = await questionInsights(result.workspaceId);
    expect(insights.top.length).toBeGreaterThan(0);
    expect(insights.unanswered.length).toBeGreaterThan(0);
  });

  it("makes the sample test page work: the widget loads on localhost with the fixed key", async () => {
    await seedDemo({ password: "demo-password" });
    const load = (referer: string) =>
      embed(new Request(`https://chat.example.com/embed/${DEMO_PUBLIC_KEY}`, { headers: { "sec-fetch-dest": "iframe", referer } }), {
        params: Promise.resolve({ key: DEMO_PUBLIC_KEY }),
      });
    expect((await load("http://localhost:5500/test-page.html")).status).toBe(200);
    expect((await load("https://another-site.example/")).status).toBe(403);
  });

  it("can be run again, and leaves other workspaces alone", async () => {
    const other = await createTenant("Other Business");
    await tenantDb(other.workspace.id).conversation.create({ data: { workspaceId: other.workspace.id, visitorId: "v1" } });

    const first = await seedDemo({ password: "demo-password" });
    const second = await seedDemo({ password: "another-password" });

    expect(second.workspaceId).not.toBe(first.workspaceId);
    expect(await prisma.workspace.count({ where: { publicKey: DEMO_PUBLIC_KEY } })).toBe(1);
    expect(await prisma.user.count({ where: { email: DEMO_EMAIL } })).toBe(1);
    expect(await prisma.conversation.count({ where: { workspaceId: first.workspaceId } })).toBe(0);
    expect(await tenantDb(other.workspace.id).conversation.count()).toBe(1);
    expect(await prisma.user.count({ where: { id: other.user.id } })).toBe(1);
  });

  it("without an OpenAI key stores the sources as failed so they can be re-synced", async () => {
    const result = await seedDemo({ password: "demo-password", embed: false });
    expect(mocks.embedTexts).not.toHaveBeenCalled();
    expect(result.sources.ready).toBe(0);
    expect(result.sources.failed).toBeGreaterThan(0);
    expect(await tenantDb(result.workspaceId).knowledgeSource.count({ where: { error: "openaiKey" } })).toBe(result.sources.failed);
  });
});

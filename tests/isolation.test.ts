import { beforeAll, describe, expect, it } from "vitest";
import { prisma } from "@/server/db/prisma";
import { tenantDb } from "@/server/db/tenant";
import { createTenant } from "./helpers";

/**
 * Proves that the tenant layer cannot read or change another workspace's data,
 * even when the caller knows the other workspace's record ids.
 */
describe("workspace data isolation", () => {
  let a: Awaited<ReturnType<typeof createTenant>>;
  let b: Awaited<ReturnType<typeof createTenant>>;
  let dbA: ReturnType<typeof tenantDb>;
  let dbB: ReturnType<typeof tenantDb>;
  let bSourceId: string;
  let bConversationId: string;
  let bLeadId: string;

  beforeAll(async () => {
    a = await createTenant("Alpha Clinic");
    b = await createTenant("Beta Salon");
    dbA = tenantDb(a.workspace.id);
    dbB = tenantDb(b.workspace.id);

    await dbA.knowledgeSource.create({
      data: { workspaceId: a.workspace.id, type: "faq", title: "A question", content: "A answer" },
    });
    const source = await dbB.knowledgeSource.create({
      data: { workspaceId: b.workspace.id, type: "faq", title: "B secret price list", content: "B answer" },
    });
    const conversation = await dbB.conversation.create({
      data: { workspaceId: b.workspace.id, visitorId: "visitor-b" },
    });
    await dbB.message.create({
      data: { workspaceId: b.workspace.id, conversationId: conversation.id, role: "customer", content: "B message" },
    });
    const lead = await dbB.lead.create({
      data: { workspaceId: b.workspace.id, conversationId: conversation.id, name: "B lead", phone: "+971500000000" },
    });
    bSourceId = source.id;
    bConversationId = conversation.id;
    bLeadId = lead.id;
  });

  it("lists only the current workspace's records", async () => {
    const sources = await dbA.knowledgeSource.findMany();
    expect(sources).toHaveLength(1);
    expect(sources.every((s) => s.workspaceId === a.workspace.id)).toBe(true);

    expect(await dbA.conversation.count()).toBe(0);
    expect(await dbA.message.count()).toBe(0);
    expect(await dbA.lead.findMany()).toEqual([]);
    expect(await dbB.lead.count()).toBe(1);
  });

  it("cannot fetch another workspace's record by id", async () => {
    expect(await dbA.knowledgeSource.findUnique({ where: { id: bSourceId } })).toBeNull();
    expect(await dbA.conversation.findFirst({ where: { id: bConversationId } })).toBeNull();
    expect(await dbA.message.findMany({ where: { conversationId: bConversationId } })).toEqual([]);
    // Sanity check: the owner can.
    expect(await dbB.knowledgeSource.findUnique({ where: { id: bSourceId } })).not.toBeNull();
  });

  it("ignores a caller-supplied workspaceId filter for another workspace", async () => {
    const leaked = await dbA.lead.findMany({ where: { workspaceId: b.workspace.id } });
    expect(leaked).toEqual([]);
  });

  it("cannot update or delete another workspace's records", async () => {
    await expect(dbA.lead.update({ where: { id: bLeadId }, data: { status: "converted" } })).rejects.toThrow();
    await expect(dbA.lead.delete({ where: { id: bLeadId } })).rejects.toThrow();
    expect((await dbA.lead.updateMany({ where: { id: bLeadId }, data: { name: "hacked" } })).count).toBe(0);
    expect((await dbA.knowledgeSource.deleteMany({ where: { id: bSourceId } })).count).toBe(0);

    const lead = await prisma.lead.findUniqueOrThrow({ where: { id: bLeadId } });
    expect(lead).toMatchObject({ name: "B lead", status: "new" });
  });

  it("forces new records into the current workspace", async () => {
    const created = await dbA.lead.create({ data: { workspaceId: b.workspace.id, name: "Spoofed" } });
    expect(created.workspaceId).toBe(a.workspace.id);

    await dbA.lead.createMany({ data: [{ workspaceId: b.workspace.id, name: "Bulk spoof" }] });
    expect(await dbB.lead.count()).toBe(1);
  });

  it("cannot move a record to another workspace", async () => {
    const lead = await dbA.lead.findFirstOrThrow();
    const updated = await dbA.lead.update({
      where: { id: lead.id },
      data: { workspaceId: b.workspace.id, name: "Renamed" },
    });
    expect(updated.workspaceId).toBe(a.workspace.id);
  });

  it("cannot overwrite another workspace's settings through upsert", async () => {
    const bSettings = await dbB.widgetSettings.findFirstOrThrow();
    // The row exists but is invisible to A, so the upsert tries to create and hits the unique id.
    await expect(
      dbA.widgetSettings.upsert({
        where: { id: bSettings.id },
        update: { brandColor: "#000000" },
        create: { id: bSettings.id, workspaceId: a.workspace.id, brandColor: "#000000" },
      }),
    ).rejects.toThrow();
    expect((await dbB.widgetSettings.findFirstOrThrow()).brandColor).toBe(bSettings.brandColor);
  });

  it("scopes the workspace row itself and hides other members", async () => {
    const workspaces = await dbA.workspace.findMany();
    expect(workspaces.map((w) => w.id)).toEqual([a.workspace.id]);
    await expect(dbA.workspace.update({ where: { id: b.workspace.id }, data: { name: "hacked" } })).rejects.toThrow();

    const members = await dbA.membership.findMany();
    expect(members.map((m) => m.userId)).toEqual([a.user.id]);
  });

  it("refuses global models", async () => {
    await expect(dbA.user.findMany()).rejects.toThrow(/not a workspace-scoped model/);
    expect(() => tenantDb("")).toThrow();
  });
});

describe("workspace creation", () => {
  it("creates the owner membership and default settings", async () => {
    const { user, workspace } = await createTenant("Gamma Rentals");
    const db = tenantDb(workspace.id);

    expect(workspace.publicKey).toMatch(/^pk_[0-9a-f]{32}$/);
    expect(workspace.planId).toBe("free");
    expect(await db.membership.findMany()).toMatchObject([{ userId: user.id, role: "owner" }]);
    expect(await db.assistantSettings.count()).toBe(1);
    expect((await db.widgetSettings.findFirstOrThrow()).allowedDomains).toEqual(["gamma-rentals.ae"]);
    expect((await db.notificationSettings.findFirstOrThrow()).emails).toEqual([user.email]);
  });
});

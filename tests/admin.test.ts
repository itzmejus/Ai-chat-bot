import { beforeEach, describe, expect, it, vi } from "vitest";

const fakes = vi.hoisted(() => ({
  currentUser: null as null | { id: string; email: string; emailVerifiedAt: Date | null },
  retrieveModel: vi.fn(async () => ({})),
  queue: vi.fn(async () => ({ ready: 0, active: 0, failed: 0, workerInProcess: true })),
}));
vi.mock("@/server/auth/session", () => ({ getCurrentUser: async () => fakes.currentUser }));
vi.mock("@/server/ai/openai", async (original) => ({
  ...(await original<typeof import("@/server/ai/openai")>()),
  getOpenAI: () => ({ models: { retrieve: fakes.retrieveModel } }),
}));
vi.mock("@/server/jobs/queue", () => ({ ingestQueueStatus: fakes.queue }));

import { isAdmin, requireAdmin } from "@/server/admin/access";
import { adminOverview, adminUsers, adminWorkspaces } from "@/server/admin/data";
import { runHealthChecks } from "@/server/admin/health";
import { prisma } from "@/server/db/prisma";
import { currentMonth } from "@/server/limits/usage";
import { createTenant } from "./helpers";

beforeEach(() => {
  vi.stubEnv("ADMIN_EMAILS", " Boss@Example.com , ops@example.com");
  fakes.currentUser = null;
});

const confirmed = new Date("2026-10-01T00:00:00Z");

describe("admin access", () => {
  it("is only for listed addresses that have been confirmed", () => {
    expect(isAdmin({ email: "boss@example.com", emailVerifiedAt: confirmed })).toBe(true);
    expect(isAdmin({ email: "OPS@example.com", emailVerifiedAt: confirmed })).toBe(true);
    expect(isAdmin({ email: "boss@example.com", emailVerifiedAt: null })).toBe(false);
    expect(isAdmin({ email: "owner@example.com", emailVerifiedAt: confirmed })).toBe(false);
    expect(isAdmin(null)).toBe(false);
    vi.stubEnv("ADMIN_EMAILS", "");
    expect(isAdmin({ email: "boss@example.com", emailVerifiedAt: confirmed })).toBe(false);
  });

  it("answers 404 to everyone else", async () => {
    fakes.currentUser = { id: "u1", email: "owner@example.com", emailVerifiedAt: confirmed };
    await expect(requireAdmin()).rejects.toThrow(/NEXT_HTTP_ERROR_FALLBACK;404|NEXT_NOT_FOUND/);
    fakes.currentUser = { id: "u2", email: "boss@example.com", emailVerifiedAt: confirmed };
    await expect(requireAdmin()).resolves.toMatchObject({ email: "boss@example.com" });
  });
});

async function subscribe(workspaceId: string, planId: string, billingStatus: string, extra: object = {}) {
  await prisma.workspace.update({
    where: { id: workspaceId },
    data: { planId, billingStatus, dodoCustomerId: `cus_${workspaceId}`, dodoSubscriptionId: `sub_${workspaceId}`, ...extra },
  });
}

describe("admin figures", () => {
  it("counts users, paying workspaces, revenue and payment problems", async () => {
    const before = await adminOverview();

    const a = await createTenant("Paying Starter");
    const b = await createTenant("Paying Growth");
    const c = await createTenant("Late Payer");
    const d = await createTenant("On Hold");
    await subscribe(a.workspace.id, "starter", "active");
    await subscribe(b.workspace.id, "growth", "active", { cancelAtPeriodEnd: true });
    await subscribe(c.workspace.id, "pro", "past_due");
    await subscribe(d.workspace.id, "free", "on_hold");
    await prisma.usageCounter.create({ data: { workspaceId: a.workspace.id, month: currentMonth(), aiMessages: 42 } });

    const after = await adminOverview();
    expect(after.users.total - before.users.total).toBe(4);
    expect(after.users.last7 - before.users.last7).toBe(4);
    expect(after.paying.total - before.paying.total).toBe(3); // on hold is not paying
    expect(after.paying.mrr - before.paying.mrr).toBe(19 + 49 + 149);
    expect(after.paying.cancelling - before.paying.cancelling).toBe(1);
    expect(after.issues.map((w) => w.name)).toEqual(expect.arrayContaining(["Late Payer", "On Hold"]));
    expect(after.activity.aiMessagesThisMonth - before.activity.aiMessagesThisMonth).toBe(42);
  });

  it("searches users and shows their workspaces", async () => {
    const { user } = await createTenant("Searchable Salon");
    await prisma.user.update({ where: { id: user.id }, data: { name: "Mariam Searchable" } });

    const { total, rows } = await adminUsers({ q: "searchable mariam" });
    expect(total).toBe(0); // the search is one phrase, not separate words
    const found = await adminUsers({ q: "searchable" });
    expect(found.rows).toHaveLength(1);
    expect(found.rows[0]).toMatchObject({ name: "Mariam Searchable", signIn: "google" });
    expect(found.rows[0].memberships[0]).toMatchObject({ role: "owner", workspace: { name: "Searchable Salon", planId: "free" } });
    expect(rows).toEqual([]);
    expect(found.rows[0]).not.toHaveProperty("passwordHash");
  });

  it("filters workspaces by subscription and finds them by owner email", async () => {
    const paying = await createTenant("Filter Paying");
    const late = await createTenant("Filter Late");
    await createTenant("Filter Free");
    await subscribe(paying.workspace.id, "growth", "active");
    await subscribe(late.workspace.id, "starter", "past_due");

    const names = async (filter: "all" | "paying" | "free" | "issues") => (await adminWorkspaces({ q: "filter", filter })).rows.map((w) => w.name).sort();
    expect(await names("all")).toEqual(["Filter Free", "Filter Late", "Filter Paying"]);
    expect(await names("paying")).toEqual(["Filter Late", "Filter Paying"]);
    expect(await names("issues")).toEqual(["Filter Late"]);
    expect(await names("free")).toEqual(["Filter Free"]);

    const byOwner = await adminWorkspaces({ q: paying.user.email });
    expect(byOwner.rows).toHaveLength(1);
    expect(byOwner.rows[0]).toMatchObject({ name: "Filter Paying", ownerEmail: paying.user.email, aiMessages: 0, _count: { memberships: 1 } });
  });
});

describe("health checks", () => {
  const byName = async () => Object.fromEntries((await runHealthChecks()).map((c) => [c.name, c]));

  it("reports working, missing and optional services", async () => {
    const checks = await byName();
    expect(checks["Database"].status).toBe("ok");
    expect(checks["OpenAI"].status).toBe("ok");
    expect(checks["Payments (Dodo)"].status).toBe("off");
    expect(checks["Email (SMTP)"].status).toBe("warn");
    expect(checks["Background jobs"].status).toBe("ok");
    expect(checks["WhatsApp alerts"].status).toBe("off");
  });

  it("shows a failing service as down with the reason, without breaking the others", async () => {
    fakes.retrieveModel.mockRejectedValueOnce(new Error("401 Incorrect API key provided"));
    fakes.queue.mockResolvedValueOnce({ ready: 50, active: 1, failed: 2, workerInProcess: false });

    const checks = await byName();
    expect(checks["OpenAI"]).toMatchObject({ status: "down", detail: "401 Incorrect API key provided" });
    expect(checks["Background jobs"].status).toBe("warn");
    expect(checks["Background jobs"].detail).toMatch(/50 jobs waiting/);
    expect(checks["Database"].status).toBe("ok");
  });
});

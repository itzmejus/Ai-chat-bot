import { SITE_PLANS } from "@/content/site";
import type { Prisma } from "@/generated/prisma/client";
import { prisma } from "@/server/db/prisma";
import { currentMonth } from "@/server/limits/usage";

/**
 * Figures for the admin area. This is the one place that reads across every workspace, so it
 * uses the global Prisma client on purpose; it is only reachable through requireAdmin().
 */

const DAY = 24 * 60 * 60 * 1000;
export const PAGE_SIZE = 50;

/** Statuses of a subscription that is still being paid for. */
const PAYING = ["active", "past_due"];
const ISSUES = ["past_due", "on_hold"];

const priceOf = (planId: string) => SITE_PLANS.find((p) => p.id === planId)?.price ?? 0;

export async function adminOverview(now = new Date()) {
  const since = (days: number) => new Date(now.getTime() - days * DAY);
  const month = currentMonth(now);

  const [users, users7, users30, verified, workspaces, byPlan, paying, issues, cancelling, usage, conversations30, leads30, recentUsers] = await Promise.all([
    prisma.user.count(),
    prisma.user.count({ where: { createdAt: { gte: since(7) } } }),
    prisma.user.count({ where: { createdAt: { gte: since(30) } } }),
    prisma.user.count({ where: { emailVerifiedAt: { not: null } } }),
    prisma.workspace.count(),
    prisma.workspace.groupBy({ by: ["planId"], _count: true }),
    prisma.workspace.groupBy({ by: ["planId"], _count: true, where: { dodoSubscriptionId: { not: null }, billingStatus: { in: PAYING } } }),
    prisma.workspace.findMany({
      where: { billingStatus: { in: ISSUES } },
      select: { id: true, name: true, planId: true, billingStatus: true, billingPeriodEnd: true },
      orderBy: { billingEventAt: "desc" },
    }),
    prisma.workspace.count({ where: { cancelAtPeriodEnd: true, dodoSubscriptionId: { not: null } } }),
    prisma.usageCounter.aggregate({ where: { month }, _sum: { aiMessages: true } }),
    prisma.conversation.count({ where: { isTest: false, createdAt: { gte: since(30) } } }),
    prisma.lead.count({ where: { createdAt: { gte: since(30) } } }),
    prisma.user.findMany({
      orderBy: { createdAt: "desc" },
      take: 8,
      select: { id: true, email: true, name: true, createdAt: true, emailVerifiedAt: true, memberships: { select: { workspace: { select: { name: true } } } } },
    }),
  ]);

  const payingCount = paying.reduce((sum, row) => sum + row._count, 0);
  return {
    users: { total: users, last7: users7, last30: users30, verified },
    workspaces: { total: workspaces, byPlan: Object.fromEntries(byPlan.map((row) => [row.planId, row._count])) as Record<string, number> },
    paying: {
      total: payingCount,
      byPlan: Object.fromEntries(paying.map((row) => [row.planId, row._count])) as Record<string, number>,
      // List price before VAT and Dodo's fee: a guide, not the payout.
      mrr: paying.reduce((sum, row) => sum + row._count * priceOf(row.planId), 0),
      cancelling,
    },
    issues,
    activity: { aiMessagesThisMonth: usage._sum.aiMessages ?? 0, conversations30: conversations30, leads30 },
    recentUsers,
  };
}

const pageArgs = (page: number) => ({ skip: (Math.max(1, page) - 1) * PAGE_SIZE, take: PAGE_SIZE });

export async function adminUsers({ q = "", page = 1 }: { q?: string; page?: number }) {
  const search = q.trim();
  const where: Prisma.UserWhereInput = search
    ? { OR: [{ email: { contains: search, mode: "insensitive" } }, { name: { contains: search, mode: "insensitive" } }] }
    : {};
  const [total, rows] = await Promise.all([
    prisma.user.count({ where }),
    prisma.user.findMany({
      where,
      orderBy: { createdAt: "desc" },
      ...pageArgs(page),
      select: {
        id: true,
        email: true,
        name: true,
        createdAt: true,
        emailVerifiedAt: true,
        passwordHash: true,
        signupSource: true,
        memberships: { select: { role: true, workspace: { select: { id: true, name: true, planId: true, billingStatus: true } } } },
      },
    }),
  ]);
  return {
    total,
    rows: rows.map(({ passwordHash, ...user }) => ({ ...user, signIn: passwordHash ? ("password" as const) : ("google" as const) })),
  };
}

export type WorkspaceFilter = "all" | "paying" | "free" | "issues";

export async function adminWorkspaces({ q = "", filter = "all", page = 1 }: { q?: string; filter?: WorkspaceFilter; page?: number }) {
  const search = q.trim();
  const where: Prisma.WorkspaceWhereInput = {
    ...(search && {
      OR: [
        { name: { contains: search, mode: "insensitive" } },
        { websiteUrl: { contains: search, mode: "insensitive" } },
        { memberships: { some: { user: { email: { contains: search, mode: "insensitive" } } } } },
      ],
    }),
    ...(filter === "paying" && { dodoSubscriptionId: { not: null }, billingStatus: { in: PAYING } }),
    ...(filter === "free" && { planId: "free" }),
    ...(filter === "issues" && { billingStatus: { in: ISSUES } }),
  };
  const [total, rows] = await Promise.all([
    prisma.workspace.count({ where }),
    prisma.workspace.findMany({
      where,
      orderBy: { createdAt: "desc" },
      ...pageArgs(page),
      select: {
        id: true,
        name: true,
        industry: true,
        websiteUrl: true,
        createdAt: true,
        plan: { select: { name: true, monthlyMessages: true } },
        billingStatus: true,
        billingPeriodEnd: true,
        cancelAtPeriodEnd: true,
        memberships: { where: { role: "owner" }, take: 1, select: { user: { select: { email: true } } } },
        _count: { select: { memberships: true, sources: true, conversations: true, leads: true } },
      },
    }),
  ]);

  const usage = await prisma.usageCounter.findMany({
    where: { month: currentMonth(), workspaceId: { in: rows.map((row) => row.id) } },
    select: { workspaceId: true, aiMessages: true },
  });
  const used = new Map(usage.map((row) => [row.workspaceId, row.aiMessages]));

  return {
    total,
    rows: rows.map(({ memberships, ...ws }) => ({ ...ws, ownerEmail: memberships[0]?.user.email ?? null, aiMessages: used.get(ws.id) ?? 0 })),
  };
}

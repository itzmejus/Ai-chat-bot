import type { TenantDb } from "@/server/db/tenant";

/** Usage is tracked per workspace per calendar month (UTC), e.g. "2026-10". */
export const currentMonth = (now = new Date()) => now.toISOString().slice(0, 7);

export async function getAiMessagesUsed(db: TenantDb, month = currentMonth()): Promise<number> {
  const row = await db.usageCounter.findFirst({ where: { month }, select: { aiMessages: true } });
  return row?.aiMessages ?? 0;
}

/** Count one AI reply against this month's allowance. */
export async function recordAiMessage(db: TenantDb, workspaceId: string, month = currentMonth()) {
  await db.usageCounter.upsert({
    where: { workspaceId_month: { workspaceId, month } },
    create: { workspaceId, month, aiMessages: 1 },
    update: { aiMessages: { increment: 1 } },
  });
}

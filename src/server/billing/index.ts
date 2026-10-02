import { prisma } from "@/server/db/prisma";

/**
 * Billing placeholder.
 *
 * Plans and their limits already exist (the `Plan` table) and are enforced:
 * monthly AI messages, knowledge pages and team size. What is NOT built yet is
 * payment. When Stripe is added, this file is where it goes:
 *
 *   1. `startCheckout(workspaceId, planId)` creates a Stripe Checkout session
 *      and returns its URL; the Settings page sends the owner there.
 *   2. A webhook route (`/api/billing/webhook`) verifies Stripe's signature and,
 *      on `checkout.session.completed` / `customer.subscription.updated|deleted`,
 *      calls `setWorkspacePlan()` below.
 *   3. `Workspace` gains `stripeCustomerId` and `stripeSubscriptionId` columns.
 *
 * Nothing outside this file should need to change: every limit check reads
 * `workspace.plan`.
 */

export const listPlans = () => prisma.plan.findMany({ orderBy: { monthlyMessages: "asc" } });

/**
 * Until payments exist, plans can only be switched by hand. Setting
 * ALLOW_FREE_PLAN_CHANGE=true lets a workspace owner switch plan from Settings
 * without paying: useful for development and demos, never for production.
 */
export const freePlanChangeAllowed = () => process.env.ALLOW_FREE_PLAN_CHANGE === "true";

/** The single place a workspace's plan is changed. The Stripe webhook will call this. */
export async function setWorkspacePlan(workspaceId: string, planId: string): Promise<boolean> {
  const plan = await prisma.plan.findUnique({ where: { id: planId }, select: { id: true } });
  if (!plan) return false;
  await prisma.workspace.update({ where: { id: workspaceId }, data: { planId } });
  return true;
}

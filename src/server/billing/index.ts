import DodoPayments from "dodopayments";
import type { Subscription } from "dodopayments/resources/subscriptions";
import { APP_URL } from "@/lib/config";
import { prisma } from "@/server/db/prisma";

/**
 * Billing through Dodo Payments, which is the merchant of record: it runs the checkout, charges
 * the card every month, adds VAT/sales tax and handles invoices and refunds.
 *
 *   1. `startCheckout()` sends a workspace owner to Dodo's hosted checkout for a paid plan, or,
 *      when the workspace already pays, moves its subscription to the new plan.
 *   2. Dodo calls `/api/billing/webhook` whenever a subscription changes; `applySubscriptionEvent()`
 *      sets the workspace's plan from it. The webhook is the only thing that grants a paid plan.
 *   3. `billingPortalUrl()` opens Dodo's customer portal: cancel, change card, download invoices.
 *
 * Every limit check reads `workspace.plan`, so nothing outside this file needs to know about Dodo.
 *
 * Configuration (see .env.example): DODO_PAYMENTS_API_KEY, DODO_PAYMENTS_WEBHOOK_KEY,
 * DODO_PAYMENTS_ENVIRONMENT and one product ID per paid plan (DODO_PRODUCT_STARTER, ...).
 */

export const listPlans = () => prisma.plan.findMany({ orderBy: { monthlyMessages: "asc" } });

/**
 * Before payments are configured, plans can only be switched by hand. Setting
 * ALLOW_FREE_PLAN_CHANGE=true lets a workspace owner switch plan from Settings
 * without paying: useful for development and demos, never for production.
 */
export const freePlanChangeAllowed = () => process.env.ALLOW_FREE_PLAN_CHANGE === "true";

/** The single place a workspace's plan is changed by hand (demo mode). */
export async function setWorkspacePlan(workspaceId: string, planId: string): Promise<boolean> {
  const plan = await prisma.plan.findUnique({ where: { id: planId }, select: { id: true } });
  if (!plan) return false;
  await prisma.workspace.update({ where: { id: workspaceId }, data: { planId } });
  return true;
}

// ------------------------------------------------------------------ configuration

const PAID_PLANS = ["starter", "growth", "pro"] as const;

/** Dodo product ID per paid plan, read from the environment on every call (tests change it). */
function planProducts(): Record<string, string> {
  const products: Record<string, string> = {};
  for (const plan of PAID_PLANS) {
    const id = process.env[`DODO_PRODUCT_${plan.toUpperCase()}`]?.trim();
    if (id) products[plan] = id;
  }
  return products;
}

export const productForPlan = (planId: string): string | null => planProducts()[planId] ?? null;

export function planForProduct(productId: string): string | null {
  return Object.entries(planProducts()).find(([, id]) => id === productId)?.[0] ?? null;
}

/** True when online payment is set up: an API key and a product for every paid plan. */
export const paymentsConfigured = () =>
  Boolean(process.env.DODO_PAYMENTS_API_KEY) && PAID_PLANS.every((plan) => productForPlan(plan));

let client: DodoPayments | null = null;

function dodo(): DodoPayments {
  client ??= new DodoPayments({
    bearerToken: process.env.DODO_PAYMENTS_API_KEY,
    webhookKey: process.env.DODO_PAYMENTS_WEBHOOK_KEY ?? null,
    environment: process.env.DODO_PAYMENTS_ENVIRONMENT === "live_mode" ? "live_mode" : "test_mode",
  });
  return client;
}

const SETTINGS_URL = () => `${APP_URL}/dashboard/settings`;

/** A subscription that is still charging (or retrying a failed charge) and can change plan. */
const isLive = (status: string | null) => status === "active" || status === "past_due";

// ------------------------------------------------------------------ checkout and portal

type Owner = { email: string; name: string | null };

export type CheckoutResult = { url: string } | { changed: true } | { error: string };

/**
 * Send the owner to pay for `planId`. A workspace that already has a running subscription is moved
 * to the new plan straight away instead (the price difference is prorated by Dodo), and one that
 * picks the free plan is sent to the portal, where the subscription is cancelled.
 */
export async function startCheckout(workspaceId: string, planId: string, owner: Owner): Promise<CheckoutResult> {
  if (!paymentsConfigured()) return { error: "settings.planChangeUnavailable" };
  const workspace = await prisma.workspace.findUniqueOrThrow({ where: { id: workspaceId } });
  if (planId === workspace.planId) return { changed: true };

  if (planId === "free") {
    const url = await billingPortalUrl(workspaceId);
    return url ? { url } : { error: "errors.generic" };
  }

  const productId = productForPlan(planId);
  if (!productId) return { error: "errors.generic" };

  if (workspace.dodoSubscriptionId && isLive(workspace.billingStatus)) {
    await dodo().subscriptions.changePlan(workspace.dodoSubscriptionId, {
      product_id: productId,
      quantity: 1,
      proration_billing_mode: "prorated_immediately",
    });
    // Dodo accepted the change, so apply it now; the plan_changed webhook confirms it moments later.
    await prisma.workspace.update({ where: { id: workspaceId }, data: { planId } });
    return { changed: true };
  }

  // The Dodo customer is created up front and remembered, so the webhook can always find the
  // workspace from the subscription's customer, even without the checkout metadata.
  let customerId = workspace.dodoCustomerId;
  if (!customerId) {
    const customer = await dodo().customers.create({
      email: owner.email,
      name: owner.name || workspace.name,
      metadata: { workspaceId },
    });
    customerId = customer.customer_id;
    await prisma.workspace.update({ where: { id: workspaceId }, data: { dodoCustomerId: customerId } });
  }

  const session = await dodo().checkoutSessions.create({
    product_cart: [{ product_id: productId, quantity: 1 }],
    customer: { customer_id: customerId },
    metadata: { workspaceId, planId },
    return_url: `${SETTINGS_URL()}?billing=success`,
    cancel_url: SETTINGS_URL(),
  });
  return session.checkout_url ? { url: session.checkout_url } : { error: "errors.generic" };
}

/** Link to Dodo's customer portal for this workspace, or null if it has never paid. */
export async function billingPortalUrl(workspaceId: string): Promise<string | null> {
  if (!paymentsConfigured()) return null;
  const workspace = await prisma.workspace.findUniqueOrThrow({ where: { id: workspaceId }, select: { dodoCustomerId: true } });
  if (!workspace.dodoCustomerId) return null;
  const session = await dodo().customers.customerPortal.create(workspace.dodoCustomerId, { return_url: SETTINGS_URL() });
  return session.link;
}

// ------------------------------------------------------------------ webhook

/** Check the signature of a webhook from Dodo and parse it. Throws if it is not genuine. */
export function verifyWebhook(body: string, headers: Headers) {
  const key = process.env.DODO_PAYMENTS_WEBHOOK_KEY;
  if (!key) throw new Error("DODO_PAYMENTS_WEBHOOK_KEY is not set");
  return dodo().webhooks.unwrap(body, {
    key,
    headers: {
      "webhook-id": headers.get("webhook-id") ?? "",
      "webhook-signature": headers.get("webhook-signature") ?? "",
      "webhook-timestamp": headers.get("webhook-timestamp") ?? "",
    },
  });
}

/**
 * The workspace a subscription belongs to: the one already holding it, else the one named in the
 * checkout metadata, else the one the Dodo customer was created for. The customer comes last
 * because Dodo may reuse one customer for an owner with several workspaces.
 */
async function findWorkspace(sub: SubscriptionEvent["data"]) {
  const metadataId = typeof sub.metadata?.workspaceId === "string" ? sub.metadata.workspaceId : null;
  return (
    (await prisma.workspace.findUnique({ where: { dodoSubscriptionId: sub.subscription_id } })) ??
    (metadataId ? await prisma.workspace.findUnique({ where: { id: metadataId } }) : null) ??
    (await prisma.workspace.findFirst({ where: { dodoCustomerId: sub.customer.customer_id }, orderBy: { createdAt: "asc" } }))
  );
}

export type SubscriptionEvent = {
  type: string;
  timestamp: string;
  data: Pick<Subscription, "subscription_id" | "status" | "product_id" | "next_billing_date" | "cancel_at_next_billing_date" | "metadata"> & {
    customer: { customer_id: string };
  };
};

/**
 * Bring a workspace in line with a subscription event. Only the status in the payload matters,
 * not the event's name, so a retried or duplicated event changes nothing:
 *   - active / past_due   the subscribed plan (past_due is the grace period while Dodo retries)
 *   - on_hold / paused    back to free until the customer pays again; the subscription is kept
 *   - cancelled / expired / failed   back to free, and the subscription is forgotten
 * Returns what happened, for the log and the tests.
 */
export async function applySubscriptionEvent(event: SubscriptionEvent): Promise<"applied" | "ignored"> {
  const sub = event.data;
  const at = new Date(event.timestamp);

  const workspace = await findWorkspace(sub);
  if (!workspace) return "ignored";

  // Webhooks can arrive out of order; never let an older one undo a newer one.
  if (workspace.billingEventAt && at < workspace.billingEventAt) return "ignored";

  // The end of an old subscription must not touch the one that replaced it.
  const isCurrent = !workspace.dodoSubscriptionId || workspace.dodoSubscriptionId === sub.subscription_id;
  const billing = {
    dodoCustomerId: sub.customer.customer_id,
    billingStatus: sub.status,
    billingPeriodEnd: sub.next_billing_date ? new Date(sub.next_billing_date) : null,
    cancelAtPeriodEnd: sub.cancel_at_next_billing_date,
    billingEventAt: at,
  };

  switch (sub.status) {
    case "active":
    case "past_due": {
      const planId = planForProduct(sub.product_id);
      if (!planId) return "ignored"; // a product that is not one of our plans
      await prisma.workspace.update({ where: { id: workspace.id }, data: { ...billing, planId, dodoSubscriptionId: sub.subscription_id } });
      return "applied";
    }
    case "on_hold":
    case "paused":
      if (!isCurrent) return "ignored";
      await prisma.workspace.update({ where: { id: workspace.id }, data: { ...billing, planId: "free", dodoSubscriptionId: sub.subscription_id } });
      return "applied";
    case "cancelled":
    case "expired":
    case "failed":
      if (!isCurrent) return "ignored";
      await prisma.workspace.update({
        where: { id: workspace.id },
        data: { ...billing, planId: "free", dodoSubscriptionId: null, billingPeriodEnd: null, cancelAtPeriodEnd: false },
      });
      return "applied";
    default:
      return "ignored"; // "pending": the checkout is not finished yet
  }
}

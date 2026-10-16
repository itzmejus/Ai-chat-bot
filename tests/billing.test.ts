import { randomBytes } from "node:crypto";
import { Webhook } from "standardwebhooks";
import { beforeEach, describe, expect, it, vi } from "vitest";

// Dodo's API is faked; signatures are checked with the same Standard Webhooks library the SDK uses.
const api = vi.hoisted(() => ({
  customersCreate: vi.fn(async () => ({ customer_id: "cus_1" })),
  checkoutCreate: vi.fn(async () => ({ session_id: "cks_1", checkout_url: "https://checkout.example.com/cks_1" })),
  changePlan: vi.fn(async () => ({})),
  portalCreate: vi.fn(async () => ({ link: "https://portal.example.com/cus_1" })),
}));
vi.mock("dodopayments", () => ({
  default: class {
    customers = { create: api.customersCreate, customerPortal: { create: api.portalCreate } };
    checkoutSessions = { create: api.checkoutCreate };
    subscriptions = { changePlan: api.changePlan };
    webhooks = {
      unwrap(body: string, { headers, key }: { headers: Record<string, string>; key: string }) {
        new Webhook(key).verify(body, headers);
        return JSON.parse(body);
      },
    };
  },
}));
vi.mock("next/cache", () => ({ revalidatePath: () => {} }));

import { POST as webhookRoute } from "@/app/api/billing/webhook/route";
import { applySubscriptionEvent, paymentsConfigured, planForProduct, startCheckout, type SubscriptionEvent } from "@/server/billing";
import { prisma } from "@/server/db/prisma";
import { createTenant } from "./helpers";

const SECRET = `whsec_${randomBytes(24).toString("base64")}`;

beforeEach(() => {
  vi.stubEnv("DODO_PAYMENTS_API_KEY", "test-api-key");
  vi.stubEnv("DODO_PAYMENTS_WEBHOOK_KEY", SECRET);
  vi.stubEnv("DODO_PRODUCT_STARTER", "pdt_starter");
  vi.stubEnv("DODO_PRODUCT_GROWTH", "pdt_growth");
  vi.stubEnv("DODO_PRODUCT_PRO", "pdt_pro");
  vi.clearAllMocks();
});

let clock = Date.parse("2026-11-01T00:00:00Z");

/** A subscription event, each one a second later than the previous unless a time is given. */
function event(data: Partial<SubscriptionEvent["data"]> & { customer_id?: string }, at?: string): SubscriptionEvent {
  const { customer_id = "cus_1", ...rest } = data;
  clock += 1000;
  return {
    type: `subscription.${rest.status ?? "active"}`,
    timestamp: at ?? new Date(clock).toISOString(),
    data: {
      subscription_id: "sub_1",
      status: "active",
      product_id: "pdt_starter",
      next_billing_date: "2026-12-01T00:00:00Z",
      cancel_at_next_billing_date: false,
      metadata: {},
      customer: { customer_id },
      ...rest,
    },
  };
}

const plan = async (id: string) => (await prisma.workspace.findUniqueOrThrow({ where: { id } })).planId;

describe("billing configuration", () => {
  it("turns payments on only with an API key and a product for every paid plan", () => {
    expect(paymentsConfigured()).toBe(true);
    vi.stubEnv("DODO_PRODUCT_PRO", "");
    expect(paymentsConfigured()).toBe(false);
  });

  it("maps Dodo products back to plans", () => {
    expect(planForProduct("pdt_growth")).toBe("growth");
    expect(planForProduct("pdt_other")).toBeNull();
  });
});

describe("checkout", () => {
  it("creates the Dodo customer once and sends the owner to checkout with the workspace attached", async () => {
    const { user, workspace } = await createTenant("Checkout Clinic");
    const owner = { email: user.email, name: user.name };

    expect(await startCheckout(workspace.id, "growth", owner)).toEqual({ url: "https://checkout.example.com/cks_1" });
    await startCheckout(workspace.id, "pro", owner);

    expect(api.customersCreate).toHaveBeenCalledTimes(1);
    expect(api.checkoutCreate).toHaveBeenLastCalledWith(
      expect.objectContaining({
        product_cart: [{ product_id: "pdt_pro", quantity: 1 }],
        customer: { customer_id: "cus_1" },
        metadata: { workspaceId: workspace.id, planId: "pro" },
        return_url: "https://app.example.com/dashboard/settings?billing=success",
      }),
    );
    // Nothing is granted until Dodo confirms the payment through the webhook.
    expect(await plan(workspace.id)).toBe("free");
  });

  it("moves a paying workspace to the new plan without a second checkout", async () => {
    const { user, workspace } = await createTenant("Upgrade Clinic");
    await prisma.workspace.update({
      where: { id: workspace.id },
      data: { planId: "starter", dodoCustomerId: "cus_up", dodoSubscriptionId: "sub_up", billingStatus: "active" },
    });

    expect(await startCheckout(workspace.id, "growth", { email: user.email, name: user.name })).toEqual({ changed: true });
    expect(api.changePlan).toHaveBeenCalledWith("sub_up", { product_id: "pdt_growth", quantity: 1, proration_billing_mode: "prorated_immediately" });
    expect(api.checkoutCreate).not.toHaveBeenCalled();
    expect(await plan(workspace.id)).toBe("growth");
  });

  it("sends a paying workspace that picks Free to the portal to cancel", async () => {
    const { user, workspace } = await createTenant("Cancel Clinic");
    await prisma.workspace.update({ where: { id: workspace.id }, data: { planId: "starter", dodoCustomerId: "cus_c", dodoSubscriptionId: "sub_c", billingStatus: "active" } });

    expect(await startCheckout(workspace.id, "free", { email: user.email, name: user.name })).toEqual({ url: "https://portal.example.com/cus_1" });
    expect(api.portalCreate).toHaveBeenCalledWith("cus_c", { return_url: "https://app.example.com/dashboard/settings" });
    expect(await plan(workspace.id)).toBe("starter");
  });
});

describe("subscription events", () => {
  it("gives the plan when the subscription becomes active, and takes it back when it is cancelled", async () => {
    const { workspace } = await createTenant("Event Clinic");
    await prisma.workspace.update({ where: { id: workspace.id }, data: { dodoCustomerId: "cus_ev" } });

    expect(await applySubscriptionEvent(event({ subscription_id: "sub_ev", customer_id: "cus_ev", product_id: "pdt_growth" }))).toBe("applied");
    let ws = await prisma.workspace.findUniqueOrThrow({ where: { id: workspace.id } });
    expect(ws).toMatchObject({ planId: "growth", dodoSubscriptionId: "sub_ev", billingStatus: "active" });
    expect(ws.billingPeriodEnd?.toISOString()).toBe("2026-12-01T00:00:00.000Z");

    // Cancelled from the portal: still paid up to the end of the month.
    await applySubscriptionEvent(event({ subscription_id: "sub_ev", customer_id: "cus_ev", product_id: "pdt_growth", cancel_at_next_billing_date: true }));
    expect(await plan(workspace.id)).toBe("growth");

    await applySubscriptionEvent(event({ subscription_id: "sub_ev", customer_id: "cus_ev", product_id: "pdt_growth", status: "cancelled" }));
    ws = await prisma.workspace.findUniqueOrThrow({ where: { id: workspace.id } });
    expect(ws).toMatchObject({ planId: "free", dodoSubscriptionId: null, billingStatus: "cancelled", dodoCustomerId: "cus_ev" });
  });

  it("finds the workspace from the checkout metadata", async () => {
    const { workspace } = await createTenant("Metadata Clinic");
    await applySubscriptionEvent(event({ subscription_id: "sub_md", customer_id: "cus_md", product_id: "pdt_pro", metadata: { workspaceId: workspace.id } }));
    expect(await plan(workspace.id)).toBe("pro");
  });

  it("keeps the plan while a failed renewal is retried, and drops to Free once it is on hold", async () => {
    const { workspace } = await createTenant("Hold Clinic");
    const base = { subscription_id: "sub_h", customer_id: "cus_h", product_id: "pdt_starter", metadata: { workspaceId: workspace.id } };
    await applySubscriptionEvent(event(base));
    await applySubscriptionEvent(event({ ...base, status: "past_due" }));
    expect(await plan(workspace.id)).toBe("starter");

    await applySubscriptionEvent(event({ ...base, status: "on_hold" }));
    expect(await prisma.workspace.findUniqueOrThrow({ where: { id: workspace.id } })).toMatchObject({ planId: "free", billingStatus: "on_hold", dodoSubscriptionId: "sub_h" });

    // The customer updates their card and the subscription is charged again.
    await applySubscriptionEvent(event(base));
    expect(await plan(workspace.id)).toBe("starter");
  });

  it("ignores events older than the last one applied", async () => {
    const { workspace } = await createTenant("Order Clinic");
    const base = { subscription_id: "sub_o", customer_id: "cus_o", metadata: { workspaceId: workspace.id } };
    await applySubscriptionEvent(event({ ...base, status: "cancelled" }, "2026-11-10T00:00:00Z"));
    expect(await applySubscriptionEvent(event({ ...base, status: "active" }, "2026-11-09T00:00:00Z"))).toBe("ignored");
    expect(await plan(workspace.id)).toBe("free");
  });

  it("does not let the end of an old subscription cancel the one that replaced it", async () => {
    const { workspace } = await createTenant("Replace Clinic");
    await applySubscriptionEvent(event({ subscription_id: "sub_new", customer_id: "cus_r", product_id: "pdt_pro", metadata: { workspaceId: workspace.id } }));
    expect(await applySubscriptionEvent(event({ subscription_id: "sub_old", customer_id: "cus_r", status: "expired" }))).toBe("ignored");
    expect(await plan(workspace.id)).toBe("pro");
  });

  it("ignores subscriptions it cannot place and products that are not plans", async () => {
    expect(await applySubscriptionEvent(event({ subscription_id: "sub_x", customer_id: "cus_unknown" }))).toBe("ignored");
    const { workspace } = await createTenant("Product Clinic");
    expect(await applySubscriptionEvent(event({ subscription_id: "sub_p", product_id: "pdt_other", metadata: { workspaceId: workspace.id } }))).toBe("ignored");
    expect(await plan(workspace.id)).toBe("free");
  });
});

describe("webhook route", () => {
  function signed(payload: unknown, secret = SECRET) {
    const body = JSON.stringify(payload);
    const id = `msg_${randomBytes(6).toString("hex")}`;
    const now = new Date();
    return new Request("https://app.example.com/api/billing/webhook", {
      method: "POST",
      body,
      headers: {
        "content-type": "application/json",
        "webhook-id": id,
        "webhook-timestamp": String(Math.floor(now.getTime() / 1000)),
        "webhook-signature": new Webhook(secret).sign(id, now, body),
      },
    });
  }

  it("applies a correctly signed subscription event", async () => {
    const { workspace } = await createTenant("Webhook Clinic");
    const res = await webhookRoute(signed(event({ subscription_id: "sub_w", customer_id: "cus_w", product_id: "pdt_growth", metadata: { workspaceId: workspace.id } })));
    expect(res.status).toBe(200);
    expect(await plan(workspace.id)).toBe("growth");
  });

  it("rejects a forged or unsigned request", async () => {
    const { workspace } = await createTenant("Forged Clinic");
    const payload = event({ subscription_id: "sub_f", product_id: "pdt_pro", metadata: { workspaceId: workspace.id } });

    const forged = await webhookRoute(signed(payload, `whsec_${randomBytes(24).toString("base64")}`));
    expect(forged.status).toBe(401);
    const unsigned = await webhookRoute(new Request("https://app.example.com/api/billing/webhook", { method: "POST", body: JSON.stringify(payload) }));
    expect(unsigned.status).toBe(401);
    expect(await plan(workspace.id)).toBe("free");
  });

  it("acknowledges events that are not about subscriptions", async () => {
    const res = await webhookRoute(signed({ type: "payment.succeeded", timestamp: new Date().toISOString(), data: {} }));
    expect(res.status).toBe(200);
  });
});

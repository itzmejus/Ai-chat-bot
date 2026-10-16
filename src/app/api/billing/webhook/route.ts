import { revalidatePath } from "next/cache";
import { applySubscriptionEvent, verifyWebhook, type SubscriptionEvent } from "@/server/billing";

/**
 * POST /api/billing/webhook — Dodo Payments reports subscription changes here.
 *
 * The signature is checked before anything is read. Any other answer than 2xx makes Dodo retry
 * the event later, so a failure while applying it returns 500 rather than being swallowed.
 */
export async function POST(request: Request) {
  const body = await request.text();

  let event: { type: string };
  try {
    event = verifyWebhook(body, request.headers);
  } catch {
    return Response.json({ error: "invalid signature" }, { status: 401 });
  }

  // Only subscription events change a plan; payments, refunds and the rest are acknowledged.
  if (!event.type.startsWith("subscription.")) return Response.json({ ok: true });

  try {
    const result = await applySubscriptionEvent(event as SubscriptionEvent);
    if (result === "applied") revalidatePath("/dashboard", "layout");
    return Response.json({ ok: true, result });
  } catch (err) {
    console.error("[billing] webhook failed", event.type, err);
    return Response.json({ error: "failed" }, { status: 500 });
  }
}

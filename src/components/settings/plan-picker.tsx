"use client";

import { Check } from "lucide-react";
import { useRouter } from "next/navigation";
import { useFormatter, useTranslations } from "next-intl";
import { useEffect, useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { billingPortalAction, changePlanAction } from "@/server/actions/settings";

export type PlanOption = { id: string; name: string; monthlyMessages: number; maxKnowledgePages: number; maxAgents: number };

/** The workspace's subscription, as last reported by the payment provider's webhook. */
export type BillingInfo = {
  status: string | null;
  periodEnd: string | null; // ISO date
  cancelAtPeriodEnd: boolean;
  hasCustomer: boolean;
  hasSubscription: boolean;
};

/**
 * "payments": plans are bought through Dodo Payments (checkout, then its webhook sets the plan).
 * "demo":     plans switch for free (ALLOW_FREE_PLAN_CHANGE, development and demos).
 * "contact":  neither is set up; the owner is asked to get in touch.
 */
export type PlanMode = "payments" | "demo" | "contact";

const REFRESH_TRIES = 6;

/** The available plans and their limits, and the way to change plan for the current setup. */
export function PlanPicker({
  plans,
  currentId,
  canEdit,
  mode,
  billing,
  justPaid,
  contactEmail,
}: {
  plans: PlanOption[];
  currentId: string;
  canEdit: boolean;
  mode: PlanMode;
  billing: BillingInfo;
  justPaid: boolean;
  contactEmail?: string;
}) {
  const t = useTranslations("settings");
  const tAll = useTranslations();
  const format = useFormatter();
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  // Back from checkout: the webhook usually lands a moment after the customer does, so refresh a
  // few times until the new plan shows.
  const waitingForWebhook = mode === "payments" && justPaid && currentId === "free";
  useEffect(() => {
    if (!waitingForWebhook) return;
    let tries = 0;
    const timer = setInterval(() => {
      tries += 1;
      router.refresh();
      if (tries >= REFRESH_TRIES) clearInterval(timer);
    }, 3000);
    return () => clearInterval(timer);
  }, [waitingForWebhook, router]);

  const live = billing.hasSubscription && (billing.status === "active" || billing.status === "past_due");
  const canSwitch = canEdit && (mode === "payments" || mode === "demo");

  function choose(plan: PlanOption) {
    if (mode === "payments" && live && plan.id !== "free" && !window.confirm(t("planChangeConfirm", { name: plan.name }))) return;
    startTransition(async () => {
      const result = await changePlanAction(plan.id);
      setError(result.error ?? null);
      if (result.url) window.location.href = result.url;
    });
  }

  function openPortal() {
    startTransition(async () => {
      const result = await billingPortalAction();
      setError(result.error ?? null);
      if (result.url) window.location.href = result.url;
    });
  }

  function buttonLabel(plan: PlanOption) {
    if (mode !== "payments") return t("planSwitch");
    if (plan.id === "free") return t("planCancel");
    return live ? t("planSwitch") : t("planUpgrade");
  }

  // Free needs no button while the paid plan is already cancelled, or when there is nothing to cancel.
  const showButton = (plan: PlanOption) =>
    plan.id !== currentId && canSwitch && !(mode === "payments" && plan.id === "free" && (!live || billing.cancelAtPeriodEnd));

  const date = billing.periodEnd ? format.dateTime(new Date(billing.periodEnd), { dateStyle: "long" }) : null;
  const status =
    mode !== "payments"
      ? null
      : waitingForWebhook
        ? { text: t("billingPending"), warn: false }
        : billing.status === "past_due"
          ? { text: t("billingPastDue"), warn: true }
          : billing.status === "on_hold"
            ? { text: t("billingOnHold"), warn: true }
            : live && date
              ? { text: billing.cancelAtPeriodEnd ? t("billingEnds", { date }) : t("billingRenews", { date }), warn: false }
              : null;

  return (
    <div className="flex flex-col gap-3">
      {status && (
        <p role="status" className={cn("rounded-xl px-3 py-2 text-sm", status.warn ? "bg-destructive/10 text-destructive" : "bg-muted text-foreground")}>
          {status.text}
        </p>
      )}
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {plans.map((plan) => {
          const current = plan.id === currentId;
          return (
            <div
              key={plan.id}
              className={cn(
                "flex flex-col gap-3 rounded-2xl border p-4",
                current ? "border-primary bg-gradient-to-br from-accent to-white shadow-[0_4px_16px_-6px_rgb(220_38_38/0.45)]" : "border-border/80 bg-background",
              )}
            >
              <div className="flex items-center justify-between gap-2">
                <p className="text-base font-bold">{plan.name}</p>
                {current && <span className="rounded-full bg-primary px-2 py-0.5 text-[11px] font-semibold text-white">{t("planCurrent")}</span>}
              </div>
              <ul className="flex flex-1 flex-col gap-1.5 text-sm text-muted-foreground">
                {[
                  t("planMessages", { count: plan.monthlyMessages }),
                  t("planPages", { count: plan.maxKnowledgePages }),
                  t("planAgents", { count: plan.maxAgents }),
                ].map((line) => (
                  <li key={line} className="flex items-start gap-2">
                    <Check className="mt-0.5 size-3.5 shrink-0 text-success" strokeWidth={3} />
                    {line}
                  </li>
                ))}
              </ul>
              {showButton(plan) && (
                <Button variant="outline" size="sm" disabled={pending} onClick={() => choose(plan)}>
                  {buttonLabel(plan)}
                </Button>
              )}
            </div>
          );
        })}
      </div>
      {error && (
        <p role="alert" className="text-sm text-destructive">
          {tAll(error)}
        </p>
      )}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-xs text-muted-foreground">
          {mode === "payments" ? t("planPaymentsNote") : mode === "demo" ? t("planDemoNote") : t("planContactNote")}
          {mode === "contact" && contactEmail && (
            <>
              {" "}
              <a href={`mailto:${contactEmail}`} dir="ltr" className="font-medium text-primary hover:underline">
                {contactEmail}
              </a>
            </>
          )}
        </p>
        {mode === "payments" && canEdit && billing.hasCustomer && (
          <Button variant="outline" size="sm" disabled={pending} onClick={openPortal}>
            {t("billingManage")}
          </Button>
        )}
      </div>
    </div>
  );
}

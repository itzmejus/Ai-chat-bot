"use client";

import { Check } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { changePlanAction } from "@/server/actions/settings";

export type PlanOption = { id: string; name: string; monthlyMessages: number; maxKnowledgePages: number; maxAgents: number };

/**
 * The available plans and their limits. Payments are not built yet: switching is
 * only offered when the server allows free plan changes (development and demos).
 */
export function PlanPicker({ plans, currentId, canSwitch }: { plans: PlanOption[]; currentId: string; canSwitch: boolean }) {
  const t = useTranslations("settings");
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const tAll = useTranslations();

  return (
    <div className="flex flex-col gap-3">
      <div className="grid gap-3 sm:grid-cols-3">
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
              {!current && canSwitch && (
                <Button
                  variant="outline"
                  size="sm"
                  disabled={pending}
                  onClick={() =>
                    startTransition(async () => {
                      const result = await changePlanAction(plan.id);
                      setError(result.error ?? null);
                    })
                  }
                >
                  {t("planSwitch")}
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
      <p className="text-xs text-muted-foreground">{canSwitch ? t("planDemoNote") : t("planContactNote")}</p>
    </div>
  );
}

"use client";

import { CheckCircle2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { useActionState, useState } from "react";
import { FormField, NativeSelect } from "@/components/form-field";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DAYS, DEFAULT_WORKING_HOURS, INDUSTRIES, LANGUAGES, type WorkingHours } from "@/lib/validation";
import type { FormState } from "@/server/actions/auth";
import { updateWorkspaceAction } from "@/server/actions/settings";
import { createWorkspaceAction } from "@/server/actions/workspace";

export type WorkspaceFormValues = {
  name: string;
  industry: (typeof INDUSTRIES)[number];
  defaultLanguage: (typeof LANGUAGES)[number];
  websiteUrl: string;
  phone: string;
  whatsapp: string;
  workingHours: WorkingHours;
};

const EMPTY: WorkspaceFormValues = {
  name: "",
  industry: "clinic",
  defaultLanguage: "both",
  websiteUrl: "",
  phone: "",
  whatsapp: "",
  workingHours: DEFAULT_WORKING_HOURS,
};

/**
 * Business profile form. Used twice:
 *  - at onboarding (`mode="create"`), to create the workspace
 *  - in Settings (`mode="edit"`), to change it later
 */
export function OnboardingForm({ mode = "create", initial = EMPTY, disabled = false }: { mode?: "create" | "edit"; initial?: WorkspaceFormValues; disabled?: boolean }) {
  const t = useTranslations();
  const [state, formAction, pending] = useActionState<FormState, FormData>(mode === "create" ? createWorkspaceAction : updateWorkspaceAction, undefined);
  const errors = state?.fieldErrors ?? {};
  // Tracks which days are closed so their time inputs can be dimmed.
  const [closed, setClosed] = useState<Record<string, boolean>>(Object.fromEntries(DAYS.map((d) => [d, initial.workingHours[d]?.closed ?? false])));

  return (
    <form action={formAction} className="flex flex-col gap-5">
      <fieldset disabled={disabled} className="flex min-w-0 flex-col gap-5">
        <FormField id="name" label={t("onboarding.name")} error={errors.name}>
          <Input id="name" name="name" dir="auto" defaultValue={initial.name} placeholder={t("onboarding.namePlaceholder")} required aria-invalid={!!errors.name} />
        </FormField>

        <div className="grid gap-5 sm:grid-cols-2">
          <FormField id="industry" label={t("onboarding.industry")} error={errors.industry}>
            <NativeSelect id="industry" name="industry" defaultValue={initial.industry}>
              {INDUSTRIES.map((i) => (
                <option key={i} value={i}>
                  {t(`onboarding.industries.${i}`)}
                </option>
              ))}
            </NativeSelect>
          </FormField>
          <FormField id="defaultLanguage" label={t("onboarding.defaultLanguage")} error={errors.defaultLanguage}>
            <NativeSelect id="defaultLanguage" name="defaultLanguage" defaultValue={initial.defaultLanguage}>
              {LANGUAGES.map((l) => (
                <option key={l} value={l}>
                  {t(`onboarding.languages.${l}`)}
                </option>
              ))}
            </NativeSelect>
          </FormField>
        </div>

        <FormField id="websiteUrl" label={t("onboarding.websiteUrl")} hint={t("common.optional")} error={errors.websiteUrl}>
          <Input id="websiteUrl" name="websiteUrl" dir="ltr" defaultValue={initial.websiteUrl} placeholder={t("onboarding.websitePlaceholder")} aria-invalid={!!errors.websiteUrl} />
        </FormField>

        <div className="grid gap-5 sm:grid-cols-2">
          <FormField id="phone" label={t("onboarding.phone")} hint={t("common.optional")} error={errors.phone}>
            <Input id="phone" name="phone" type="tel" dir="ltr" defaultValue={initial.phone} placeholder={t("onboarding.phonePlaceholder")} aria-invalid={!!errors.phone} />
          </FormField>
          <FormField id="whatsapp" label={t("onboarding.whatsapp")} hint={t("common.optional")} error={errors.whatsapp}>
            <Input id="whatsapp" name="whatsapp" type="tel" dir="ltr" defaultValue={initial.whatsapp} placeholder={t("onboarding.phonePlaceholder")} aria-invalid={!!errors.whatsapp} />
          </FormField>
        </div>

        <div className="flex flex-col gap-2">
          <p className="text-sm font-medium">{t("onboarding.workingHours")}</p>
          <div className="overflow-hidden rounded-xl border border-border/70">
            {DAYS.map((d) => {
              const day = t(`onboarding.days.${d}`);
              return (
                // Each day is one row; on phones the times wrap under the day name.
                <div key={d} className="flex flex-wrap items-center gap-x-3 gap-y-2 border-b border-border/70 bg-background px-3 py-2.5 text-sm last:border-0">
                  <span className="min-w-0 flex-1 font-medium sm:w-24 sm:flex-none">{day}</span>
                  <div className="order-3 flex min-w-0 basis-full items-center gap-2 sm:order-2 sm:basis-auto sm:flex-1" dir="ltr">
                    {/* readOnly (not disabled) keeps the values in the submitted form */}
                    <Input
                      name={`hours.${d}.open`}
                      type="time"
                      defaultValue={initial.workingHours[d]?.open ?? "09:00"}
                      readOnly={closed[d]}
                      aria-label={`${day}: ${t("onboarding.opens")}`}
                      className={`h-10 min-w-24 flex-1 sm:h-9 sm:w-32 sm:flex-none ${closed[d] ? "opacity-40" : ""}`}
                    />
                    <span className="text-muted-foreground">–</span>
                    <Input
                      name={`hours.${d}.close`}
                      type="time"
                      defaultValue={initial.workingHours[d]?.close ?? "18:00"}
                      readOnly={closed[d]}
                      aria-label={`${day}: ${t("onboarding.closes")}`}
                      className={`h-10 min-w-24 flex-1 sm:h-9 sm:w-32 sm:flex-none ${closed[d] ? "opacity-40" : ""}`}
                    />
                  </div>
                  <label className="order-2 flex h-8 shrink-0 cursor-pointer items-center gap-1.5 text-muted-foreground sm:order-3">
                    <input
                      type="checkbox"
                      name={`hours.${d}.closed`}
                      checked={closed[d]}
                      onChange={(e) => setClosed((c) => ({ ...c, [d]: e.target.checked }))}
                      className="size-4 accent-primary"
                    />
                    {t("onboarding.closed")}
                  </label>
                </div>
              );
            })}
          </div>
          {errors.workingHours && <p className="text-sm text-destructive">{t(errors.workingHours)}</p>}
        </div>
      </fieldset>

      {state?.error && (
        <p role="alert" className="text-sm text-destructive">
          {t(state.error)}
        </p>
      )}

      {mode === "create" ? (
        <Button type="submit" size="lg" disabled={pending}>
          {pending ? t("common.saving") : t("onboarding.submit")}
        </Button>
      ) : disabled ? (
        <p className="text-sm text-muted-foreground">{t("settings.ownerOnlyNote")}</p>
      ) : (
        <div className="flex flex-wrap items-center gap-3">
          <Button type="submit" disabled={pending}>
            {pending ? t("common.saving") : t("settings.save")}
          </Button>
          {state?.ok && !pending && (
            <p role="status" className="flex items-center gap-1.5 text-sm text-success">
              <CheckCircle2 className="size-4" />
              {t("knowledge.saved")}
            </p>
          )}
        </div>
      )}
    </form>
  );
}

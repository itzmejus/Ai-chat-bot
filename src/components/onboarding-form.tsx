"use client";

import { useTranslations } from "next-intl";
import { useActionState, useState } from "react";
import { FormField, NativeSelect } from "@/components/form-field";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DAYS, DEFAULT_WORKING_HOURS, INDUSTRIES, LANGUAGES } from "@/lib/validation";
import type { FormState } from "@/server/actions/auth";
import { createWorkspaceAction } from "@/server/actions/workspace";

/** Workspace creation form shown right after signup. */
export function OnboardingForm() {
  const t = useTranslations();
  const [state, formAction, pending] = useActionState<FormState, FormData>(createWorkspaceAction, undefined);
  const errors = state?.fieldErrors ?? {};
  // Tracks which days are closed so their time inputs can be disabled.
  const [closed, setClosed] = useState<Record<string, boolean>>(
    Object.fromEntries(DAYS.map((d) => [d, DEFAULT_WORKING_HOURS[d].closed])),
  );

  return (
    <form action={formAction} className="flex flex-col gap-5">
      <FormField id="name" label={t("onboarding.name")} error={errors.name}>
        <Input id="name" name="name" placeholder={t("onboarding.namePlaceholder")} required aria-invalid={!!errors.name} />
      </FormField>

      <div className="grid gap-5 sm:grid-cols-2">
        <FormField id="industry" label={t("onboarding.industry")} error={errors.industry}>
          <NativeSelect id="industry" name="industry" defaultValue="clinic">
            {INDUSTRIES.map((i) => (
              <option key={i} value={i}>
                {t(`onboarding.industries.${i}`)}
              </option>
            ))}
          </NativeSelect>
        </FormField>
        <FormField id="defaultLanguage" label={t("onboarding.defaultLanguage")} error={errors.defaultLanguage}>
          <NativeSelect id="defaultLanguage" name="defaultLanguage" defaultValue="both">
            {LANGUAGES.map((l) => (
              <option key={l} value={l}>
                {t(`onboarding.languages.${l}`)}
              </option>
            ))}
          </NativeSelect>
        </FormField>
      </div>

      <FormField id="websiteUrl" label={t("onboarding.websiteUrl")} hint={t("common.optional")} error={errors.websiteUrl}>
        <Input id="websiteUrl" name="websiteUrl" dir="ltr" placeholder={t("onboarding.websitePlaceholder")} aria-invalid={!!errors.websiteUrl} />
      </FormField>

      <div className="grid gap-5 sm:grid-cols-2">
        <FormField id="phone" label={t("onboarding.phone")} hint={t("common.optional")} error={errors.phone}>
          <Input id="phone" name="phone" type="tel" dir="ltr" placeholder={t("onboarding.phonePlaceholder")} aria-invalid={!!errors.phone} />
        </FormField>
        <FormField id="whatsapp" label={t("onboarding.whatsapp")} hint={t("common.optional")} error={errors.whatsapp}>
          <Input id="whatsapp" name="whatsapp" type="tel" dir="ltr" placeholder={t("onboarding.phonePlaceholder")} aria-invalid={!!errors.whatsapp} />
        </FormField>
      </div>

      <fieldset className="flex flex-col gap-2">
        <legend className="mb-2 text-sm font-medium">{t("onboarding.workingHours")}</legend>
        {DAYS.map((d) => (
          <div key={d} className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm">
            <span className="w-24 shrink-0">{t(`onboarding.days.${d}`)}</span>
            {/* readOnly (not disabled) keeps the values in the submitted form */}
            <Input
              name={`hours.${d}.open`}
              type="time"
              defaultValue={DEFAULT_WORKING_HOURS[d].open}
              readOnly={closed[d]}
              aria-label={`${t(`onboarding.days.${d}`)} open`}
              className={`w-28 ${closed[d] ? "opacity-40" : ""}`}
            />
            <span className="text-muted-foreground">{t("onboarding.to")}</span>
            <Input
              name={`hours.${d}.close`}
              type="time"
              defaultValue={DEFAULT_WORKING_HOURS[d].close}
              readOnly={closed[d]}
              aria-label={`${t(`onboarding.days.${d}`)} close`}
              className={`w-28 ${closed[d] ? "opacity-40" : ""}`}
            />
            <label className="flex items-center gap-1.5">
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
        ))}
        {errors.workingHours && <p className="text-sm text-destructive">{t(errors.workingHours)}</p>}
      </fieldset>

      {state?.error && (
        <p role="alert" className="text-sm text-destructive">
          {t(state.error)}
        </p>
      )}

      <Button type="submit" size="lg" disabled={pending}>
        {pending ? t("common.saving") : t("onboarding.submit")}
      </Button>
    </form>
  );
}

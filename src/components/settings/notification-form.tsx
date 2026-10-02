"use client";

import { CheckCircle2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { useActionState } from "react";
import { FormField } from "@/components/form-field";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import type { FormState } from "@/server/actions/auth";
import { updateNotificationsAction } from "@/server/actions/settings";

function Toggle({ name, label, hint, defaultChecked }: { name: string; label: string; hint: string; defaultChecked: boolean }) {
  return (
    <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-border/80 bg-background p-3.5">
      <input type="checkbox" name={name} defaultChecked={defaultChecked} className="mt-0.5 size-4 accent-primary" />
      <span>
        <span className="block text-sm font-medium">{label}</span>
        <span className="block text-xs text-muted-foreground">{hint}</span>
      </span>
    </label>
  );
}

/** Which email notifications are sent, and to which addresses. */
export function NotificationForm({
  initial,
  canEdit,
  emailConfigured,
}: {
  initial: { notifyOnLead: boolean; notifyOnNeedsHuman: boolean; emails: string[] };
  canEdit: boolean;
  emailConfigured: boolean;
}) {
  const t = useTranslations();
  const [state, action, pending] = useActionState<FormState, FormData>(updateNotificationsAction, undefined);

  return (
    <form action={action} className="flex flex-col gap-4">
      {!emailConfigured && (
        <p className="rounded-xl bg-[#fff8e8] p-3 text-sm text-[#7a4700] ring-1 ring-[#f5c56b]">{t("settings.emailNotConfigured")}</p>
      )}
      <fieldset disabled={!canEdit} className="flex min-w-0 flex-col gap-3">
        <Toggle name="notifyOnLead" label={t("settings.notifyLead")} hint={t("settings.notifyLeadHint")} defaultChecked={initial.notifyOnLead} />
        <Toggle name="notifyOnNeedsHuman" label={t("settings.notifyHuman")} hint={t("settings.notifyHumanHint")} defaultChecked={initial.notifyOnNeedsHuman} />
        <FormField id="emails" label={t("settings.notifyEmails")} error={state?.fieldErrors?.emails}>
          <Textarea id="emails" name="emails" dir="ltr" rows={3} defaultValue={initial.emails.join("\n")} placeholder="owner@yourbusiness.ae" />
        </FormField>
        <p className="-mt-1 text-xs text-muted-foreground">{t("settings.notifyEmailsHint")}</p>
      </fieldset>

      {canEdit ? (
        <div className="flex flex-wrap items-center gap-3">
          <Button type="submit" disabled={pending}>
            {pending ? t("common.saving") : t("settings.save")}
          </Button>
          {state?.error && (
            <p role="alert" className="text-sm text-destructive">
              {t(state.error)}
            </p>
          )}
          {state?.ok && !pending && (
            <p role="status" className="flex items-center gap-1.5 text-sm text-success">
              <CheckCircle2 className="size-4" />
              {t("knowledge.saved")}
            </p>
          )}
        </div>
      ) : (
        <p className="text-sm text-muted-foreground">{t("settings.ownerOnlyNote")}</p>
      )}
    </form>
  );
}

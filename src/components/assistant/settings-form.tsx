"use client";

import { useTranslations } from "next-intl";
import { useActionState } from "react";
import { FormField, NativeSelect } from "@/components/form-field";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { TONES } from "@/lib/validation";
import { saveAssistantSettingsAction } from "@/server/actions/assistant";
import type { FormState } from "@/server/actions/auth";

export type AssistantSettingsValues = {
  assistantName: string;
  greeting: string;
  tone: "friendly" | "formal";
  extraInstructions: string;
};

/** Name, greeting, tone and extra instructions for the assistant. */
export function AssistantSettingsForm({ initial, canEdit }: { initial: AssistantSettingsValues; canEdit: boolean }) {
  const t = useTranslations();
  const [state, action, pending] = useActionState<FormState, FormData>(saveAssistantSettingsAction, undefined);
  const errors = state?.fieldErrors ?? {};

  return (
    <form action={action} className="flex flex-col gap-4">
      <fieldset disabled={!canEdit} className="flex flex-col gap-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <FormField id="assistantName" label={t("assistant.name")} error={errors.assistantName}>
            <Input id="assistantName" name="assistantName" dir="auto" defaultValue={initial.assistantName} required />
          </FormField>
          <FormField id="tone" label={t("assistant.tone")} error={errors.tone}>
            <NativeSelect id="tone" name="tone" defaultValue={initial.tone}>
              {TONES.map((tone) => (
                <option key={tone} value={tone}>
                  {t(`assistant.tones.${tone}`)}
                </option>
              ))}
            </NativeSelect>
          </FormField>
        </div>
        <FormField id="greeting" label={t("assistant.greeting")} error={errors.greeting}>
          <Textarea id="greeting" name="greeting" dir="auto" rows={2} defaultValue={initial.greeting} required />
        </FormField>
        <FormField id="extraInstructions" label={t("assistant.extraInstructions")} hint={t("common.optional")} error={errors.extraInstructions}>
          <Textarea
            id="extraInstructions"
            name="extraInstructions"
            dir="auto"
            rows={4}
            defaultValue={initial.extraInstructions}
            placeholder={t("assistant.extraPlaceholder")}
          />
        </FormField>
      </fieldset>

      {canEdit ? (
        <div className="flex flex-wrap items-center gap-3">
          <Button type="submit" disabled={pending}>
            {pending ? t("common.saving") : t("assistant.save")}
          </Button>
          {state?.error && (
            <p role="alert" className="text-sm text-destructive">
              {t(state.error)}
            </p>
          )}
          {state?.ok && !pending && (
            <p role="status" className="text-sm text-muted-foreground">
              {t("knowledge.saved")}
            </p>
          )}
        </div>
      ) : (
        <p className="text-sm text-muted-foreground">{t("assistant.ownerOnlyNote")}</p>
      )}
    </form>
  );
}

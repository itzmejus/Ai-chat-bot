"use client";

import { MailCheck, MailWarning } from "lucide-react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { useActionState, useTransition, useState } from "react";
import { FormField } from "@/components/form-field";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  changePasswordAction,
  forgotPasswordAction,
  resendVerificationAction,
  resetPasswordAction,
  type FormState,
} from "@/server/actions/auth";

/** Forms for account security: forgotten password, new password from a link, changing it, and the email-confirmation reminder. */

function FormError({ state }: { state: FormState }) {
  const t = useTranslations();
  if (!state?.error) return null;
  return (
    <p role="alert" className="text-sm text-destructive">
      {t(state.error)}
    </p>
  );
}

function BackToLogin() {
  const t = useTranslations();
  return (
    <p className="text-center text-sm text-muted-foreground">
      <Link href="/login" className="font-medium text-foreground underline underline-offset-4">
        {t("auth.backToLogin")}
      </Link>
    </p>
  );
}

export function ForgotPasswordForm() {
  const t = useTranslations();
  const [state, formAction, pending] = useActionState<FormState, FormData>(forgotPasswordAction, undefined);
  return (
    <Card className="shadow-xl">
      <CardHeader>
        <CardTitle className="text-2xl font-bold">{t("auth.forgotTitle")}</CardTitle>
        <CardDescription className="text-[15px]">{t("auth.forgotSubtitle")}</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        {state?.ok ? (
          <p role="status" className="flex items-start gap-3 rounded-xl bg-[#e7f8ee] p-4 text-sm leading-relaxed text-[#0a6b3a]">
            <MailCheck className="mt-0.5 size-5 shrink-0" />
            {t("auth.forgotSent")}
          </p>
        ) : (
          <form action={formAction} className="flex flex-col gap-4">
            <FormField id="email" label={t("auth.email")} error={state?.fieldErrors?.email}>
              <Input id="email" name="email" type="email" autoComplete="email" dir="ltr" required aria-invalid={!!state?.fieldErrors?.email} />
            </FormField>
            <FormError state={state} />
            <Button type="submit" size="lg" disabled={pending}>
              {t("auth.forgotSubmit")}
            </Button>
          </form>
        )}
        <BackToLogin />
      </CardContent>
    </Card>
  );
}

export function ResetPasswordForm({ token }: { token: string }) {
  const t = useTranslations();
  const [state, formAction, pending] = useActionState<FormState, FormData>(resetPasswordAction, undefined);
  return (
    <Card className="shadow-xl">
      <CardHeader>
        <CardTitle className="text-2xl font-bold">{t("auth.resetTitle")}</CardTitle>
        <CardDescription className="text-[15px]">{t("auth.resetSubtitle")}</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <form action={formAction} className="flex flex-col gap-4">
          <input type="hidden" name="token" value={token} />
          <FormField id="password" label={t("auth.newPassword")} hint={t("auth.passwordHint")} error={state?.fieldErrors?.password}>
            <Input id="password" name="password" type="password" autoComplete="new-password" dir="ltr" required minLength={8} maxLength={72} aria-invalid={!!state?.fieldErrors?.password} />
          </FormField>
          <FormError state={state} />
          {state?.error === "auth.resetInvalid" && (
            <Link href="/forgot-password" className="text-sm font-medium underline underline-offset-4">
              {t("auth.requestNewLink")}
            </Link>
          )}
          <Button type="submit" size="lg" disabled={pending}>
            {t("auth.resetSubmit")}
          </Button>
        </form>
        <BackToLogin />
      </CardContent>
    </Card>
  );
}

/** Settings: change the password (or, for Google-only accounts, a note on how to add one). */
export function ChangePasswordForm({ hasPassword }: { hasPassword: boolean }) {
  const t = useTranslations();
  const [state, formAction, pending] = useActionState<FormState, FormData>(changePasswordAction, undefined);
  if (!hasPassword) return <p className="text-sm leading-relaxed text-muted-foreground">{t("settings.noPassword")}</p>;
  const errors = state?.fieldErrors ?? {};
  return (
    <form action={formAction} className="flex flex-col gap-4">
      <FormField id="current" label={t("settings.currentPassword")} error={errors.current}>
        <Input id="current" name="current" type="password" autoComplete="current-password" dir="ltr" required aria-invalid={!!errors.current} />
      </FormField>
      <FormField id="new-password" label={t("settings.newPassword")} hint={t("auth.passwordHint")} error={errors.password}>
        <Input id="new-password" name="password" type="password" autoComplete="new-password" dir="ltr" required minLength={8} maxLength={72} aria-invalid={!!errors.password} />
      </FormField>
      <p className="text-sm text-muted-foreground">{t("settings.changePasswordHint")}</p>
      <FormError state={state} />
      <Button type="submit" disabled={pending} className="self-start">
        {t("settings.changePassword")}
      </Button>
    </form>
  );
}

/** Reminder at the top of the dashboard until the email address is confirmed. */
export function VerifyEmailBanner({ email }: { email: string }) {
  const t = useTranslations();
  const [state, setState] = useState<FormState>();
  const [pending, startTransition] = useTransition();
  return (
    <div role="status" className="mx-auto mb-4 flex max-w-6xl flex-wrap items-center gap-x-3 gap-y-2 rounded-2xl bg-[#eef4ff] p-3.5 text-sm text-[#1e3a8a] ring-1 ring-[#bfd3fe]">
      <MailWarning className="size-4 shrink-0" />
      <p className="min-w-0 flex-1">{t("nav.verifyEmail", { email })}</p>
      {state?.ok ? (
        <span className="shrink-0 font-semibold">{t("nav.verificationSent")}</span>
      ) : (
        <button
          type="button"
          disabled={pending}
          onClick={() => startTransition(async () => setState(await resendVerificationAction()))}
          className="shrink-0 font-semibold underline underline-offset-4 disabled:opacity-60"
        >
          {t("nav.resendVerification")}
        </button>
      )}
      {state?.error && <span className="w-full text-destructive">{t(state.error)}</span>}
    </div>
  );
}

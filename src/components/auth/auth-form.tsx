"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import { useActionState } from "react";
import { FormField } from "@/components/form-field";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { googleSignInAction, loginAction, signupAction, type FormState } from "@/server/actions/auth";

/**
 * Login and signup share one form; `mode` picks the fields and the server action.
 * `invite` is the token of a team invitation being accepted: it is carried through
 * so the person lands back on the invitation after signing in.
 */
export function AuthForm({
  mode,
  googleEnabled,
  invite,
  defaultEmail,
}: {
  mode: "login" | "signup";
  googleEnabled: boolean;
  invite?: string;
  defaultEmail?: string;
}) {
  const t = useTranslations();
  const [state, formAction, pending] = useActionState<FormState, FormData>(mode === "login" ? loginAction : signupAction, undefined);
  const errors = state?.fieldErrors ?? {};
  const other = mode === "login" ? "/signup" : "/login";

  return (
    <Card className="shadow-xl">
      <CardHeader>
        <CardTitle className="text-2xl font-bold">{t(`auth.${mode}Title`)}</CardTitle>
        <CardDescription className="text-[15px]">{t(invite ? "auth.inviteSubtitle" : `auth.${mode}Subtitle`)}</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <form action={formAction} className="flex flex-col gap-4">
          {invite && <input type="hidden" name="invite" value={invite} />}
          {mode === "signup" && (
            <FormField id="name" label={t("auth.name")} error={errors.name}>
              <Input id="name" name="name" autoComplete="name" required aria-invalid={!!errors.name} />
            </FormField>
          )}
          <FormField id="email" label={t("auth.email")} error={errors.email}>
            <Input id="email" name="email" type="email" autoComplete="email" dir="ltr" defaultValue={defaultEmail} required aria-invalid={!!errors.email} />
          </FormField>
          <FormField
            id="password"
            label={t("auth.password")}
            hint={mode === "signup" ? t("auth.passwordHint") : undefined}
            error={errors.password}
          >
            <Input
              id="password"
              name="password"
              type="password"
              autoComplete={mode === "login" ? "current-password" : "new-password"}
              dir="ltr"
              required
              aria-invalid={!!errors.password}
            />
          </FormField>

          {state?.error && (
            <p role="alert" className="text-sm text-destructive">
              {t(state.error)}
            </p>
          )}

          <Button type="submit" size="lg" disabled={pending}>
            {t(`auth.${mode}`)}
          </Button>
        </form>

        {googleEnabled && (
          <>
            <div className="flex items-center gap-3 text-xs text-muted-foreground">
              <span className="h-px flex-1 bg-border" />
              {t("auth.or")}
              <span className="h-px flex-1 bg-border" />
            </div>
            <form action={googleSignInAction}>
              {invite && <input type="hidden" name="invite" value={invite} />}
              <Button type="submit" variant="outline" size="lg" className="w-full">
                {t("auth.google")}
              </Button>
            </form>
          </>
        )}

        <p className="text-center text-sm text-muted-foreground">
          {t(mode === "login" ? "auth.noAccount" : "auth.haveAccount")}{" "}
          <Link href={invite ? `${other}?invite=${invite}` : other} className="font-medium text-foreground underline underline-offset-4">
            {t(mode === "login" ? "auth.signupLink" : "auth.loginLink")}
          </Link>
        </p>
      </CardContent>
    </Card>
  );
}

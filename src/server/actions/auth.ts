"use server";

import bcrypt from "bcryptjs";
import { AuthError } from "next-auth";
import { headers } from "next/headers";
import { signIn, signOut, TooManyAttempts } from "@/auth";
import { googleAuthEnabled } from "@/lib/config";
import { redirect } from "next/navigation";
import { z } from "zod";
import { emailSchema, loginSchema, passwordSchema, signupSchema } from "@/lib/validation";
import { notifyAdminsOfSignup } from "@/server/admin/admins";
import { AUTH_TOKEN_PATTERN, changePassword, requestPasswordReset, resetPassword, sendVerificationEmail } from "@/server/auth/account";
import { inBackground } from "@/server/background";
import { getCurrentUser } from "@/server/auth/session";
import { prisma } from "@/server/db/prisma";
import { clientIpFrom } from "@/server/limits/client-ip";
import { rateLimit } from "@/server/limits/rate-limit";
import { INVITE_TOKEN_PATTERN } from "@/server/team";

/** Form state shared by all forms. Errors are translation keys; `ok` marks a successful save. */
export type FormState = { ok?: boolean; error?: string; fieldErrors?: Record<string, string> } | undefined;

function fieldErrors(issues: { path: PropertyKey[]; message: string }[]) {
  const out: Record<string, string> = {};
  for (const issue of issues) {
    const key = issue.path.join(".");
    if (!(key in out)) out[key] = issue.message;
  }
  return out;
}

/** Where to go after signing in: back to a team invitation if one is being accepted. Only our own invite path is ever used. */
function afterAuth(formData: FormData, fallback: string): string {
  const invite = String(formData.get("invite") ?? "");
  return INVITE_TOKEN_PATTERN.test(invite) ? `/invite/${invite}` : fallback;
}

async function requestIp() {
  return clientIpFrom(await headers());
}

export async function signupAction(_prev: FormState, formData: FormData): Promise<FormState> {
  const parsed = signupSchema.safeParse({ name: formData.get("name"), email: formData.get("email"), password: formData.get("password") });
  if (!parsed.success) return { fieldErrors: fieldErrors(parsed.error.issues) };
  // At most 10 new accounts per hour from one address.
  if (!(await rateLimit(`signup:ip:${await requestIp()}`, 10, 3600))) return { error: "errors.tooManyAttempts" };
  const { name, email, password } = parsed.data;

  const existing = await prisma.user.findUnique({ where: { email }, select: { id: true } });
  if (existing) return { fieldErrors: { email: "errors.emailTaken" } };

  const user = await prisma.user.create({
    data: { name, email, passwordHash: await bcrypt.hash(password, 12) },
    select: { id: true, email: true, name: true },
  });
  // Ask them to confirm the address. Sending happens in the background: a mail problem must not block signing up.
  inBackground("auth verification email", () => sendVerificationEmail(user));
  inBackground("signup alert", () => notifyAdminsOfSignup(user, "password", INVITE_TOKEN_PATTERN.test(String(formData.get("invite") ?? ""))));

  // signIn redirects by throwing, so it must stay outside any try/catch that swallows errors.
  await signIn("credentials", { email, password, redirectTo: afterAuth(formData, "/onboarding") });
}

export async function loginAction(_prev: FormState, formData: FormData): Promise<FormState> {
  const parsed = loginSchema.safeParse({ email: formData.get("email"), password: formData.get("password") });
  if (!parsed.success) return { error: "errors.invalidCredentials" };

  // The attempt limit is enforced inside the login itself (authorize() in src/auth.ts).
  try {
    await signIn("credentials", { ...parsed.data, redirectTo: afterAuth(formData, "/dashboard") });
  } catch (err) {
    if (err instanceof TooManyAttempts) return { error: "errors.tooManyAttempts" };
    if (err instanceof AuthError) return { error: "errors.invalidCredentials" };
    throw err; // the success redirect
  }
}

export async function googleSignInAction(formData: FormData) {
  if (!googleAuthEnabled) return;
  await signIn("google", { redirectTo: afterAuth(formData, "/dashboard") });
}

export async function signOutAction() {
  await signOut({ redirectTo: "/login" });
}

// ---------------------------------------------------------------- account security

/** "Forgot password": always reports success, so it cannot reveal who has an account. */
export async function forgotPasswordAction(_prev: FormState, formData: FormData): Promise<FormState> {
  const parsed = emailSchema.safeParse(formData.get("email"));
  if (!parsed.success) return { fieldErrors: { email: "errors.email" } };
  const [ipOk, emailOk] = await Promise.all([
    rateLimit(`reset:ip:${await requestIp()}`, 5, 900),
    rateLimit(`reset:email:${parsed.data}`, 3, 3600),
  ]);
  if (!ipOk) return { error: "errors.tooManyAttempts" };
  // Over the per-address limit we quietly send nothing, and answer the same way.
  if (emailOk) await requestPasswordReset(parsed.data);
  return { ok: true };
}

const resetSchema = z.object({ token: z.string().regex(AUTH_TOKEN_PATTERN), password: passwordSchema });

/** Set a new password from the emailed link, then go to the login page. */
export async function resetPasswordAction(_prev: FormState, formData: FormData): Promise<FormState> {
  const parsed = resetSchema.safeParse({ token: formData.get("token"), password: formData.get("password") });
  if (!parsed.success) {
    const issues = parsed.error.issues;
    return issues.some((issue) => issue.path[0] === "token") ? { error: "auth.resetInvalid" } : { fieldErrors: fieldErrors(issues) };
  }
  if (!(await rateLimit(`reset:submit:${await requestIp()}`, 10, 900))) return { error: "errors.tooManyAttempts" };
  if (!(await resetPassword(parsed.data.token, parsed.data.password))) return { error: "auth.resetInvalid" };
  redirect("/login?reset=1");
}

const changeSchema = z.object({ current: z.string().max(72), password: passwordSchema });

/** Change the password from Settings. Signs out everywhere, including here, so they log in with the new one. */
export async function changePasswordAction(_prev: FormState, formData: FormData): Promise<FormState> {
  const user = await getCurrentUser();
  if (!user) return { error: "errors.unauthorized" };
  const parsed = changeSchema.safeParse({ current: formData.get("current"), password: formData.get("password") });
  if (!parsed.success) return { fieldErrors: fieldErrors(parsed.error.issues) };
  if (!(await rateLimit(`password-change:${user.id}`, 5, 900))) return { error: "errors.tooManyAttempts" };
  const result = await changePassword(user.id, parsed.data.current, parsed.data.password);
  if (result === "wrong_password") return { fieldErrors: { current: "errors.wrongPassword" } };
  if (result === "no_password") return { error: "settings.noPassword" };
  await signOut({ redirectTo: "/login?changed=1" });
}

/** Send the confirmation email again (from the reminder in the dashboard). */
export async function resendVerificationAction(): Promise<FormState> {
  const user = await getCurrentUser();
  if (!user) return { error: "errors.unauthorized" };
  if (user.emailVerifiedAt) return { ok: true };
  if (!(await rateLimit(`verify-resend:${user.id}`, 3, 3600))) return { error: "errors.tooManyAttempts" };
  const sent = await sendVerificationEmail(user);
  return sent ? { ok: true } : { error: "errors.generic" };
}

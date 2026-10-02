"use server";

import bcrypt from "bcryptjs";
import { AuthError } from "next-auth";
import { headers } from "next/headers";
import { signIn, signOut } from "@/auth";
import { googleAuthEnabled } from "@/lib/config";
import { loginSchema, signupSchema } from "@/lib/validation";
import { prisma } from "@/server/db/prisma";
import { rateLimit } from "@/server/limits/rate-limit";

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

async function requestIp() {
  return (await headers()).get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
}

export async function signupAction(_prev: FormState, formData: FormData): Promise<FormState> {
  const parsed = signupSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { fieldErrors: fieldErrors(parsed.error.issues) };
  // At most 10 new accounts per hour from one address.
  if (!(await rateLimit(`signup:ip:${await requestIp()}`, 10, 3600))) return { error: "errors.tooManyAttempts" };
  const { name, email, password } = parsed.data;

  const existing = await prisma.user.findUnique({ where: { email }, select: { id: true } });
  if (existing) return { fieldErrors: { email: "errors.emailTaken" } };

  await prisma.user.create({
    data: { name, email, passwordHash: await bcrypt.hash(password, 12) },
  });

  // signIn redirects by throwing, so it must stay outside any try/catch that swallows errors.
  await signIn("credentials", { email, password, redirectTo: "/onboarding" });
}

export async function loginAction(_prev: FormState, formData: FormData): Promise<FormState> {
  const parsed = loginSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: "errors.invalidCredentials" };

  // Slow down password guessing: 8 tries per account and 30 per address every 15 minutes.
  const [accountOk, ipOk] = await Promise.all([
    rateLimit(`login:account:${parsed.data.email}`, 8, 900),
    rateLimit(`login:ip:${await requestIp()}`, 30, 900),
  ]);
  if (!accountOk || !ipOk) return { error: "errors.tooManyAttempts" };

  try {
    await signIn("credentials", { ...parsed.data, redirectTo: "/dashboard" });
  } catch (err) {
    if (err instanceof AuthError) return { error: "errors.invalidCredentials" };
    throw err; // the success redirect
  }
}

export async function googleSignInAction() {
  if (!googleAuthEnabled) return;
  await signIn("google", { redirectTo: "/dashboard" });
}

export async function signOutAction() {
  await signOut({ redirectTo: "/login" });
}

"use server";

import bcrypt from "bcryptjs";
import { AuthError } from "next-auth";
import { signIn, signOut } from "@/auth";
import { googleAuthEnabled } from "@/lib/config";
import { loginSchema, signupSchema } from "@/lib/validation";
import { prisma } from "@/server/db/prisma";

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

export async function signupAction(_prev: FormState, formData: FormData): Promise<FormState> {
  const parsed = signupSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { fieldErrors: fieldErrors(parsed.error.issues) };
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

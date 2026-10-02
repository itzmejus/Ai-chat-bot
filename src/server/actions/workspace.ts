"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { DEFAULT_LOCALE, LOCALE_COOKIE, LOCALES, WORKSPACE_COOKIE, type Locale } from "@/lib/config";
import { parseWorkspaceForm } from "@/lib/workspace-form";
import { requireUser } from "@/server/auth/session";
import { prisma } from "@/server/db/prisma";
import { createWorkspaceForUser } from "@/server/workspaces";
import type { FormState } from "./auth";

const ONE_YEAR = 60 * 60 * 24 * 365;

export async function createWorkspaceAction(_prev: FormState, formData: FormData): Promise<FormState> {
  const user = await requireUser();

  const parsed = parseWorkspaceForm(formData);
  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      // Collapse all per-day errors onto one "workingHours" message.
      const key = issue.path[0] === "workingHours" ? "workingHours" : issue.path.join(".");
      if (!(key in fieldErrors)) fieldErrors[key] = issue.message;
    }
    return { fieldErrors };
  }

  let workspaceId: string;
  try {
    workspaceId = (await createWorkspaceForUser(user, parsed.data)).id;
  } catch (err) {
    console.error("[workspace] create failed", err);
    return { error: "errors.generic" };
  }

  (await cookies()).set(WORKSPACE_COOKIE, workspaceId, { httpOnly: true, sameSite: "lax", maxAge: ONE_YEAR, path: "/" });
  redirect("/dashboard");
}

/** Switch the active workspace. Only works for workspaces the user belongs to. */
export async function switchWorkspaceAction(workspaceId: string) {
  const user = await requireUser();
  const membership = await prisma.membership.findUnique({
    where: { userId_workspaceId: { userId: user.id, workspaceId } },
    select: { id: true },
  });
  if (!membership) return;

  (await cookies()).set(WORKSPACE_COOKIE, workspaceId, { httpOnly: true, sameSite: "lax", maxAge: ONE_YEAR, path: "/" });
  redirect("/dashboard");
}

export async function setLocaleAction(locale: string) {
  const value: Locale = (LOCALES as readonly string[]).includes(locale) ? (locale as Locale) : DEFAULT_LOCALE;
  (await cookies()).set(LOCALE_COOKIE, value, { sameSite: "lax", maxAge: ONE_YEAR, path: "/" });
}

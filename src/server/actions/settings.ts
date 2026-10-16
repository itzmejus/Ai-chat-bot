"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { parseWorkspaceForm } from "@/lib/workspace-form";
import { requireWorkspace } from "@/server/auth/session";
import { billingPortalUrl, freePlanChangeAllowed, paymentsConfigured, setWorkspacePlan, startCheckout } from "@/server/billing";
import type { FormState } from "./auth";

const PAGE = "/dashboard/settings";
const MAX_NOTIFICATION_EMAILS = 5;
const MAX_WHATSAPP_NUMBERS = 3;

/** Update the business profile and working hours. Owners only. */
export async function updateWorkspaceAction(_prev: FormState, formData: FormData): Promise<FormState> {
  const { db, workspace, role } = await requireWorkspace();
  if (role !== "owner") return { error: "errors.ownerOnly" };

  const parsed = parseWorkspaceForm(formData);
  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      const key = issue.path[0] === "workingHours" ? "workingHours" : issue.path.join(".");
      fieldErrors[key] ??= issue.message;
    }
    return { fieldErrors };
  }

  await db.workspace.update({ where: { id: workspace.id }, data: parsed.data });
  revalidatePath("/dashboard", "layout"); // the business name appears in the shell
  return { ok: true };
}

/** Which notifications are sent, and to which email addresses and WhatsApp numbers. Owners only. */
export async function updateNotificationsAction(_prev: FormState, formData: FormData): Promise<FormState> {
  const { db, workspace, role } = await requireWorkspace();
  if (role !== "owner") return { error: "errors.ownerOnly" };

  const emails: string[] = [];
  for (const raw of String(formData.get("emails") ?? "").split(/[\s,;]+/)) {
    const value = raw.trim().toLowerCase();
    if (!value) continue;
    if (!z.email().safeParse(value).success) return { fieldErrors: { emails: "errors.notificationEmail" } };
    if (!emails.includes(value)) emails.push(value);
  }
  if (emails.length > MAX_NOTIFICATION_EMAILS) return { fieldErrors: { emails: "errors.tooManyEmails" } };

  // One number per line, in international format. Stored as "+971501234567".
  const whatsappNumbers: string[] = [];
  for (const raw of String(formData.get("whatsappNumbers") ?? "").split(/[\n,;]+/)) {
    const value = raw.trim();
    if (!value) continue;
    const digits = value.replace(/[\s()-]/g, "").replace(/^00/, "+");
    if (!/^\+[1-9][0-9]{7,14}$/.test(digits)) return { fieldErrors: { whatsappNumbers: "errors.whatsappNumber" } };
    if (!whatsappNumbers.includes(digits)) whatsappNumbers.push(digits);
  }
  if (whatsappNumbers.length > MAX_WHATSAPP_NUMBERS) return { fieldErrors: { whatsappNumbers: "errors.tooManyNumbers" } };

  const data = {
    notifyOnLead: formData.get("notifyOnLead") === "on",
    notifyOnNeedsHuman: formData.get("notifyOnNeedsHuman") === "on",
    emails,
    whatsappNumbers,
  };
  await db.notificationSettings.upsert({
    where: { workspaceId: workspace.id },
    update: data,
    create: { workspaceId: workspace.id, ...data },
  });
  revalidatePath(PAGE);
  return { ok: true };
}

/**
 * Change plan. With payments configured this goes through Dodo Payments (see src/server/billing):
 * the result is a checkout or portal URL to send the owner to, or an immediate plan change for a
 * workspace that already pays. Without payments it only works in demo mode
 * (ALLOW_FREE_PLAN_CHANGE=true), where the plan is switched for free.
 */
export async function changePlanAction(planId: string): Promise<{ error?: string; url?: string }> {
  const { workspace, role, user } = await requireWorkspace();
  if (role !== "owner") return { error: "errors.ownerOnly" };

  if (paymentsConfigured()) {
    try {
      const result = await startCheckout(workspace.id, planId, { email: user.email, name: user.name });
      if ("error" in result) return { error: result.error };
      revalidatePath("/dashboard", "layout");
      return "url" in result ? { url: result.url } : {};
    } catch (err) {
      console.error("[billing] plan change failed", err);
      return { error: "settings.billingError" };
    }
  }

  if (!freePlanChangeAllowed()) return { error: "settings.planChangeUnavailable" };
  if (!(await setWorkspacePlan(workspace.id, planId))) return { error: "errors.generic" };
  revalidatePath("/dashboard", "layout");
  return {};
}

/** Link to Dodo's customer portal (cancel, change card, invoices). Owners only. */
export async function billingPortalAction(): Promise<{ error?: string; url?: string }> {
  const { workspace, role } = await requireWorkspace();
  if (role !== "owner") return { error: "errors.ownerOnly" };
  try {
    const url = await billingPortalUrl(workspace.id);
    return url ? { url } : { error: "errors.generic" };
  } catch (err) {
    console.error("[billing] portal failed", err);
    return { error: "settings.billingError" };
  }
}

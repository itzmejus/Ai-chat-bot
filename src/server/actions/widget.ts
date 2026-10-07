"use server";

import { revalidatePath } from "next/cache";
import { widgetSettingsSchema } from "@/lib/validation";
import { normalizeDomain } from "@/lib/widget-domains";
import { requireWorkspace } from "@/server/auth/session";
import type { FormState } from "./auth";

const MAX_DOMAINS = 20;

/**
 * Save the widget's appearance, the assistant's name and greeting, and the
 * list of websites allowed to show the widget. Owners only.
 */
export async function saveWidgetSettingsAction(_prev: FormState, formData: FormData): Promise<FormState> {
  const { db, workspace, role } = await requireWorkspace();
  if (role !== "owner") return { error: "errors.ownerOnly" };

  const parsed = widgetSettingsSchema.safeParse({
    brandColor: formData.get("brandColor"),
    logoUrl: formData.get("logoUrl") ?? "",
    position: formData.get("position"),
    preChatForm: formData.get("preChatForm") === "on",
    showProducts: formData.get("showProducts") === "on",
    assistantName: formData.get("assistantName"),
    greeting: formData.get("greeting"),
  });
  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) fieldErrors[issue.path.join(".")] ??= issue.message;
    return { fieldErrors };
  }

  // One domain per line. Every entry is normalised; anything unusable rejects the save.
  const domains: string[] = [];
  for (const line of String(formData.get("allowedDomains") ?? "").split(/[\n,]+/)) {
    if (!line.trim()) continue;
    const domain = normalizeDomain(line);
    if (!domain) return { fieldErrors: { allowedDomains: "errors.domainInvalid" } };
    if (!domains.includes(domain)) domains.push(domain);
  }
  if (domains.length > MAX_DOMAINS) return { fieldErrors: { allowedDomains: "errors.tooManyDomains" } };

  const { assistantName, greeting, ...widget } = parsed.data;
  const workspaceId = workspace.id;
  await db.widgetSettings.upsert({
    where: { workspaceId },
    update: { ...widget, allowedDomains: domains },
    create: { workspaceId, ...widget, allowedDomains: domains },
  });
  await db.assistantSettings.upsert({
    where: { workspaceId },
    update: { assistantName, greeting },
    create: { workspaceId, assistantName, greeting },
  });

  revalidatePath("/dashboard/widget");
  revalidatePath("/dashboard/knowledge");
  return { ok: true };
}

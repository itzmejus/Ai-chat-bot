"use server";

import { revalidatePath } from "next/cache";
import { assistantSettingsSchema } from "@/lib/validation";
import { requireWorkspace } from "@/server/auth/session";
import type { FormState } from "./auth";

/** Update the assistant's name, greeting, tone and extra instructions. Owners only. */
export async function saveAssistantSettingsAction(_prev: FormState, formData: FormData): Promise<FormState> {
  const { db, workspace, role } = await requireWorkspace();
  if (role !== "owner") return { error: "errors.ownerOnly" };

  const parsed = assistantSettingsSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) fieldErrors[issue.path.join(".")] ??= issue.message;
    return { fieldErrors };
  }

  await db.assistantSettings.upsert({
    where: { workspaceId: workspace.id },
    update: parsed.data,
    create: { workspaceId: workspace.id, ...parsed.data },
  });
  revalidatePath("/dashboard/knowledge");
  return { ok: true };
}

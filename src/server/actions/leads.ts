"use server";

import { revalidatePath } from "next/cache";
import { requireWorkspace } from "@/server/auth/session";
import { LEAD_STATUSES, setLeadStatus, type LeadStatus } from "@/server/leads";

/** Change a lead's status (new, contacted, converted). */
export async function setLeadStatusAction(leadId: string, status: string): Promise<{ ok: boolean }> {
  const { db } = await requireWorkspace();
  if (!(LEAD_STATUSES as readonly string[]).includes(status)) return { ok: false };
  const ok = await setLeadStatus(db, leadId, status as LeadStatus);
  revalidatePath("/dashboard/leads");
  revalidatePath("/dashboard");
  return { ok };
}

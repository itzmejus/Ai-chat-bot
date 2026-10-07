import type { TenantDb } from "@/server/db/tenant";

/** Lead operations. All take the workspace-scoped `db`. */

export const LEAD_STATUSES = ["new", "contacted", "converted"] as const;
export type LeadStatus = (typeof LEAD_STATUSES)[number];

export type LeadFilter = { status?: LeadStatus; search?: string };

export function listLeads(db: TenantDb, filter: LeadFilter = {}, limit = 200) {
  const search = filter.search?.trim();
  return db.lead.findMany({
    where: {
      status: filter.status,
      ...(search
        ? {
            OR: [
              { name: { contains: search, mode: "insensitive" as const } },
              { phone: { contains: search } },
              { email: { contains: search, mode: "insensitive" as const } },
            ],
          }
        : {}),
    },
    orderBy: { createdAt: "desc" },
    take: limit,
    select: { id: true, name: true, phone: true, email: true, interest: true, status: true, conversationId: true, createdAt: true },
  });
}

export async function leadCounts(db: TenantDb) {
  const rows = await db.lead.groupBy({ by: ["status"], _count: { _all: true } });
  const n = (status: LeadStatus) => rows.find((r) => r.status === status)?._count._all ?? 0;
  return { all: rows.reduce((sum, r) => sum + r._count._all, 0), new: n("new"), contacted: n("contacted"), converted: n("converted") };
}

/** Returns false if the lead does not exist in this workspace. */
export async function setLeadStatus(db: TenantDb, id: string, status: LeadStatus): Promise<boolean> {
  const { count } = await db.lead.updateMany({ where: { id }, data: { status } });
  return count > 0;
}

/**
 * One CSV cell. Quotes are doubled, and a value that a spreadsheet would run as
 * a formula (starting with = + - @) is prefixed with an apostrophe: names and
 * emails here were typed by anonymous website visitors.
 */
export function csvCell(value: string | null | undefined): string {
  let text = value ?? "";
  if (/^[=+\-@\t\r]/.test(text)) text = `'${text}`;
  return `"${text.replace(/"/g, '""')}"`;
}

export function leadsToCsv(
  leads: Awaited<ReturnType<typeof listLeads>>,
  conversationUrl: (conversationId: string) => string,
): string {
  const header = ["Name", "Phone", "Email", "Interested in", "Status", "Date", "Conversation"];
  const rows = leads.map((lead) =>
    [lead.name, lead.phone, lead.email, lead.interest, lead.status, lead.createdAt.toISOString(), lead.conversationId ? conversationUrl(lead.conversationId) : ""]
      .map(csvCell)
      .join(","),
  );
  // The leading BOM makes Excel read the file as UTF-8, so Arabic names display correctly.
  return `﻿${[header.map(csvCell).join(","), ...rows].join("\r\n")}\r\n`;
}

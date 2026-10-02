import { APP_URL } from "@/lib/config";
import { getWorkspaceContext } from "@/server/auth/session";
import { LEAD_STATUSES, leadsToCsv, listLeads, type LeadStatus } from "@/server/leads";

/** GET /api/leads/export?status=&q= — the leads of this workspace as a CSV download. */
export async function GET(request: Request) {
  const ctx = await getWorkspaceContext();
  if (!ctx) return Response.json({ error: "errors.unauthorized" }, { status: 401 });

  const params = new URL(request.url).searchParams;
  const requested = params.get("status") ?? "";
  const status = (LEAD_STATUSES as readonly string[]).includes(requested) ? (requested as LeadStatus) : undefined;

  const leads = await listLeads(ctx.db, { status, search: (params.get("q") ?? "").slice(0, 100) }, 5000);
  const csv = leadsToCsv(leads, (id) => `${APP_URL}/dashboard/inbox?c=${id}`);
  const date = new Date().toISOString().slice(0, 10);

  return new Response(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="leads-${date}.csv"`,
      "Cache-Control": "no-store",
    },
  });
}

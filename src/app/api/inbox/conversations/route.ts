import { getWorkspaceContext } from "@/server/auth/session";
import { inboxCounts, INBOX_FILTERS, listConversations, type InboxFilter } from "@/server/inbox";

/** GET /api/inbox/conversations?filter=all|needs_human|ai|closed&q=search — the inbox list and tab counts. */
export async function GET(request: Request) {
  const ctx = await getWorkspaceContext();
  if (!ctx) return Response.json({ error: "errors.unauthorized" }, { status: 401 });

  const params = new URL(request.url).searchParams;
  const requested = params.get("filter") ?? "all";
  const filter: InboxFilter = (INBOX_FILTERS as readonly string[]).includes(requested) ? (requested as InboxFilter) : "all";
  const search = (params.get("q") ?? "").slice(0, 100);

  const scope = { db: ctx.db, workspaceId: ctx.workspace.id };
  const [conversations, counts] = await Promise.all([listConversations(scope, { filter, search }), inboxCounts(scope)]);
  return Response.json({ conversations, counts });
}

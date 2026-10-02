import { z } from "zod";
import { APP_URL } from "@/lib/config";
import { getWorkspaceContext } from "@/server/auth/session";
import { closeConversation, getConversation, InboxError, reopenConversation, returnToAi, sendAgentMessage, takeOver } from "@/server/inbox";

/** GET /api/inbox/conversations/[id] — one conversation with its messages. Marks it read. */
export async function GET(_request: Request, ctx: RouteContext<"/api/inbox/conversations/[id]">) {
  const workspace = await getWorkspaceContext();
  if (!workspace) return Response.json({ error: "errors.unauthorized" }, { status: 401 });

  const { id } = await ctx.params;
  const conversation = await getConversation({ db: workspace.db, workspaceId: workspace.workspace.id }, id);
  if (!conversation) return Response.json({ error: "inbox.errors.not_found" }, { status: 404 });
  return Response.json({ conversation });
}

const actionSchema = z.discriminatedUnion("action", [
  z.object({ action: z.literal("takeover") }),
  z.object({ action: z.literal("return") }),
  z.object({ action: z.literal("close") }),
  z.object({ action: z.literal("reopen") }),
  z.object({ action: z.literal("reply"), text: z.string().trim().min(1).max(2000) }),
]);

/**
 * POST /api/inbox/conversations/[id] — agent actions:
 * take over, return to AI, close, reopen, or send a reply.
 */
export async function POST(request: Request, ctx: RouteContext<"/api/inbox/conversations/[id]">) {
  const workspace = await getWorkspaceContext();
  if (!workspace) return Response.json({ error: "errors.unauthorized" }, { status: 401 });

  // The login cookie is SameSite=Lax, which already keeps other sites from posting with it.
  // Checking the Origin header as well costs nothing.
  const origin = request.headers.get("origin");
  const host = request.headers.get("x-forwarded-host") ?? request.headers.get("host");
  if (origin && new URL(origin).host !== host && origin !== new URL(APP_URL).origin) {
    return Response.json({ error: "errors.unauthorized" }, { status: 403 });
  }

  const parsed = actionSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return Response.json({ error: "errors.generic" }, { status: 400 });

  const { id } = await ctx.params;
  const scope = { db: workspace.db, workspaceId: workspace.workspace.id };
  const agent = workspace.user;

  try {
    switch (parsed.data.action) {
      case "takeover":
        await takeOver(scope, id, agent);
        break;
      case "return":
        await returnToAi(scope, id);
        break;
      case "close":
        await closeConversation(scope, id);
        break;
      case "reopen":
        await reopenConversation(scope, id);
        break;
      case "reply":
        await sendAgentMessage(scope, id, agent, parsed.data.text);
        break;
    }
  } catch (err) {
    if (err instanceof InboxError) {
      return Response.json({ error: `inbox.errors.${err.code}` }, { status: err.code === "not_found" ? 404 : 409 });
    }
    console.error("[inbox] action failed", err);
    return Response.json({ error: "errors.generic" }, { status: 500 });
  }
  return Response.json({ ok: true });
}

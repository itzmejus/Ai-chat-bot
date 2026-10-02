import { getWorkspaceContext } from "@/server/auth/session";
import { streamEvents } from "@/server/realtime/bus";
import { sseResponse } from "@/server/realtime/sse";

/**
 * GET /api/inbox/stream — live updates for the dashboard inbox.
 * Sends `change {conversationId, type}` whenever a conversation in this
 * workspace changes; the page then re-fetches what it is showing. Only events
 * of the signed-in user's workspace are forwarded.
 */
export async function GET(request: Request) {
  const ctx = await getWorkspaceContext();
  if (!ctx) return Response.json({ error: "errors.unauthorized" }, { status: 401 });
  const workspaceId = ctx.workspace.id;

  return sseResponse(async (send, signal) => {
    send("ready", {});
    await streamEvents(
      send,
      signal,
      (event) => event.workspaceId === workspaceId,
      (event) => send("change", { conversationId: event.conversationId, type: event.type }),
    );
  }, request);
}

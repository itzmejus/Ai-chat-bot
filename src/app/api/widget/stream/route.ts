import { decodeSystemEvent } from "@/lib/system-events";
import { streamEvents } from "@/server/realtime/bus";
import { sseResponse } from "@/server/realtime/sse";
import { authenticateWidget, conversationIdSchema, errorJson, findVisitorConversation, visitorIdSchema } from "@/server/widget/service";

/**
 * GET /api/widget/stream?visitorId=…&conversationId=… — live updates for the
 * customer's widget while a conversation is open:
 *   message {id, role, content}   a reply typed by a team member
 *   event   {code}                agent joined, returned to the assistant, chat closed…
 * The assistant's own replies are not sent here; the widget already receives
 * those on the request that asked for them.
 */
export async function GET(request: Request) {
  const widget = authenticateWidget(request);
  if (!widget) return errorJson("unauthorized", 401);

  const params = new URL(request.url).searchParams;
  const visitorId = visitorIdSchema.safeParse(params.get("visitorId"));
  const conversationId = conversationIdSchema.safeParse(params.get("conversationId"));
  if (!visitorId.success || !conversationId.success) return errorJson("invalid", 400);

  const { db, workspaceId } = widget;
  // Only the visitor who owns the conversation may listen to it.
  const conversation = await findVisitorConversation(db, visitorId.data, conversationId.data);
  if (!conversation) return errorJson("not_found", 404);
  const id = conversation.id;

  return sseResponse(async (send, signal) => {
    send("ready", {});
    await streamEvents(
      send,
      signal,
      (event) => event.workspaceId === workspaceId && event.conversationId === id && event.type === "message" && Boolean(event.messageId),
      async (event) => {
        const message = await db.message.findFirst({
          where: { id: event.messageId, conversationId: id },
          select: { id: true, role: true, content: true },
        });
        if (!message) return;
        if (message.role === "agent") {
          send("message", message);
        } else if (message.role === "system") {
          // Only the event code goes to the customer, never the agent's name or other detail.
          const decoded = decodeSystemEvent(message.content);
          if (decoded) send("event", { id: message.id, code: decoded.code });
        }
      },
    );
  }, request);
}

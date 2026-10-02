import { z } from "zod";
import { answerMessage } from "@/server/ai/answer";
import { sseResponse } from "@/server/realtime/sse";
import {
  authenticateWidget,
  chatRateLimitOk,
  clientIp,
  conversationIdSchema,
  errorJson,
  findVisitorConversation,
  visitorIdSchema,
} from "@/server/widget/service";

const bodySchema = z.object({
  visitorId: visitorIdSchema,
  conversationId: conversationIdSchema.optional(),
  text: z.string().trim().min(1).max(2000),
});

/**
 * POST /api/widget/message — a customer message from the web widget.
 * Streams the assistant's reply as Server-Sent Events:
 *   conversation {id} → token {text} … → done {needsHuman, paused}
 * This route only handles transport and abuse limits; the answer itself comes
 * from the shared answering service.
 */
export async function POST(request: Request) {
  const widget = authenticateWidget(request);
  if (!widget) return errorJson("unauthorized", 401);

  const parsed = bodySchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return errorJson("invalid", 400);
  const { visitorId, text } = parsed.data;
  const { db, workspaceId, preview } = widget;

  if (!(await chatRateLimitOk(workspaceId, visitorId, clientIp(request)))) return errorJson("rate_limited", 429);

  let conversation = await findVisitorConversation(db, visitorId, parsed.data.conversationId);
  if (!conversation) {
    // If the business requires the pre-chat form, a conversation must be started through it.
    const settings = await db.widgetSettings.findFirst({ select: { preChatForm: true } });
    if (settings?.preChatForm) return errorJson("form_required", 400);
    conversation = await db.conversation.create({ data: { workspaceId, visitorId, isTest: preview } });
  }
  const conversationId = conversation.id;

  return sseResponse(async (send) => {
    send("conversation", { id: conversationId });
    for await (const event of answerMessage({ workspaceId, conversationId, text })) {
      if (event.type === "token") send("token", { text: event.text });
      else send("done", { needsHuman: event.result.needsHuman, paused: event.result.skipped === "human_takeover" });
    }
  }, request);
}

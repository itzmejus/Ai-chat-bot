import { z } from "zod";
import { authenticateWidget, clientIp, errorJson, visitorIdSchema, visitorText } from "@/server/widget/service";
import { rateLimit } from "@/server/limits/rate-limit";
import { notifyLeadCaptured } from "@/server/notifications";

const bodySchema = z.object({
  visitorId: visitorIdSchema,
  name: visitorText(80),
  phone: z
    .string()
    .trim()
    .regex(/^\+?[0-9][0-9\s-]{6,20}$/),
});

/**
 * POST /api/widget/start — the optional pre-chat form (name and phone).
 * Starts the conversation and records the visitor as a lead straight away.
 * Only while the business has the form switched on: otherwise anyone could post here to
 * create leads (and lead emails) without ever chatting.
 */
export async function POST(request: Request) {
  const widget = authenticateWidget(request);
  if (!widget) return errorJson("unauthorized", 401);

  const parsed = bodySchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return errorJson("invalid", 400);
  const { visitorId, name, phone } = parsed.data;

  if (!(await rateLimit(`start:${widget.workspaceId}:${clientIp(request)}`, 10, 600))) return errorJson("rate_limited", 429);

  const { db, workspaceId, preview } = widget;
  const settings = await db.widgetSettings.findFirst({ select: { preChatForm: true } });
  if (!settings?.preChatForm) return errorJson("form_disabled", 400);

  const conversation = await db.conversation.create({
    data: { workspaceId, visitorId, visitorName: name, visitorPhone: phone, isTest: preview, unread: false },
    select: { id: true },
  });
  // Preview chats from the dashboard are not real leads.
  if (!preview) {
    const lead = await db.lead.create({ data: { workspaceId, conversationId: conversation.id, name, phone }, select: { id: true } });
    void notifyLeadCaptured(workspaceId, lead.id).catch((err) => console.error("[notify] lead email failed", err));
  }

  return Response.json({ conversationId: conversation.id });
}

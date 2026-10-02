import { z } from "zod";
import { rateLimit } from "@/server/limits/rate-limit";
import { authenticateWidget, clientIp, conversationIdSchema, errorJson, findVisitorConversation, visitorIdSchema } from "@/server/widget/service";

const bodySchema = z.object({
  visitorId: visitorIdSchema,
  conversationId: conversationIdSchema.optional(),
  /** Language the widget is currently showing, for the confirmation message. */
  locale: z.enum(["en", "ar"]).default("en"),
});

const CONFIRMATION = {
  en: "I've let the team know. Someone will join this chat as soon as possible. You can leave your name and phone number here in case we miss you.",
  ar: "تم إبلاغ الفريق، وسينضم أحد الموظفين إلى المحادثة في أقرب وقت. يمكنك ترك اسمك ورقم هاتفك هنا لنتواصل معك.",
};

/**
 * POST /api/widget/human — the "Talk to a human" button.
 * Flags the conversation as needing a person (it shows up under "needs human"
 * in the inbox) and tells the customer what happens next. No model call is made.
 */
export async function POST(request: Request) {
  const widget = authenticateWidget(request);
  if (!widget) return errorJson("unauthorized", 401);

  const parsed = bodySchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return errorJson("invalid", 400);
  const { visitorId, locale } = parsed.data;
  const { db, workspaceId, preview } = widget;

  if (!(await rateLimit(`human:${workspaceId}:${clientIp(request)}`, 6, 600))) return errorJson("rate_limited", 429);

  let conversation = await findVisitorConversation(db, visitorId, parsed.data.conversationId);
  if (!conversation) {
    const settings = await db.widgetSettings.findFirst({ select: { preChatForm: true } });
    if (settings?.preChatForm) return errorJson("form_required", 400);
    conversation = await db.conversation.create({ data: { workspaceId, visitorId, isTest: preview } });
  }
  const conversationId = conversation.id;

  // The system message is for the inbox; the customer sees the confirmation.
  await db.message.create({ data: { workspaceId, conversationId, role: "system", content: "Customer asked to talk to a human." } });
  const reply = await db.message.create({
    data: { workspaceId, conversationId, role: "assistant", content: CONFIRMATION[locale], answered: true },
    select: { id: true, content: true },
  });
  // An agent who has already taken over stays in charge.
  if (conversation.status !== "human") {
    await db.conversation.update({ where: { id: conversationId }, data: { status: "needs_human", unread: true, lastMessageAt: new Date() } });
  }

  return Response.json({ conversationId, message: reply });
}

import { z } from "zod";
import { CHAT_LOCALES, type ChatLocale } from "@/lib/chat-locales";
import { encodeSystemEvent } from "@/lib/system-events";
import { rateLimit } from "@/server/limits/rate-limit";
import { notifyNeedsHuman } from "@/server/notifications";
import { publish } from "@/server/realtime/bus";
import { authenticateWidget, clientIp, conversationIdSchema, errorJson, findVisitorConversation, visitorIdSchema } from "@/server/widget/service";

const bodySchema = z.object({
  visitorId: visitorIdSchema,
  conversationId: conversationIdSchema.optional(),
  /** Language the widget is currently showing, for the confirmation message. */
  locale: z.enum(CHAT_LOCALES).default("en"),
});

const CONFIRMATION: Record<ChatLocale, string> = {
  en: "I've let the team know. Someone will join this chat as soon as possible. You can leave your name and phone number here in case we miss you.",
  ar: "تم إبلاغ الفريق، وسينضم أحد الموظفين إلى المحادثة في أقرب وقت. يمكنك ترك اسمك ورقم هاتفك هنا لنتواصل معك.",
  fr: "J'ai prévenu l'équipe. Quelqu'un rejoindra cette conversation dès que possible. Vous pouvez laisser votre nom et votre numéro de téléphone ici pour que nous puissions vous recontacter.",
  hi: "मैंने टीम को सूचित कर दिया है। कोई जल्द से जल्द इस चैट में शामिल होगा। आप अपना नाम और फ़ोन नंबर यहाँ छोड़ सकते हैं ताकि हम आपसे संपर्क कर सकें।",
  ur: "میں نے ٹیم کو اطلاع دے دی ہے۔ کوئی جلد از جلد اس چیٹ میں شامل ہوگا۔ آپ اپنا نام اور فون نمبر یہاں چھوڑ سکتے ہیں تاکہ ہم آپ سے رابطہ کر سکیں۔",
  ru: "Я сообщил команде. Сотрудник подключится к чату как можно скорее. Вы можете оставить здесь своё имя и номер телефона, чтобы мы могли с вами связаться.",
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
  await db.message.create({ data: { workspaceId, conversationId, role: "system", content: encodeSystemEvent("human_requested") } });
  const reply = await db.message.create({
    data: { workspaceId, conversationId, role: "assistant", content: CONFIRMATION[locale], answered: true },
    select: { id: true, content: true },
  });
  // An agent who has already taken over stays in charge.
  if (conversation.status !== "human") {
    await db.conversation.update({ where: { id: conversationId }, data: { status: "needs_human", unread: true, lastMessageAt: new Date() } });
    // Email the team once, when the chat first starts waiting.
    if (!preview && conversation.status !== "needs_human") {
      void notifyNeedsHuman(workspaceId, conversationId).catch((err) => console.error("[notify] needs-human email failed", err));
    }
  }

  await publish({ workspaceId, conversationId, type: "message", messageId: reply.id });
  await publish({ workspaceId, conversationId, type: "conversation" });

  return Response.json({ conversationId, message: reply });
}

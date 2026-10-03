import { APP_URL } from "@/lib/config";
import { tenantDb } from "@/server/db/tenant";
import { sendEmail, type EmailContent } from "@/server/email/mailer";
import { sendWhatsAppTemplate } from "@/server/whatsapp/client";

/**
 * Notifications to the business: a lead was captured (email), or a customer
 * needs a person (email and WhatsApp). Each respects the workspace's notification settings.
 *
 * Callers do not wait for these (`void notify…`): a notification must never delay or
 * break a customer's chat. Failures are logged by the mailer and the WhatsApp client.
 */

/**
 * The approved WhatsApp template used for "a customer needs a person". Its body has three
 * variables: {{1}} business name, {{2}} customer, {{3}} their last message. See docs/DEPLOYMENT.md.
 */
const WHATSAPP_NEEDS_HUMAN_TEMPLATE = () => process.env.WHATSAPP_TEMPLATE_NEEDS_HUMAN || "needs_human_alert";

const TEXT = {
  en: {
    leadSubject: (business: string) => `New lead for ${business}`,
    leadHeading: "You have a new lead",
    leadLine: "A customer shared their contact details in a chat.",
    name: "Name",
    phone: "Phone",
    email: "Email",
    openChat: "Open the conversation",
    humanSubject: (business: string) => `A customer is waiting for ${business}`,
    humanHeading: "A customer needs a person",
    humanLine: "The assistant could not help, or the customer asked for a human. Take over the chat to reply.",
    lastMessage: "Their last message",
    customer: "Customer",
    visitor: "Website visitor",
  },
  ar: {
    leadSubject: (business: string) => `عميل محتمل جديد لـ ${business}`,
    leadHeading: "لديك عميل محتمل جديد",
    leadLine: "شارك أحد العملاء بيانات التواصل في المحادثة.",
    name: "الاسم",
    phone: "الهاتف",
    email: "البريد الإلكتروني",
    openChat: "فتح المحادثة",
    humanSubject: (business: string) => `عميل بانتظار ${business}`,
    humanHeading: "عميل يحتاج إلى موظف",
    humanLine: "لم يتمكن المساعد من المساعدة، أو طلب العميل التحدث مع موظف. استلم المحادثة للرد.",
    lastMessage: "آخر رسالة منه",
    customer: "العميل",
    visitor: "زائر الموقع",
  },
};

/** Who to tell and in which language. Returns null when this kind of notification is off. */
async function audience(workspaceId: string, kind: "notifyOnLead" | "notifyOnNeedsHuman") {
  const db = tenantDb(workspaceId);
  const [settings, workspace] = await Promise.all([
    db.notificationSettings.findFirst(),
    db.workspace.findFirst({ select: { name: true, defaultLanguage: true } }),
  ]);
  if (!settings || !workspace || !settings[kind]) return null;
  // WhatsApp alerts are sent for "needs a person" only: that is the one a team must act on at once.
  const whatsapp = kind === "notifyOnNeedsHuman" ? settings.whatsappNumbers : [];
  if (settings.emails.length === 0 && whatsapp.length === 0) return null;
  const locale = workspace.defaultLanguage === "ar" ? "ar" : "en";
  return { db, to: settings.emails, whatsapp, locale, business: workspace.name, t: TEXT[locale], rtl: locale === "ar" } as const;
}

export async function notifyLeadCaptured(workspaceId: string, leadId: string): Promise<boolean> {
  const a = await audience(workspaceId, "notifyOnLead");
  if (!a || a.to.length === 0) return false;
  const lead = await a.db.lead.findFirst({ where: { id: leadId } });
  if (!lead) return false;

  const content: EmailContent = {
    subject: a.t.leadSubject(a.business),
    heading: a.t.leadHeading,
    lines: [a.t.leadLine],
    details: [
      [a.t.name, lead.name ?? "–"],
      [a.t.phone, lead.phone ?? "–"],
      [a.t.email, lead.email ?? "–"],
    ],
    action: lead.conversationId ? { label: a.t.openChat, url: `${APP_URL}/dashboard/inbox?c=${lead.conversationId}` } : undefined,
    rtl: a.rtl,
  };
  return sendEmail(a.to, content);
}

export async function notifyNeedsHuman(workspaceId: string, conversationId: string): Promise<boolean> {
  const a = await audience(workspaceId, "notifyOnNeedsHuman");
  if (!a) return false;
  const conversation = await a.db.conversation.findFirst({
    where: { id: conversationId, isTest: false },
    select: {
      visitorName: true,
      visitorPhone: true,
      messages: { where: { role: "customer" }, orderBy: { createdAt: "desc" }, take: 1, select: { content: true } },
    },
  });
  if (!conversation) return false;

  const customer = conversation.visitorName ?? a.t.visitor;
  const lastMessage = conversation.messages[0]?.content.slice(0, 300);

  const content: EmailContent = {
    subject: a.t.humanSubject(a.business),
    heading: a.t.humanHeading,
    lines: [a.t.humanLine],
    details: [
      [a.t.customer, customer],
      ...(conversation.visitorPhone ? ([[a.t.phone, conversation.visitorPhone]] as [string, string][]) : []),
      ...(lastMessage ? ([[a.t.lastMessage, lastMessage]] as [string, string][]) : []),
    ],
    action: { label: a.t.openChat, url: `${APP_URL}/dashboard/inbox?c=${conversationId}` },
    rtl: a.rtl,
  };

  // Email and WhatsApp go out side by side; one failing does not stop the other.
  const who = conversation.visitorPhone ? `${customer} (${conversation.visitorPhone})` : customer;
  const [emailed, ...messaged] = await Promise.all([
    a.to.length > 0 ? sendEmail(a.to, content) : false,
    ...a.whatsapp.map((number) => sendWhatsAppTemplate(number, WHATSAPP_NEEDS_HUMAN_TEMPLATE(), a.locale, [a.business, who, lastMessage ?? "–"])),
  ]);
  return emailed || messaged.some(Boolean);
}

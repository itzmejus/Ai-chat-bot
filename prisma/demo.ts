/**
 * Demo data: "Bright Smile Dental Clinic", a dental clinic in Dubai with English and
 * Arabic FAQs, business notes, and a handful of past conversations and leads so every
 * dashboard page has something to show.
 *
 * `seedDemo()` is called by `npm run db:seed` (prisma/seed.ts) and by tests/seed.test.ts.
 * It is safe to run again: the previous demo workspace and demo user are replaced.
 * Nothing outside the demo workspace is touched.
 */
import bcrypt from "bcryptjs";
import { encodeSystemEvent, type SystemEventCode } from "@/lib/system-events";
import type { WorkingHours } from "@/lib/validation";
import { embedTexts } from "@/server/ai/openai";
import { saveQuestionEmbedding } from "@/server/analytics";
import { prisma } from "@/server/db/prisma";
import { tenantDb } from "@/server/db/tenant";
import { processSource } from "@/server/ingest/process";
import { currentMonth } from "@/server/limits/usage";
import { createWorkspaceForUser } from "@/server/workspaces";

export const DEMO_EMAIL = "demo@brightsmile.example";
export const DEMO_OWNER_NAME = "Sara Ahmed";
/** Fixed so examples/test-page.html works straight after seeding. Widget keys are not secrets. */
export const DEMO_PUBLIC_KEY = "pk_de30de30de30de30de30de30de30de30";

const OPEN = { open: "09:00", close: "21:00", closed: false };
const WORKING_HOURS: WorkingHours = {
  mon: OPEN,
  tue: OPEN,
  wed: OPEN,
  thu: OPEN,
  fri: { open: "09:00", close: "21:00", closed: true },
  sat: OPEN,
  sun: OPEN,
};

const FAQS: [question: string, answer: string][] = [
  // English
  ["How much does a dental check-up cost?", "A check-up with one of our dentists costs AED 150. It includes an examination and a treatment plan. X-rays, if needed, are AED 100 extra."],
  ["How much is teeth cleaning?", "Scaling and polishing costs AED 250 and takes about 40 minutes. We recommend a cleaning every six months."],
  ["How much is teeth whitening?", "In-clinic laser whitening costs AED 900 for a one-hour session. A take-home whitening kit is AED 600."],
  ["Do you accept insurance?", "Yes. We work directly with Daman, AXA, Oman Insurance (Sukoon), MetLife and NAS. Please bring your insurance card and Emirates ID. Cosmetic treatments such as whitening are usually not covered."],
  ["Where is the clinic and is there parking?", "We are in Al Wasl Tower, Office 1204, Sheikh Zayed Road, Dubai, a five-minute walk from Financial Centre metro station. Free parking for patients is available in the building; ask reception to validate your ticket."],
  ["How do I book an appointment?", "You can book by phone or WhatsApp on +971 4 555 0100, or leave your name and phone number here in the chat and our reception will call you to confirm a time."],
  ["Do you treat children?", "Yes. Dr. Layla Hassan is our paediatric dentist and sees children from the age of two. A child's check-up costs AED 120."],
  ["Do you handle dental emergencies?", "Yes. During opening hours we keep same-day slots for emergencies such as severe toothache or a broken tooth. Call +971 4 555 0100 so we can prepare for you. An emergency consultation costs AED 200."],
  ["What is your cancellation policy?", "Please let us know at least 24 hours before your appointment if you need to cancel or reschedule. There is no charge for the first missed appointment; after that a fee of AED 50 applies."],
  // Arabic
  ["كم سعر فحص الأسنان؟", "سعر الفحص عند أحد أطبائنا 150 درهماً، ويشمل الكشف وخطة العلاج. الأشعة عند الحاجة بـ 100 درهم إضافية."],
  ["كم سعر تنظيف الأسنان؟", "تنظيف وتلميع الأسنان بـ 250 درهماً ويستغرق حوالي 40 دقيقة. ننصح بالتنظيف كل ستة أشهر."],
  ["كم سعر تبييض الأسنان؟", "تبييض الأسنان بالليزر في العيادة بـ 900 درهم لجلسة مدتها ساعة. طقم التبييض المنزلي بـ 600 درهم."],
  ["هل تقبلون التأمين الصحي؟", "نعم. نتعامل مباشرة مع ضمان، أكسا، عُمان للتأمين (سكون)، ميتلايف وناس. يرجى إحضار بطاقة التأمين والهوية الإماراتية. العلاجات التجميلية مثل التبييض غير مشمولة بالتأمين في العادة."],
  ["أين تقع العيادة وهل يوجد موقف سيارات؟", "نحن في برج الوصل، مكتب 1204، شارع الشيخ زايد، دبي، على بعد خمس دقائق مشياً من محطة مترو المركز المالي. يتوفر موقف مجاني للمرضى في المبنى؛ اطلب من الاستقبال ختم تذكرة الموقف."],
  ["كيف أحجز موعداً؟", "يمكنك الحجز عبر الهاتف أو واتساب على الرقم ‎+971 4 555 0100، أو اترك اسمك ورقم هاتفك هنا في المحادثة وسيتصل بك موظف الاستقبال لتأكيد الموعد."],
  ["هل تعالجون الأطفال؟", "نعم. الدكتورة ليلى حسن طبيبة أسنان الأطفال لدينا وتستقبل الأطفال من عمر سنتين. فحص الطفل بـ 120 درهماً."],
  ["هل تستقبلون الحالات الطارئة؟", "نعم. خلال ساعات العمل نخصص مواعيد في نفس اليوم للحالات الطارئة مثل ألم الأسنان الشديد أو كسر السن. اتصل على ‎+971 4 555 0100 لنستعد لاستقبالك. سعر الكشف الطارئ 200 درهم."],
  ["ما هي أوقات العمل؟", "نعمل من السبت إلى الخميس من الساعة 9 صباحاً حتى 9 مساءً. العيادة مغلقة يوم الجمعة."],
];

const NOTES = `About Bright Smile Dental Clinic
Bright Smile is a family dental clinic on Sheikh Zayed Road, Dubai, open since 2015 and licensed by the Dubai Health Authority (DHA).

Opening hours: Saturday to Thursday, 9:00 am to 9:00 pm. Closed on Fridays.

Our dentists
- Dr. Omar Al Farsi, general and cosmetic dentistry (speaks Arabic and English)
- Dr. Layla Hassan, paediatric dentistry (speaks Arabic, English and French)
- Dr. Priya Nair, orthodontics (speaks English, Hindi and Malayalam)

Price list (AED)
- Check-up: 150 (children: 120)
- X-ray: 100
- Scaling and polishing: 250
- Tooth-coloured filling: from 350
- Tooth extraction: from 300
- Root canal treatment: from 1,500
- Laser whitening: 900
- Metal braces: from 8,000, payable in monthly instalments over the treatment

Payment: cash, credit and debit cards, Apple Pay.

نبذة بالعربية
عيادة برايت سمايل لطب الأسنان عيادة عائلية على شارع الشيخ زايد في دبي، تعمل منذ عام 2015 ومرخصة من هيئة الصحة بدبي. أوقات العمل من السبت إلى الخميس من 9 صباحاً حتى 9 مساءً، والعيادة مغلقة يوم الجمعة. طرق الدفع: نقداً، البطاقات الائتمانية وبطاقات الخصم، وApple Pay.`;

type Turn =
  | { from: "customer"; text: string }
  | { from: "assistant"; text: string; answered: boolean; confidence: number }
  | { from: "agent"; text: string }
  | { from: "system"; event: SystemEventCode; detail?: string };

type DemoConversation = {
  daysAgo: number;
  /** Hour of the day (UAE time) the chat started. */
  hour: number;
  status: "ai" | "needs_human" | "human" | "closed";
  unread?: boolean;
  lead?: { name: string; phone?: string; email?: string; status: "new" | "contacted" | "converted" };
  turns: Turn[];
};

const customer = (text: string): Turn => ({ from: "customer", text });
const ai = (text: string, confidence = 0.86): Turn => ({ from: "assistant", text, answered: true, confidence });
const aiUnsure = (text: string): Turn => ({ from: "assistant", text, answered: false, confidence: 0.15 });

const CONVERSATIONS: DemoConversation[] = [
  {
    daysAgo: 0,
    hour: 10,
    status: "ai",
    turns: [
      customer("How much is teeth whitening?"),
      ai("In-clinic laser whitening is AED 900 for a one-hour session, and a take-home whitening kit is AED 600. Would you like to book a session?"),
      customer("Do you accept insurance for that?"),
      ai("We work with Daman, AXA, Sukoon, MetLife and NAS, but cosmetic treatments such as whitening are usually not covered by insurance.", 0.81),
    ],
  },
  {
    daysAgo: 0,
    hour: 12,
    status: "needs_human",
    turns: [
      customer("هل عندكم تقويم شفاف مثل إنفزلاين؟"),
      aiUnsure("عذراً، ليست لدي معلومات مؤكدة عن التقويم الشفاف. سأحوّل سؤالك إلى فريق العيادة ليجيبك. هل تودّ ترك اسمك ورقم هاتفك ليتواصلوا معك؟"),
    ],
  },
  {
    daysAgo: 1,
    hour: 17,
    status: "ai",
    lead: { name: "Fatima Al Marzouqi", phone: "+971 50 555 0142", status: "new" },
    turns: [
      customer("Hi, I want to book a teeth cleaning this week"),
      ai("Happy to help! Scaling and polishing is AED 250 and takes about 40 minutes. May I have your name and phone number so our reception can call you to confirm a time?"),
      customer("Fatima Al Marzouqi, +971 50 555 0142"),
      ai("Thank you, Fatima. Our reception will call you on +971 50 555 0142 to confirm your appointment. We are open Saturday to Thursday, 9 am to 9 pm."),
    ],
  },
  {
    daysAgo: 2,
    hour: 9,
    status: "closed",
    unread: false,
    turns: [
      customer("هل تفتحون يوم الجمعة؟"),
      ai("العيادة مغلقة يوم الجمعة. نعمل من السبت إلى الخميس من الساعة 9 صباحاً حتى 9 مساءً."),
      customer("شكراً"),
      ai("العفو! نحن في خدمتك في أي وقت."),
      { from: "system", event: "closed" },
    ],
  },
  {
    daysAgo: 3,
    hour: 15,
    status: "human",
    unread: false,
    lead: { name: "خالد المنصوري", phone: "+971 55 555 0173", status: "contacted" },
    turns: [
      customer("ولدي عمره 6 سنوات وعنده ألم قوي في ضرسه، أبغى أكلم أحد من العيادة"),
      ai("سلامته! نستقبل الحالات الطارئة في نفس اليوم خلال ساعات العمل، والدكتورة ليلى حسن متخصصة في أسنان الأطفال. سأحوّلك الآن إلى أحد أعضاء الفريق. ممكن اسمك ورقم هاتفك؟", 0.78),
      { from: "system", event: "human_requested" },
      customer("خالد المنصوري 0555550173"),
      { from: "system", event: "agent_joined", detail: DEMO_OWNER_NAME },
      { from: "agent", text: "مرحباً أستاذ خالد، معك سارة من الاستقبال. عندنا موعد مع الدكتورة ليلى اليوم الساعة 5:30 مساءً، هل يناسبك؟" },
      customer("نعم مناسب، شكراً"),
      { from: "agent", text: "تم تأكيد الموعد. نراكم الساعة 5:30 في برج الوصل، مكتب 1204. سلامة الصغير!" },
    ],
  },
  {
    daysAgo: 4,
    hour: 11,
    status: "ai",
    unread: false,
    turns: [
      customer("Where are you located? Is there parking?"),
      ai("We are in Al Wasl Tower, Office 1204, Sheikh Zayed Road, Dubai, five minutes on foot from Financial Centre metro station. Parking in the building is free for patients; just ask reception to validate your ticket."),
    ],
  },
  {
    daysAgo: 5,
    hour: 19,
    status: "needs_human",
    turns: [
      customer("Can I pay for a root canal in instalments with Tabby?"),
      aiUnsure("I'm sorry, I don't have information about paying with Tabby. I'll pass your question to the clinic team. Root canal treatment starts from AED 1,500. Could you leave your name and phone number so they can get back to you?"),
    ],
  },
  {
    daysAgo: 6,
    hour: 13,
    status: "ai",
    unread: false,
    turns: [
      customer("How much does a cleaning cost?"),
      ai("Scaling and polishing costs AED 250 and takes about 40 minutes. We recommend a cleaning every six months."),
    ],
  },
  {
    daysAgo: 8,
    hour: 16,
    status: "ai",
    unread: false,
    turns: [
      customer("What's the price of teeth whitening?"),
      ai("Laser whitening in the clinic is AED 900 for a one-hour session. We also offer a take-home kit for AED 600."),
    ],
  },
  {
    daysAgo: 9,
    hour: 10,
    status: "closed",
    unread: false,
    lead: { name: "James Carter", phone: "+971 52 555 0118", email: "james.carter@example.com", status: "converted" },
    turns: [
      customer("Do you take Daman insurance for a check-up?"),
      ai("Yes, we work directly with Daman. Please bring your insurance card and Emirates ID. Would you like to book a check-up?"),
      customer("Yes please. James Carter, +971 52 555 0118, james.carter@example.com"),
      ai("Thank you, James. Our reception will call you on +971 52 555 0118 to confirm your check-up."),
      { from: "system", event: "closed" },
    ],
  },
  {
    daysAgo: 11,
    hour: 14,
    status: "ai",
    unread: false,
    turns: [
      customer("كم سعر تنظيف الأسنان عندكم؟"),
      ai("تنظيف وتلميع الأسنان بـ 250 درهماً ويستغرق حوالي 40 دقيقة."),
    ],
  },
];

const ROLE = { customer: "customer", assistant: "assistant", agent: "agent", system: "system" } as const;

export type SeedResult = {
  workspaceId: string;
  email: string;
  sources: { ready: number; failed: number };
  conversations: number;
  leads: number;
};

/**
 * Create (or replace) the demo workspace.
 * With `embed: false` no OpenAI call is made: the knowledge sources are stored but marked
 * as failed, and can be processed later with "Re-sync" on the Knowledge base page.
 */
export async function seedDemo({ password, embed = true }: { password: string; embed?: boolean }): Promise<SeedResult> {
  // Start clean. Deleting the workspace removes everything it owns (database cascade).
  await prisma.workspace.deleteMany({ where: { publicKey: DEMO_PUBLIC_KEY } });
  await prisma.user.deleteMany({ where: { email: DEMO_EMAIL } });

  const user = await prisma.user.create({
    data: { email: DEMO_EMAIL, name: DEMO_OWNER_NAME, passwordHash: await bcrypt.hash(password, 12) },
  });
  const workspace = await createWorkspaceForUser(user, {
    name: "Bright Smile Dental Clinic",
    industry: "clinic",
    websiteUrl: "https://www.brightsmile.example",
    defaultLanguage: "both",
    phone: "+971 4 555 0100",
    whatsapp: "+971 50 555 0100",
    workingHours: WORKING_HOURS,
  });
  const workspaceId = workspace.id;
  const db = tenantDb(workspaceId);

  // Starter plan, so the Team page has free seats to invite into.
  await db.workspace.update({ where: { id: workspaceId }, data: { publicKey: DEMO_PUBLIC_KEY, planId: "starter" } });
  await db.assistantSettings.update({
    where: { workspaceId },
    data: {
      assistantName: "Noor",
      greeting: "Hi! I'm Noor from Bright Smile Dental Clinic. How can I help you today?\nمرحباً! أنا نور من عيادة برايت سمايل. كيف أقدر أساعدك؟",
    },
  });
  // "localhost" lets examples/test-page.html show the widget.
  await db.widgetSettings.update({
    where: { workspaceId },
    data: { brandColor: "#0f766e", allowedDomains: ["brightsmile.example", "localhost"] },
  });

  // ---------------------------------------------------------------- knowledge base
  const sources = await Promise.all([
    ...FAQS.map(([question, answer]) => db.knowledgeSource.create({ data: { workspaceId, type: "faq", title: question, content: answer, pageCount: 1 } })),
    db.knowledgeSource.create({ data: { workspaceId, type: "notes", title: "Business notes", content: NOTES, pageCount: 1 } }),
  ]);

  if (embed) {
    // Same code path as the background worker: chunk, embed, store. A few at a time.
    for (let i = 0; i < sources.length; i += 5) {
      await Promise.all(sources.slice(i, i + 5).map((source) => processSource(workspaceId, source.id)));
    }
  } else {
    await db.knowledgeSource.updateMany({ data: { status: "failed", error: "openaiKey" } });
  }

  // ---------------------------------------------------------------- conversations and leads
  const questions: { id: string; text: string }[] = [];
  let aiRepliesThisMonth = 0;

  const createConversation = async (demo: DemoConversation, index: number) => {
    // `hour` is UAE time (UTC+4); never place a chat in the future.
    const day = new Date(Date.now() - demo.daysAgo * 86_400_000);
    const startedAt = new Date(Math.min(Date.UTC(day.getUTCFullYear(), day.getUTCMonth(), day.getUTCDate(), demo.hour - 4), Date.now() - 20 * 60_000));
    const at = (turn: number) => new Date(startedAt.getTime() + turn * 45_000);

    const conversation = await db.conversation.create({
      data: {
        workspaceId,
        channel: "web",
        visitorId: `demo-visitor-${index + 1}`,
        visitorName: demo.lead?.name,
        visitorPhone: demo.lead?.phone,
        status: demo.status,
        assignedAgentId: demo.status === "human" ? user.id : null,
        unread: demo.unread ?? true,
        createdAt: startedAt,
        lastMessageAt: at(demo.turns.length - 1),
      },
    });

    // Each message carries its own timestamp, so they can be written in any order.
    const writeTurn = async (turn: Turn, i: number) => {
      // A question counts as unanswered when the reply that follows it was.
      const next = demo.turns[i + 1];
      const message = await db.message.create({
        data: {
          workspaceId,
          conversationId: conversation.id,
          role: ROLE[turn.from],
          content: turn.from === "system" ? encodeSystemEvent(turn.event, turn.detail) : turn.text,
          authorId: turn.from === "agent" ? user.id : null,
          confidence: turn.from === "assistant" ? turn.confidence : null,
          answered: turn.from === "assistant" ? turn.answered : turn.from === "customer" && next?.from === "assistant" ? next.answered : null,
          createdAt: at(i),
        },
      });
      // As in the live service, only messages the AI replied to are kept as questions.
      if (turn.from === "customer" && next?.from === "assistant") questions.push({ id: message.id, text: turn.text });
      if (turn.from === "assistant" && at(i).toISOString().startsWith(currentMonth())) aiRepliesThisMonth++;
    };
    await Promise.all(demo.turns.map(writeTurn));

    if (demo.lead) {
      await db.lead.create({ data: { workspaceId, conversationId: conversation.id, ...demo.lead, createdAt: at(3) } });
    }
  };
  await Promise.all(CONVERSATIONS.map(createConversation));

  if (aiRepliesThisMonth > 0) {
    await db.usageCounter.create({ data: { workspaceId, month: currentMonth(), aiMessages: aiRepliesThisMonth } });
  }

  // Question embeddings feed the "most asked" and "unanswered" lists on the overview.
  if (embed) {
    const embeddings = await embedTexts(questions.map((q) => q.text));
    await Promise.all(questions.map((question, i) => saveQuestionEmbedding(workspaceId, question.id, embeddings[i])));
  }

  const [ready, failed] = await Promise.all([
    db.knowledgeSource.count({ where: { status: "ready" } }),
    db.knowledgeSource.count({ where: { status: "failed" } }),
  ]);
  return {
    workspaceId,
    email: DEMO_EMAIL,
    sources: { ready, failed },
    conversations: CONVERSATIONS.length,
    leads: CONVERSATIONS.filter((c) => c.lead).length,
  };
}

/**
 * The assistant on the public site (www.assist.siteselo.com) is a normal workspace: the one owned
 * by SITE_ASSISTANT_EMAIL (default hello@siteselo.com), whose widget key goes in SITE_WIDGET_KEY.
 * This script fills that workspace with Selo Assist's own information:
 *
 *   - business profile, assistant name, greeting and instructions, widget colour and allowed site
 *   - the public website as a knowledge source (crawled), plus FAQs and business notes
 *   - the four plans as products
 *
 * Run with `npx tsx prisma/site-assistant.ts` against the database in .env. It is safe to run
 * again after prices or policies change: it replaces only the FAQs, notes and products it created
 * (matched by title and name) and re-reads the website; anything added by hand is left alone.
 * Needs OPENAI_API_KEY (answers are searched by embedding).
 */
import "dotenv/config";
import fs from "node:fs";
import path from "node:path";
import { SITE_PLANS } from "@/content/site";
import { prisma } from "@/server/db/prisma";
import { tenantDb } from "@/server/db/tenant";
import { processSource } from "@/server/ingest/process";
import { createProduct, deleteProduct, productSchema, updateProduct } from "@/server/products";
import { storageConfigured } from "@/server/storage";

const OWNER_EMAIL = process.env.SITE_ASSISTANT_EMAIL || "hello@siteselo.com";
const SITE = "https://www.assist.siteselo.com";
const CONTACT = "hello@siteselo.com";
/** Optional plan pictures (1:1 PNG), e.g. selo-assist-starter.png; skipped when not found. */
const IMAGE_DIR = process.env.SITE_ASSISTANT_IMAGES || "";

const plan = (id: string) => SITE_PLANS.find((p) => p.id === id)!;
const fmt = (n: number) => n.toLocaleString("en");
const limits = (id: string) => `${fmt(plan(id).messages)} AI messages a month, ${fmt(plan(id).pages)} knowledge pages and ${plan(id).seats === 1 ? "1 team member" : `${plan(id).seats} team members`}`;
const INCLUDED =
  "Every plan includes answers in the customer's language, a customisable chat widget, lead capture with CSV export, human takeover and the live inbox, email notifications, and reports on the most asked and unanswered questions.";

const FAQS: [string, string][] = [
  [
    "How much does Selo Assist cost?",
    `There is a free plan and three paid monthly plans. Free: €0, ${limits("free")}. Starter: €${plan("starter").price} a month, ${limits("starter")}. Growth: €${plan("growth").price} a month, ${limits("growth")}; it is the most popular plan. Pro: €${plan("pro").price} a month, ${limits("pro")}. ${INCLUDED} Prices exclude VAT or sales tax, which is added at checkout where it applies, depending on the customer's country. Full details: ${SITE}/pricing`,
  ],
  [
    "Is there a free plan? Do I need a card to start?",
    `Yes. The free plan costs nothing, needs no card and can be used for as long as you like. It includes ${limits("free")}. Sign up at ${SITE}/signup and upgrade later only if you need more.`,
  ],
  [
    "How do I upgrade or change my plan?",
    "In the dashboard, open Settings and choose a plan under Plan. The first time, you are taken to a secure checkout page to pay. If you already pay for a plan, switching to another paid plan takes effect straight away, and the price difference for the rest of the month is worked out automatically: charged when you move up, credited when you move down.",
  ],
  [
    "How is payment taken? Which payment methods are accepted?",
    "Paid plans are monthly subscriptions that renew automatically until cancelled. Payments are processed by our payment partner, Dodo Payments, which acts as the merchant of record, so its name may appear on your card statement and it issues the invoices. Cards are accepted, and the checkout page shows any other payment methods available in your country.",
  ],
  [
    "How do I cancel my subscription?",
    "Open Settings in your dashboard and click Manage billing (or Cancel subscription). You will not be charged again, and your plan stays active until the end of the month you have already paid for. After that the workspace moves to the free plan, and your assistant, knowledge base, conversations and leads are all kept. There is no contract.",
  ],
  [
    "Can I get a refund?",
    `If Selo Assist is not right for you, ask within 7 days of your first payment on a paid plan and it is refunded in full. Monthly renewals and unused days after cancelling are not refunded, except where the law requires it. Double charges, charges after cancelling, or charges when a fault on our side stopped the service are refunded in full. To ask, email ${CONTACT} from your account's address with the payment date; we reply within 3 business days and refunds usually arrive in 5 to 10 business days. Full policy: ${SITE}/refund`,
  ],
  [
    "Can I see or download my invoices, or change my card?",
    "Yes. In the dashboard, open Settings and click Manage billing. The billing portal shows your invoices and lets you update your card or cancel.",
  ],
  [
    "What counts as an AI message, and what happens at the limit?",
    "Each reply the assistant sends to a customer counts as one AI message. Messages your team sends and the test chat in your dashboard are not counted. When the monthly limit is reached, the widget stays on your site: instead of an AI answer, customers see your contact details and can leave their name and number, and the chat is flagged for your team. The count resets at the start of each month, or you can move to a bigger plan.",
  ],
  [
    "What is a knowledge page?",
    "One page read from your website, or one file, FAQ or notes entry. A 20-page website uses 20 knowledge pages.",
  ],
  [
    "How do I add the chat widget to my website?",
    `Create a free account, enter your website address so the assistant can read it, check its answers in the test chat, then copy the embed code from the Widget page and paste it before the closing body tag of your site. WordPress, Shopify, Wix and Webflow have a custom code box for this, and there are step-by-step guides at ${SITE}/integrations. No developer is needed. In the Widget page you also list the websites the widget may appear on.`,
  ],
  [
    "Do you offer annual plans, discounts or custom plans?",
    `Plans are monthly today, and the prices on the pricing page are the same for everyone. For larger volumes or a custom arrangement, email ${CONTACT}.`,
  ],
  [
    "How can I contact Selo Assist?",
    `Email ${CONTACT} for sales questions, help with setup, billing or partnerships, or use the contact page at ${SITE}/contact. You can also press "Talk to a human" in this chat to reach our team.`,
  ],
];

const NOTES = `Selo Assist is an AI customer support assistant for business websites, made by SiteSelo. A business adds its website pages, files, FAQs, notes and products; Selo Assist then answers its website visitors 24/7 through a chat widget, in the visitor's own language, using only that information. It captures leads (name and phone number), hands conversations to the business's team when a person is needed, and shows everything in a live inbox.

Who it is for: small and growing businesses of any kind, for example clinics, salons, real estate agencies, restaurants, car rental companies and shops.

Important pages:
- Sign up (free, no card): ${SITE}/signup
- Log in: ${SITE}/login
- Pricing: ${SITE}/pricing
- Features: ${SITE}/features
- FAQ: ${SITE}/faq
- Setup guides for website builders: ${SITE}/integrations
- Contact: ${SITE}/contact
- Refund policy: ${SITE}/refund
- Terms of service: ${SITE}/terms
- Privacy policy: ${SITE}/privacy
- Arabic version of the site: ${SITE}/ar

Contact email: ${CONTACT}

Available today: the website chat widget, the live inbox with human takeover, lead capture and CSV export, email notifications, WhatsApp alerts to the team when a customer needs a person, product cards in the chat, analytics of the most asked and unanswered questions, team members, and English and Arabic dashboards. Planned, not available yet: WhatsApp and Instagram as customer chat channels.`;

const INSTRUCTIONS = `You are the assistant for Selo Assist itself, on its own website. Visitors are business owners deciding whether to use it, or existing customers with questions.
- Explain what Selo Assist does and how it would help the visitor's kind of business. Suggest starting on the free plan, with the link ${SITE}/signup.
- When asked about price, give the plan prices and limits, and mention that VAT or sales tax is added at checkout where it applies.
- Never invent features, integrations, discounts, dates or promises that are not in your information. If something is not available yet, say so plainly.
- For problems with a specific account, payment, refund or invoice, you cannot see their account: ask them to email ${CONTACT} or press "Talk to a human".`;

async function main() {
  const owner = await prisma.membership.findFirst({
    where: { role: "owner", user: { email: OWNER_EMAIL } },
    orderBy: { createdAt: "asc" },
    select: { workspaceId: true },
  });
  if (!owner) throw new Error(`No workspace owned by ${OWNER_EMAIL}. Sign up with that address and finish onboarding first.`);
  const workspaceId = owner.workspaceId;
  const db = tenantDb(workspaceId);
  const scope = { workspaceId, db };

  // ------------------------------------------------------------------ profile and settings
  // Pro, so the whole site and the FAQs fit in the knowledge base and visitors never hit a limit.
  const workspace = await prisma.workspace.update({
    where: { id: workspaceId },
    data: { name: "Selo Assist", industry: "other", websiteUrl: SITE, defaultLanguage: "both", planId: "pro" },
    select: { publicKey: true },
  });
  await db.assistantSettings.update({
    where: { workspaceId },
    data: {
      assistantName: "Selo",
      tone: "friendly",
      greeting: "Hi, I'm Selo! Ask me anything about Selo Assist: features, pricing or how to set it up.\nمرحباً، أنا سيلو! اسألني عن Selo Assist: المزايا أو الأسعار أو طريقة الإعداد.",
      extraInstructions: INSTRUCTIONS,
    },
  });
  // localhost:3000 lets the widget show when the site runs locally with the same key.
  await db.widgetSettings.update({ where: { workspaceId }, data: { brandColor: "#dc2626", allowedDomains: ["assist.siteselo.com", "localhost:3000"] } });

  // ------------------------------------------------------------------ knowledge base
  const titles = [...FAQS.map(([q]) => q), "Business notes"];
  await db.knowledgeSource.deleteMany({ where: { type: { in: ["faq", "notes"] }, title: { in: titles } } });
  const created = await Promise.all([
    ...FAQS.map(([q, a]) => db.knowledgeSource.create({ data: { workspaceId, type: "faq", title: q, content: a, pageCount: 1 } })),
    db.knowledgeSource.create({ data: { workspaceId, type: "notes", title: "Business notes", content: NOTES, pageCount: 1 } }),
  ]);
  const site =
    (await db.knowledgeSource.findFirst({ where: { type: "url", url: SITE } })) ??
    (await db.knowledgeSource.create({ data: { workspaceId, type: "url", title: SITE, url: SITE } }));

  console.log(`Reading ${created.length} FAQs and notes...`);
  for (let i = 0; i < created.length; i += 5) await Promise.all(created.slice(i, i + 5).map((s) => processSource(workspaceId, s.id)));
  console.log(`Reading the website ${SITE} (up to 50 pages, takes a minute)...`);
  await processSource(workspaceId, site.id);

  // ------------------------------------------------------------------ products: the plans
  const products = SITE_PLANS.map((p) => ({
    id: p.id,
    name: `Selo Assist ${p.id === "free" ? "Free" : p.id[0].toUpperCase() + p.id.slice(1)}`,
    price: String(p.price),
    description: `${p.price === 0 ? "Free forever, no card needed." : `€${p.price} a month, billed monthly, cancel anytime. Prices exclude VAT where it applies.`} ${limits(p.id)[0].toUpperCase()}${limits(p.id).slice(1)}.${p.popular ? " Our most popular plan." : ""} ${INCLUDED}`,
  }));
  const existing = await db.product.findMany({ where: { name: { in: products.map((p) => p.name) } }, select: { id: true } });
  for (const product of existing) await deleteProduct(scope, product.id);

  for (const p of products) {
    const input = productSchema.parse({ name: p.name, description: p.description, category: "Plans", price: p.price, url: p.price === "0" ? `${SITE}/signup` : `${SITE}/pricing`, available: true });
    const imageFile = IMAGE_DIR && path.join(IMAGE_DIR, p.id === "free" ? "selo-assist-logo-512.png" : `selo-assist-${p.id}.png`);
    const image = imageFile && storageConfigured() && fs.existsSync(imageFile) ? new Uint8Array(fs.readFileSync(imageFile)) : undefined;
    const row = await createProduct(scope, input, image);
    // Products default to AED; the plans are in euros. Saving again re-indexes it with the right price.
    await db.product.update({ where: { id: row.id }, data: { currency: "EUR" } });
    await updateProduct(scope, row.id, input);
  }

  const sources = await db.knowledgeSource.findMany({ select: { type: true, status: true, pageCount: true, error: true } });
  const failed = sources.filter((s) => s.status === "failed");
  console.log(`
Done: workspace "Selo Assist" (${OWNER_EMAIL})
  Knowledge  ${sources.filter((s) => s.status === "ready").length} sources ready, ${failed.length} failed${failed.length ? ` (${failed.map((s) => `${s.type}: ${s.error}`).join(", ")})` : ""}; website pages read: ${sources.find((s) => s.type === "url")?.pageCount ?? 0}
  Products   ${products.length} plans
  Widget key ${workspace.publicKey}  <- set SITE_WIDGET_KEY to this to show it on the public site
`);
}

main()
  .catch((err) => {
    console.error(err);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());

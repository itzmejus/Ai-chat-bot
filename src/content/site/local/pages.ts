import { getSiteContent, SITE_PLANS, type ChatLine, type Faq, type Meta } from "@/content/site";
import { APP_NAME } from "@/lib/config";
import { CITY_SLUGS, INDUSTRY_SLUGS, INTEGRATION_SLUGS, type CitySlug, type IndustrySlug, type IntegrationSlug } from "@/lib/site-routes";
import { CITIES, REGIONS, type City, type Region } from "./cities";
import { INDUSTRY_PROFILES } from "./industries";

/**
 * The English-only local pages, written from data: a page per city, per industry in each city,
 * and per website builder for each industry. Each page combines what is specific to the
 * industry (its customers' questions, what it collects), the city (languages, time zone,
 * weekend, data protection law) or the website builder (its setup steps), and links to the
 * pages around it, so every page is reachable in a few clicks from the home page.
 *
 * Pure functions of the slugs: the same address always gives the same text. Sentence
 * patterns vary between pages (chosen from the address) so neighbouring pages don't read alike.
 */

export type LocalLink = { page: string; label: string; hint?: string };
export type LocalPage = {
  page: string;
  meta: Meta;
  /** Trail after "Home". */
  trail: { name: string; page: string }[];
  eyebrow: string;
  h1: string;
  sub: string;
  chat?: ChatLine[];
  intro: string[];
  questions?: { title: string; items: string[] };
  points?: { title: string; items: { title: string; text: string }[] };
  sections: { h: string; p: string[] }[];
  steps?: { title: string; items: { title: string; text: string }[]; codeAt?: number };
  cards?: { title: string; links: LocalLink[] };
  faq: Faq[];
  links: { title: string; links: LocalLink[] }[];
};

const t = () => getSiteContent("en");

// ---------------------------------------------------------------- text helpers

/** Stable number from a string, to choose sentence variants per page. */
function hash(text: string): number {
  let h = 2166136261;
  for (let i = 0; i < text.length; i++) h = Math.imul(h ^ text.charCodeAt(i), 16777619);
  return h >>> 0;
}
const pick = <T,>(options: readonly T[], seed: number, salt = 0): T => options[(seed + salt * 7919) % options.length];

/** "a, b and c" */
export function list(items: readonly string[]): string {
  if (items.length <= 1) return items.join("");
  return `${items.slice(0, -1).join(", ")} and ${items[items.length - 1]}`;
}
const cap = (text: string) => text.charAt(0).toUpperCase() + text.slice(1);
const fill = (text: string, city: City) =>
  text.replaceAll("{city}", city.name).replaceAll("{language}", city.languages.find((l) => l !== "English") ?? "English");

/** A description listing as many of `items` (languages, topics) as fit in the length search results show. */
function fitDescription(write: (items: string[]) => string, items: string[]): string {
  for (let n = items.length; n > 1; n--) {
    const text = write(items.slice(0, n));
    if (text.length <= 165) return text;
  }
  return write(items.slice(0, 1));
}

const RTL = ["Arabic", "Urdu"];
const startingPrice = () => SITE_PLANS.find((plan) => plan.price > 0)!.price;
const freeMessages = () => SITE_PLANS.find((plan) => plan.price === 0)!.messages;

const platformNames = () => INTEGRATION_SLUGS.slice(0, 6).map((slug) => t().topics.integrations[slug].name);

/** Other cities to link to: the same region first, then the rest, starting after `city`. */
function nearbyCities(city: CitySlug, count: number): CitySlug[] {
  const region = CITIES[city].region;
  const at = CITY_SLUGS.indexOf(city);
  const rotated = [...CITY_SLUGS.slice(at + 1), ...CITY_SLUGS.slice(0, at)];
  const same = rotated.filter((slug) => CITIES[slug].region === region);
  const other = rotated.filter((slug) => CITIES[slug].region !== region);
  return [...same, ...other].slice(0, count);
}

/** The cities shown first on industry and website-builder pages. */
const FEATURED_CITIES: CitySlug[] = ["dubai", "abu-dhabi", "riyadh", "doha", "london", "new-york", "toronto", "sydney", "singapore", "mumbai", "cairo", "johannesburg"];

// ---------------------------------------------------------------- shared sections

function languageSection(city: City, subject: string): { h: string; p: string[] } {
  const rtl = city.languages.filter((l) => RTL.includes(l));
  return {
    h: `Replies in the languages ${city.name} speaks`,
    p: [
      `${cap(subject)} in ${city.name} often write in ${list(city.languages)}. The assistant replies in the language each person writes in, even when your own information is only in English, so nobody has to switch language to get an answer.`,
      rtl.length
        ? `For ${list(rtl)}, the chat window switches to a right-to-left layout automatically. Customers who mix languages in one message, as many do, still get a clear reply.`
        : `Customers who mix languages in one message, as many do, still get a clear reply in the language they used most.`,
    ],
  };
}

function hoursSection(city: City, when: string): { h: string; p: string[] } {
  const weekend = city.weekend ? ` Many businesses close on ${city.weekend}, which is exactly when people have time to look things up.` : "";
  return {
    h: `Answers after hours in ${city.name}`,
    p: [
      `Your team works on ${city.timeZone}, but questions arrive ${when}.${weekend} The assistant answers at once, at any hour, and the conversation and contact details are waiting in your inbox when you are back.`,
    ],
  };
}

function privacySection(city: City): { h: string; p: string[] } {
  const law = city.privacyLaw
    ? `Businesses serving customers in ${city.name} need to handle personal details in line with ${city.privacyLaw}. The assistant only asks for the contact details needed to get back to the customer, and only shows on the websites you approve.`
    : `The assistant only asks for the contact details needed to get back to the customer, and only shows on the websites you approve.`;
  return {
    h: "Your data stays yours",
    p: [`Every business has its own separate workspace, and one business's information is never used to answer another's customers. ${law}`],
  };
}

const pricingFaq = (): Faq => ({
  q: `How much does ${APP_NAME} cost?`,
  a: `There is a free plan with ${freeMessages()} AI replies a month to try it, and paid plans from €${startingPrice()} a month with more messages, more pages of knowledge and more team members. Every plan includes multilingual answers, lead capture and human takeover.`,
});

const setupSteps = (content: string, where: string) => [
  { title: "Add your business information", text: `Enter your website address so the assistant can read it, then add ${content} as files, FAQs or notes.` },
  { title: "Paste one line of code", text: `Choose your colour, logo and greeting, then copy the script tag into ${where}. It works with WordPress, Shopify, Wix, Webflow and any other site.` },
  { title: "Go live and step in any time", text: "Customers get instant answers. You see every conversation, get an email for each new lead, and can take over a chat with one click." },
];

// ---------------------------------------------------------------- industry x city

export function industryCityPage(industry: IndustrySlug, citySlug: CitySlug): LocalPage {
  const content = t();
  const info = content.industries[industry];
  const p = INDUSTRY_PROFILES[industry];
  const city = CITIES[citySlug];
  const page = `/industries/${industry}/${citySlug}`;
  const seed = hash(page);
  const langs = city.languages.slice(0, 3);
  const second = city.languages.find((l) => l !== "English") ?? "Spanish";

  const h1 = pick(
    [
      `An AI chatbot for ${p.label} in ${city.name}`,
      `AI customer support for ${p.label} in ${city.name}`,
      `The AI assistant for ${p.label} in ${city.name}`,
    ],
    seed,
  );
  const opener = pick(
    [
      `For ${p.label}, that means questions about ${list(p.topics.slice(0, 4))}, and most of them arrive ${p.peak}.`,
      `${cap(p.customers)} of ${p.label} there ask about ${list(p.topics.slice(0, 4))}, usually ${p.peak}.`,
      `In ${p.label}, the same questions come up every day: ${list(p.topics.slice(0, 4))}. Most of them arrive ${p.peak}.`,
    ],
    seed,
    1,
  );
  const how = pick(
    [
      `${APP_NAME} reads ${p.content}, and answers ${p.customers} from that information only. When someone is ready to book or needs a person, it takes ${p.lead} and alerts your team.`,
      `Give ${APP_NAME} ${p.content}, and it answers your ${p.customers} in seconds, using nothing else. When a question needs a person, it collects ${p.lead} and tells your team straight away.`,
    ],
    seed,
    2,
  );

  return {
    page,
    meta: {
      title: `AI chatbot for ${p.label} in ${city.name}`,
      description: fitDescription((l) => `An AI assistant for ${p.label} in ${city.name}: it answers ${p.customers} 24/7 in ${list(l)}, from your own information, and captures every enquiry.`, langs),
    },
    trail: [
      { name: content.nav.industries, page: "/industries" },
      { name: info.name, page: `/industries/${industry}` },
      { name: city.name, page },
    ],
    eyebrow: `${info.name} · ${city.name}`,
    h1,
    sub: `Answer ${p.customers} in ${city.name} about ${list(p.topics.slice(0, 3))} in seconds, in ${list(langs)}, and turn every enquiry into a lead for your team.`,
    chat: info.chat,
    intro: [`${city.context} ${opener}`, how],
    questions: {
      title: `What ${p.customers} in ${city.name} ask`,
      items: [...p.localQuestions.map((q) => fill(q, city)), ...info.questions],
    },
    points: { title: `Why ${p.label} in ${city.name} use it`, items: info.benefits },
    sections: [
      languageSection(city, p.customers),
      hoursSection(city, p.peak),
      {
        h: "Every enquiry becomes a lead",
        p: [
          `When someone wants to go ahead, the assistant asks for ${p.lead}. The lead is saved with the whole conversation attached, your team gets an email, and you can export your leads to CSV at any time.`,
          `If someone asks for a person, or the question is outside what you gave it, the chat is flagged in your inbox and anyone on your team can take over with one click. The AI stays silent while you reply.`,
        ],
      },
      privacySection(city),
    ],
    steps: { title: `Set it up for your ${city.name} business`, items: setupSteps(p.content, "your website"), codeAt: 1 },
    faq: [
      {
        q: `Does the chatbot reply in ${second}?`,
        a: `Yes. It replies in the language each customer writes in, including ${list(city.languages)}, even if your own information is written in one language only.`,
      },
      {
        q: `What can it answer for ${p.label} in ${city.name}?`,
        a: `Questions about ${list(p.topics)}, as long as the answer is in the information you give it. When it is not, the assistant says so and offers to connect the customer with your team instead of guessing.`,
      },
      {
        q: `Can it quote prices in ${city.currency}?`,
        a: `Yes. It quotes prices exactly as you write them in your price list or notes, for example "${city.currency} 250", and it never makes up a price that is not there.`,
      },
      pricingFaq(),
      {
        q: "Does it work with my website?",
        a: `Yes. It is one line of code, and works with ${list(platformNames())} and any other website. Setup takes a few minutes and needs no developer.`,
      },
    ],
    links: [
      {
        title: `${info.name} in other cities`,
        links: nearbyCities(citySlug, 12).map((other) => ({ page: `/industries/${industry}/${other}`, label: `${info.name} in ${CITIES[other].name}` })),
      },
      {
        title: `Other businesses in ${city.name}`,
        links: INDUSTRY_SLUGS.filter((other) => other !== industry).map((other) => ({
          page: `/industries/${other}/${citySlug}`,
          label: `${content.industries[other].name} in ${city.name}`,
        })),
      },
      {
        title: `Add it to your ${p.site.replace(/ websites$/, "")} website`,
        links: INTEGRATION_SLUGS.slice(0, 8).map((platform) => ({
          page: `/integrations/${platform}/${industry}`,
          label: `${content.topics.integrations[platform].name} for ${p.label}`,
        })),
      },
      {
        title: "Learn more",
        links: [
          { page: `/industries/${industry}`, label: `AI chatbot for ${p.label}` },
          { page: `/locations/${citySlug}`, label: `All businesses in ${city.name}` },
          { page: "/use-cases/after-hours-support", label: content.topics.useCases["after-hours-support"].name },
          { page: "/use-cases/multilingual-support", label: content.topics.useCases["multilingual-support"].name },
          { page: "/use-cases/lead-generation", label: content.topics.useCases["lead-generation"].name },
          { page: "/pricing", label: content.nav.pricing },
        ],
      },
    ],
  };
}

// ---------------------------------------------------------------- city

export function cityPage(citySlug: CitySlug): LocalPage {
  const content = t();
  const city = CITIES[citySlug];
  const page = `/locations/${citySlug}`;
  const seed = hash(page);
  const langs = city.languages.slice(0, 3);
  const second = city.languages.find((l) => l !== "English") ?? "Spanish";

  return {
    page,
    meta: {
      title: `AI chatbot for businesses in ${city.name}`,
      description: `Give your ${city.name} business an AI assistant that answers customers 24/7 in ${list(langs)}, from your own information, and turns chats into leads.`,
    },
    trail: [
      { name: "Locations", page: "/locations" },
      { name: city.name, page },
    ],
    eyebrow: `${city.name} · ${city.country}`,
    h1: pick([`AI customer support for businesses in ${city.name}`, `An AI chatbot for ${city.name} businesses`, `Answer every ${city.name} customer in seconds`], seed),
    sub: `An AI assistant for your website that answers customers in ${list(langs)}, day and night, using only your business information, and calls in your team when a person is needed.`,
    chat: content.home.demo.chat.slice(0, 2),
    intro: [
      city.context,
      `${APP_NAME} gives ${city.name} businesses an assistant that replies in seconds. It reads your website, price lists and FAQs, answers from them and nothing else, and saves the name and number of everyone who wants to book, buy or be called back.`,
    ],
    sections: [
      languageSection(city, "customers"),
      hoursSection(city, "in the evening, at weekends and on public holidays"),
      privacySection(city),
    ],
    steps: { title: "Live in three steps", items: setupSteps("your prices, policies and FAQs", "your website"), codeAt: 1 },
    cards: {
      title: `Set up for your industry in ${city.name}`,
      links: INDUSTRY_SLUGS.map((industry) => ({
        page: `/industries/${industry}/${citySlug}`,
        label: `${content.industries[industry].name} in ${city.name}`,
        hint: content.industries[industry].short,
      })),
    },
    faq: [
      { q: `Does it reply in ${second}?`, a: `Yes. It replies in the language each customer writes in, including ${list(city.languages)}.` },
      {
        q: `Can a ${city.name} business use it without a developer?`,
        a: `Yes. You add your information in the dashboard and paste one line of code into your website, or into the custom code box of WordPress, Shopify, Wix or Webflow.`,
      },
      { q: "Will the AI make up answers?", a: "No. It answers only from the information you provide. When the answer is not there, it says so and offers to connect the customer with your team." },
      pricingFaq(),
    ],
    links: [
      {
        title: `Other cities in ${REGIONS[city.region]}`,
        links: nearbyCities(citySlug, 10).map((other) => ({ page: `/locations/${other}`, label: CITIES[other].name })),
      },
      {
        title: "Add it to your website",
        links: INTEGRATION_SLUGS.slice(0, 8).map((platform) => ({ page: `/integrations/${platform}`, label: content.topics.integrations[platform].name })),
      },
      {
        title: "Learn more",
        links: [
          { page: "/locations", label: "All locations" },
          { page: "/features", label: content.nav.features },
          city.languages.includes("Arabic")
            ? { page: "/use-cases/arabic-chatbot", label: content.topics.useCases["arabic-chatbot"].name }
            : { page: "/use-cases/multilingual-support", label: content.topics.useCases["multilingual-support"].name },
          { page: "/use-cases/after-hours-support", label: content.topics.useCases["after-hours-support"].name },
          { page: "/pricing", label: content.nav.pricing },
        ],
      },
    ],
  };
}

// ---------------------------------------------------------------- website builder x industry

export function platformIndustryPage(platform: IntegrationSlug, industry: IndustrySlug): LocalPage {
  const content = t();
  const info = content.industries[industry];
  const p = INDUSTRY_PROFILES[industry];
  const tool = content.topics.integrations[platform];
  const page = `/integrations/${platform}/${industry}`;
  const seed = hash(page);

  const steps = tool.steps?.map((step, i) =>
    i === 0 ? { title: step.title, text: `Sign up and enter your website address so the assistant can read your pages. Then add ${p.content}, as files, FAQs or notes.` } : step,
  );

  return {
    page,
    meta: {
      title: `AI chatbot for ${p.site} on ${tool.name}`,
      description: fitDescription(
        (topics) => `Add an AI chatbot to your ${tool.name} site in minutes. It answers ${p.customers} about ${list(topics)} 24/7, in their language, and captures leads.`,
        p.topics.slice(0, 3),
      ),
    },
    trail: [
      { name: content.topics.labels.integrations, page: "/integrations" },
      { name: tool.name, page: `/integrations/${platform}` },
      { name: info.name, page },
    ],
    eyebrow: `${tool.name} · ${info.name}`,
    h1: pick(
      [`An AI chatbot for ${p.site} on ${tool.name}`, `Add an AI assistant to ${p.site} built on ${tool.name}`, `${tool.name} chatbot for ${p.label}`],
      seed,
    ),
    sub: `${cap(p.customers)} ask about ${list(p.topics.slice(0, 3))} at all hours. Add one line of code to your ${tool.name} site and the assistant answers them in seconds, in their own language.`,
    chat: info.chat,
    intro: [
      `${cap(p.customers)} visiting ${p.site} want quick answers about ${list(p.topics.slice(0, 4))}, and most of them arrive ${p.peak}. ${APP_NAME} answers from ${p.content}, and from nothing else.`,
      `${tool.sub} When someone is ready to go ahead, the assistant takes ${p.lead}, saves it as a lead and alerts your team.`,
    ],
    questions: { title: `What your ${p.customers} will ask`, items: info.questions },
    points: { title: `Why ${p.label} add it to ${tool.name}`, items: info.benefits },
    sections: [
      {
        h: "Where it helps most",
        p: [
          `The widget appears on every page of your ${tool.name} site, but it earns its place on ${p.pages}: that is where ${p.customers} decide whether to get in touch. Set a greeting that invites the question they usually ask there.`,
        ],
      },
    ],
    steps: steps ? { title: `How to add it to ${tool.name}`, items: steps, codeAt: 2 } : undefined,
    faq: [
      ...tool.faq.slice(0, 2),
      {
        q: `What can the chatbot answer for ${p.label}?`,
        a: `Questions about ${list(p.topics)}, from the information you give it. When the answer is not there, it says so and offers to put the customer in touch with your team.`,
      },
      pricingFaq(),
    ],
    links: [
      {
        title: `${info.name} by city`,
        links: FEATURED_CITIES.map((city) => ({ page: `/industries/${industry}/${city}`, label: `${info.name} in ${CITIES[city].name}` })),
      },
      {
        title: `${tool.name} for other industries`,
        links: INDUSTRY_SLUGS.filter((other) => other !== industry).map((other) => ({
          page: `/integrations/${platform}/${other}`,
          label: `${tool.name} for ${INDUSTRY_PROFILES[other].label}`,
        })),
      },
      {
        title: `${info.name} on other website builders`,
        links: INTEGRATION_SLUGS.filter((other) => other !== platform).map((other) => ({
          page: `/integrations/${other}/${industry}`,
          label: `${content.topics.integrations[other].name} for ${p.label}`,
        })),
      },
      {
        title: "Learn more",
        links: [
          { page: `/integrations/${platform}`, label: `${tool.name} setup guide` },
          { page: `/industries/${industry}`, label: `AI chatbot for ${p.label}` },
          { page: "/blog/add-ai-chatbot-to-website", label: content.topics.guides["add-ai-chatbot-to-website"].name },
          { page: "/pricing", label: content.nav.pricing },
        ],
      },
    ],
  };
}

// ---------------------------------------------------------------- locations hub

export const LOCATIONS_META: Meta = {
  title: "AI chatbot for businesses worldwide, by city",
  description: `${APP_NAME} answers customers in their own language in cities across the Gulf, Europe, the Americas, Asia and Africa. Find your city and industry.`,
};

export function citiesByRegion(): { region: Region; name: string; cities: { slug: CitySlug; city: City }[] }[] {
  return (Object.keys(REGIONS) as Region[]).map((region) => ({
    region,
    name: REGIONS[region],
    cities: CITY_SLUGS.filter((slug) => CITIES[slug].region === region).map((slug) => ({ slug, city: CITIES[slug] })),
  }));
}

/** Links from an industry's main page to its city pages. */
export const industryCityLinks = (industry: IndustrySlug): LocalLink[] =>
  CITY_SLUGS.map((city) => ({ page: `/industries/${industry}/${city}`, label: CITIES[city].name }));

/** Links from a website builder's setup page to its industry pages. */
export const platformIndustryLinks = (platform: IntegrationSlug): LocalLink[] =>
  INDUSTRY_SLUGS.map((industry) => ({ page: `/integrations/${platform}/${industry}`, label: t().industries[industry].name }));

/** The local page at `page`, or null. */
export function localPage(page: string): LocalPage | null {
  const parts = page.split("/").filter(Boolean);
  const isCity = (s: string): s is CitySlug => (CITY_SLUGS as readonly string[]).includes(s);
  const isIndustry = (s: string): s is IndustrySlug => (INDUSTRY_SLUGS as readonly string[]).includes(s);
  const isPlatform = (s: string): s is IntegrationSlug => (INTEGRATION_SLUGS as readonly string[]).includes(s);
  if (parts.length === 2 && parts[0] === "locations" && isCity(parts[1])) return cityPage(parts[1]);
  if (parts.length === 3 && parts[0] === "industries" && isIndustry(parts[1]) && isCity(parts[2])) return industryCityPage(parts[1], parts[2]);
  if (parts.length === 3 && parts[0] === "integrations" && isPlatform(parts[1]) && isIndustry(parts[2])) return platformIndustryPage(parts[1], parts[2]);
  return null;
}

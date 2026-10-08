import type { IndustrySlug } from "@/lib/site-routes";

/**
 * Shape of the public site's text. English (en.ts) and Arabic (ar.ts) both implement it,
 * so a missing translation is a type error rather than a blank on the page.
 * "{name}" anywhere in the text is replaced by APP_NAME.
 */

export type ChatLine = { from: "customer" | "assistant" | "agent" | "note"; text: string };
export type Faq = { q: string; a: string };
export type Meta = { title: string; description: string };

export type FeatureKey = "grounded" | "bilingual" | "leads" | "handover" | "inbox" | "insights" | "widget" | "security";
export type PlanId = "free" | "starter" | "pro";

export type SiteContent = {
  nav: {
    features: string;
    pricing: string;
    industries: string;
    login: string;
    start: string;
    menu: string;
    /** Label of the link to the other language, written in that language. */
    otherLanguage: string;
    skip: string;
  };
  home: {
    meta: Meta;
    badge: string;
    /** The headline is split so the middle part can be highlighted. */
    h1: [before: string, highlight: string, after: string];
    sub: string;
    ctaPrimary: string;
    ctaSecondary: string;
    demo: { site: string; assistant: string; status: string; placeholder: string; chat: ChatLine[]; leadTitle: string; leadName: string; leadPhone: string; answered: string; /** Heading of the list of sources in the animated answer. */ knowledge: string };
    /** Label of the row of website platforms under the hero picture. */
    worksWith: string;
    madeFor: string;
    steps: { eyebrow: string; label: string; title: string; sub: string; items: { title: string; text: string }[] };
    features: { eyebrow: string; title: string; sub: string; items: Record<FeatureKey, { title: string; text: string }>; more: string };
    handover: {
      eyebrow: string;
      title: string;
      text: string;
      /** The three stages of a handover: the AI answers, the team is told, a person steps in. */
      flow: { title: string; text: string }[];
      points: string[];
      inboxTitle: string;
      filters: string[];
      takeover: string;
      chat: ChatLine[];
      names: string[];
    };
    stats: { value: string; label: string }[];
    industries: { eyebrow: string; title: string; sub: string; link: string };
    pricing: { eyebrow: string; title: string; sub: string; link: string };
    faq: { eyebrow: string; title: string; sub: string; items: Faq[] };
    cta: { title: string; sub: string; button: string; note: string };
  };
  featuresPage: {
    meta: Meta;
    eyebrow: string;
    h1: string;
    sub: string;
    groups: { key: FeatureKey; title: string; text: string; points: string[] }[];
    channels: { title: string; text: string; live: string; soon: string; items: { name: string; live: boolean }[] };
  };
  pricingPage: {
    meta: Meta;
    eyebrow: string;
    h1: string;
    sub: string;
    perMonth: string;
    free: string;
    popular: string;
    plans: Record<PlanId, { name: string; tagline: string; cta: string }>;
    limits: { messages: string; pages: string; seats: string };
    included: { title: string; items: string[] };
    compare: { title: string; feature: string; price: string; yes: string };
    faq: { title: string; items: Faq[] };
  };
  industriesPage: { meta: Meta; h1: string; sub: string; all: string };
  industryPage: { eyebrow: string; asks: string; benefits: string; other: string; cta: string };
  industries: Record<IndustrySlug, { name: string; short: string; meta: Meta; h1: string; sub: string; questions: string[]; benefits: { title: string; text: string }[]; chat: ChatLine[] }>;
  legal: {
    updated: string;
    privacy: { meta: Meta; title: string; intro: string; sections: { h: string; p: string[] }[] };
    terms: { meta: Meta; title: string; intro: string; sections: { h: string; p: string[] }[] };
  };
  footer: { tagline: string; product: string; industries: string; company: string; privacy: string; terms: string; contact: string; rights: string; madeIn: string };
  breadcrumbHome: string;
};

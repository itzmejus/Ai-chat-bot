/**
 * The public marketing site's URLs. Shared by the proxy (routing), the sitemap and the
 * pages themselves, so the three can never disagree. No imports: the proxy must stay light.
 *
 * English pages have no prefix ("/pricing"); Arabic pages live under "/ar" ("/ar/pricing").
 * Internally both are served by src/app/(site)/[lang]/..., which the proxy rewrites to.
 */

/** When the site's pages were last revised: shown on blog articles and given to search engines in the sitemap. */
export const SITE_UPDATED = "2026-10-08";

export const SITE_LANGS = ["en", "ar"] as const;
export type SiteLang = (typeof SITE_LANGS)[number];

export const INDUSTRY_SLUGS = ["clinics", "real-estate", "salons", "restaurants", "car-rental", "coach-hire", "retail"] as const;
export type IndustrySlug = (typeof INDUSTRY_SLUGS)[number];

/** Website builders with their own setup page. */
export const INTEGRATION_SLUGS = ["wordpress", "shopify", "wix", "webflow", "squarespace"] as const;
export type IntegrationSlug = (typeof INTEGRATION_SLUGS)[number];

export const USE_CASE_SLUGS = ["lead-generation", "customer-support", "multilingual-support", "after-hours-support"] as const;
export type UseCaseSlug = (typeof USE_CASE_SLUGS)[number];

/** Blog articles. Each one is its own page at /blog/<slug>. */
export const GUIDE_SLUGS = ["add-ai-chatbot-to-website", "train-chatbot-on-your-content", "ai-chatbot-vs-live-chat", "chatbot-lead-capture"] as const;
export type GuideSlug = (typeof GUIDE_SLUGS)[number];

/** The three groups of search-focused pages and the address each lives under. */
export const TOPIC_GROUPS = {
  integrations: { base: "/integrations", slugs: INTEGRATION_SLUGS },
  useCases: { base: "/use-cases", slugs: USE_CASE_SLUGS },
  guides: { base: "/blog", slugs: GUIDE_SLUGS },
} as const;
export type TopicGroup = keyof typeof TOPIC_GROUPS;

/** Every page of the site, as a path without language prefix. "" is the home page. */
export const SITE_PAGES = [
  "",
  "/features",
  "/pricing",
  "/industries",
  ...INDUSTRY_SLUGS.map((slug) => `/industries/${slug}`),
  ...Object.values(TOPIC_GROUPS).flatMap((group) => [group.base, ...group.slugs.map((slug) => `${group.base}/${slug}`)]),
  "/faq",
  "/privacy",
  "/terms",
] as const;

/** Public URL path of a page in a language: sitePath("ar", "/pricing") is "/ar/pricing". */
export function sitePath(lang: SiteLang, page: string): string {
  return lang === "en" ? page || "/" : `/ar${page}`;
}

/**
 * If `pathname` is a marketing page, return its language and page; otherwise null.
 * "/en/..." is deliberately not a public URL (it would duplicate the unprefixed page).
 */
export function matchSitePath(pathname: string): { lang: SiteLang; page: string } | null {
  const path = pathname.length > 1 ? pathname.replace(/\/$/, "") : pathname;
  const lang: SiteLang = path === "/ar" || path.startsWith("/ar/") ? "ar" : "en";
  const page = lang === "ar" ? path.slice(3) : path === "/" ? "" : path;
  return (SITE_PAGES as readonly string[]).includes(page) ? { lang, page } : null;
}

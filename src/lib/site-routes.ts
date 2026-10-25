/**
 * The public marketing site's URLs. Shared by the proxy (routing), the sitemap and the
 * pages themselves, so the three can never disagree. No imports: the proxy must stay light.
 *
 * English pages have no prefix ("/pricing"); Arabic pages live under "/ar" ("/ar/pricing").
 * Internally both are served by src/app/(site)/[lang]/..., which the proxy rewrites to.
 */

/** When the site's pages were last revised: shown on blog articles and given to search engines in the sitemap. */
export const SITE_UPDATED = "2026-10-20";

export const SITE_LANGS = ["en", "ar"] as const;
export type SiteLang = (typeof SITE_LANGS)[number];

export const INDUSTRY_SLUGS = [
  "clinics",
  "real-estate",
  "salons",
  "restaurants",
  "car-rental",
  "coach-hire",
  "retail",
  "gyms",
  "hotels",
  "travel-agencies",
  "training-centres",
  "schools",
  "law-firms",
  "accounting-firms",
  "car-service",
  "home-services",
  "event-venues",
] as const;
export type IndustrySlug = (typeof INDUSTRY_SLUGS)[number];

/** The industries with their own illustration, shown in the home page tabs and the footer. The rest are on /industries. */
export const FEATURED_INDUSTRY_SLUGS = ["clinics", "real-estate", "salons", "restaurants", "car-rental", "coach-hire", "retail"] as const satisfies readonly IndustrySlug[];
export type FeaturedIndustrySlug = (typeof FEATURED_INDUSTRY_SLUGS)[number];

/** Website builders with their own setup page. */
export const INTEGRATION_SLUGS = [
  "wordpress",
  "shopify",
  "wix",
  "webflow",
  "squarespace",
  "woocommerce",
  "joomla",
  "drupal",
  "framer",
  "bigcommerce",
  "ghost",
  "hubspot",
  "weebly",
  "google-tag-manager",
  "html",
] as const;
export type IntegrationSlug = (typeof INTEGRATION_SLUGS)[number];

export const USE_CASE_SLUGS = [
  "lead-generation",
  "customer-support",
  "multilingual-support",
  "after-hours-support",
  "appointment-requests",
  "faq-automation",
  "pre-sales-questions",
  "quote-requests",
  "arabic-chatbot",
  "fewer-phone-calls",
  "small-business-support",
  "ecommerce-support",
  "human-handover",
  "customer-insights",
] as const;
export type UseCaseSlug = (typeof USE_CASE_SLUGS)[number];

/** Blog articles. Each one is its own page at /blog/<slug>. */
export const GUIDE_SLUGS = [
  "add-ai-chatbot-to-website",
  "train-chatbot-on-your-content",
  "ai-chatbot-vs-live-chat",
  "chatbot-lead-capture",
  "ai-chatbot-cost",
  "write-faqs-for-chatbot",
  "chatbot-greeting-messages",
  "stop-chatbot-making-things-up",
  "when-to-hand-over-to-a-human",
  "chatbot-vs-contact-form",
  "after-hours-customer-service",
  "multilingual-customer-support",
  "serving-arabic-speaking-customers",
  "measure-chatbot-success",
  "chatbot-data-privacy",
  "reduce-customer-response-time",
  "website-chatbot-best-practices",
  "qualify-leads-with-chatbot",
  "is-a-chatbot-worth-it-for-small-business",
  "prepare-content-for-ai-chatbot",
  "customer-service-in-the-uae",
  "chatbot-mistakes-to-avoid",
  "chat-on-mobile",
  "what-is-ai-customer-support",
] as const;
export type GuideSlug = (typeof GUIDE_SLUGS)[number];

/** The three groups of search-focused pages and the address each lives under. */
export const TOPIC_GROUPS = {
  integrations: { base: "/integrations", slugs: INTEGRATION_SLUGS },
  useCases: { base: "/use-cases", slugs: USE_CASE_SLUGS },
  guides: { base: "/blog", slugs: GUIDE_SLUGS },
} as const;
export type TopicGroup = keyof typeof TOPIC_GROUPS;

/**
 * Cities with their own pages (English only): a page per city, one per industry in each city,
 * and one per website builder for each industry. The details of each city are in
 * src/content/site/local/cities.ts.
 */
export const CITY_SLUGS = [
  // United Arab Emirates
  "dubai", "abu-dhabi", "sharjah", "ajman", "ras-al-khaimah", "al-ain",
  // Saudi Arabia and the Gulf
  "riyadh", "jeddah", "dammam", "doha", "kuwait-city", "manama", "muscat",
  // Middle East and North Africa
  "cairo", "alexandria", "amman", "beirut", "casablanca", "marrakech", "rabat", "tunis", "algiers", "istanbul",
  // United Kingdom and Europe
  "london", "manchester", "birmingham", "leeds", "liverpool", "edinburgh", "glasgow", "dublin",
  "paris", "berlin", "munich", "frankfurt", "hamburg", "amsterdam", "brussels", "madrid", "barcelona", "lisbon",
  "rome", "milan", "vienna", "zurich", "geneva", "stockholm", "copenhagen", "oslo", "helsinki", "warsaw", "prague", "athens",
  // North America
  "new-york", "los-angeles", "chicago", "houston", "miami", "san-francisco", "san-diego", "seattle", "boston",
  "washington-dc", "atlanta", "dallas", "austin", "phoenix", "las-vegas", "denver", "philadelphia",
  "toronto", "vancouver", "montreal", "calgary",
  // Latin America
  "mexico-city", "sao-paulo", "rio-de-janeiro", "buenos-aires", "bogota", "lima", "santiago",
  // Asia Pacific
  "singapore", "kuala-lumpur", "tokyo", "osaka", "seoul", "hong-kong", "taipei", "bangkok", "jakarta", "manila",
  "ho-chi-minh-city", "sydney", "melbourne", "brisbane", "perth", "auckland",
  // South Asia
  "mumbai", "delhi", "bengaluru", "hyderabad", "chennai", "kolkata", "pune", "karachi", "lahore", "islamabad", "dhaka", "colombo",
  // Africa
  "johannesburg", "cape-town", "durban", "lagos", "abuja", "accra", "nairobi", "kampala", "kigali", "dar-es-salaam", "addis-ababa",
] as const;
export type CitySlug = (typeof CITY_SLUGS)[number];

/** The English-only local pages: /locations, /locations/<city>, /industries/<industry>/<city>, /integrations/<platform>/<industry>. */
export const LOCAL_PAGES = [
  "/locations",
  ...CITY_SLUGS.map((city) => `/locations/${city}`),
  ...INDUSTRY_SLUGS.flatMap((industry) => CITY_SLUGS.map((city) => `/industries/${industry}/${city}`)),
  ...INTEGRATION_SLUGS.flatMap((platform) => INDUSTRY_SLUGS.map((industry) => `/integrations/${platform}/${industry}`)),
];
const LOCAL_PAGE_SET = new Set<string>(LOCAL_PAGES);

/** Whether a page exists in Arabic too (the local pages are English only). */
export const isTranslated = (page: string) => !LOCAL_PAGE_SET.has(page);

/** Every page of the site, as a path without language prefix. "" is the home page. */
export const SITE_PAGES = [
  "",
  "/features",
  "/pricing",
  "/industries",
  ...INDUSTRY_SLUGS.map((slug) => `/industries/${slug}`),
  ...Object.values(TOPIC_GROUPS).flatMap((group) => [group.base, ...group.slugs.map((slug) => `${group.base}/${slug}`)]),
  "/faq",
  "/contact",
  "/privacy",
  "/terms",
  "/refund",
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
  if ((SITE_PAGES as readonly string[]).includes(page)) return { lang, page };
  return lang === "en" && LOCAL_PAGE_SET.has(page) ? { lang, page } : null;
}

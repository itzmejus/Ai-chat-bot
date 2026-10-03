/**
 * The public marketing site's URLs. Shared by the proxy (routing), the sitemap and the
 * pages themselves, so the three can never disagree. No imports: the proxy must stay light.
 *
 * English pages have no prefix ("/pricing"); Arabic pages live under "/ar" ("/ar/pricing").
 * Internally both are served by src/app/(site)/[lang]/..., which the proxy rewrites to.
 */

export const SITE_LANGS = ["en", "ar"] as const;
export type SiteLang = (typeof SITE_LANGS)[number];

export const INDUSTRY_SLUGS = ["clinics", "real-estate", "salons", "restaurants", "car-rental", "retail"] as const;
export type IndustrySlug = (typeof INDUSTRY_SLUGS)[number];

/** Every page of the site, as a path without language prefix. "" is the home page. */
export const SITE_PAGES = ["", "/features", "/pricing", "/industries", ...INDUSTRY_SLUGS.map((slug) => `/industries/${slug}`), "/privacy", "/terms"] as const;

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

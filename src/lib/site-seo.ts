import type { Metadata } from "next";
import { APP_NAME, APP_URL, SITE_URL } from "@/lib/config";
import { sitePath, type SiteLang } from "@/lib/site-routes";

/** Full public address of a marketing page. */
export const siteUrl = (lang: SiteLang, page: string) => SITE_URL + (sitePath(lang, page) === "/" ? "" : sitePath(lang, page));

/** Link from the site into the app (login, signup). Relative when both share a host. */
export const appLink = (path: string) => (APP_URL === SITE_URL ? path : APP_URL + path);

/** The shared preview picture (src/app/opengraph-image.tsx). Listed explicitly: a page's own openGraph block replaces the inherited one. */
const OG_IMAGE = { url: "/opengraph-image", width: 1200, height: 630, alt: `${APP_NAME}: AI customer support in your customers' language` };

const OG_LOCALE: Record<SiteLang, string> = { en: "en_US", ar: "ar_AR" };

/** Longest title search results show in full, roughly; longer ones are cut off. */
export const TITLE_MAX = 65;

/**
 * Metadata for one marketing page: title, description, canonical address, the
 * English/Arabic alternates search engines use to pick the right language, and
 * the Open Graph / Twitter tags used for link previews.
 */
/** `image` is the page's own preview picture; the shared one otherwise. `englishOnly` pages have no Arabic version to point to. */
export function siteMetadata(
  lang: SiteLang,
  page: string,
  meta: { title: string; description: string },
  image?: { url: string; alt: string },
  { englishOnly = false }: { englishOnly?: boolean } = {},
): Metadata {
  const preview = image ? { url: image.url, width: 1200, height: 630, alt: image.alt } : OG_IMAGE;
  const url = siteUrl(lang, page);
  // The home page title already contains the product name; other pages get it appended, unless
  // that would make the title longer than search results show (about 65 characters), in which
  // case the page's own words matter more than the name.
  const branded = `${meta.title} · ${APP_NAME}`;
  const fullTitle = page === "" || branded.length > TITLE_MAX ? meta.title : branded;
  const title = { absolute: fullTitle };

  return {
    title,
    description: meta.description,
    alternates: {
      canonical: url,
      languages: englishOnly
        ? { en: siteUrl("en", page), "x-default": siteUrl("en", page) }
        : { en: siteUrl("en", page), ar: siteUrl("ar", page), "x-default": siteUrl("en", page) },
    },
    openGraph: {
      type: "website",
      url,
      siteName: APP_NAME,
      title: fullTitle,
      description: meta.description,
      locale: OG_LOCALE[lang],
      ...(!englishOnly && { alternateLocale: OG_LOCALE[lang === "en" ? "ar" : "en"] }),
      images: [preview],
    },
    twitter: { card: "summary_large_image", title: fullTitle, description: meta.description, images: [preview.url] },
    robots: { index: true, follow: true },
  };
}

/** schema.org description of the product and its plans, for the home and pricing pages. */
export function softwareJsonLd(lang: SiteLang, description: string, plans: { name: string; price: number }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: APP_NAME,
    applicationCategory: "BusinessApplication",
    operatingSystem: "Web",
    description,
    url: siteUrl(lang, ""),
    inLanguage: ["en", "ar"],
    offers: plans.map((plan) => ({
      "@type": "Offer",
      name: plan.name,
      price: plan.price,
      priceCurrency: "EUR",
      url: siteUrl(lang, "/pricing"),
    })),
  };
}

/** schema.org breadcrumb trail for a sub-page. */
export function breadcrumbJsonLd(lang: SiteLang, home: string, trail: { name: string; page: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [{ name: home, page: "" }, ...trail].map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      item: siteUrl(lang, item.page),
    })),
  };
}

export function faqJsonLd(items: { q: string; a: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((item) => ({ "@type": "Question", name: item.q, acceptedAnswer: { "@type": "Answer", text: item.a } })),
  };
}

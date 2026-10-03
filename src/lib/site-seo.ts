import type { Metadata } from "next";
import { APP_NAME, APP_URL, SITE_URL } from "@/lib/config";
import { sitePath, type SiteLang } from "@/lib/site-routes";

/** Full public address of a marketing page. */
export const siteUrl = (lang: SiteLang, page: string) => SITE_URL + (sitePath(lang, page) === "/" ? "" : sitePath(lang, page));

/** Link from the site into the app (login, signup). Relative when both share a host. */
export const appLink = (path: string) => (APP_URL === SITE_URL ? path : APP_URL + path);

/** The shared preview picture (src/app/opengraph-image.tsx). Listed explicitly: a page's own openGraph block replaces the inherited one. */
const OG_IMAGE = { url: "/opengraph-image", width: 1200, height: 630, alt: `${APP_NAME}: AI customer support in your customers' language` };

const OG_LOCALE: Record<SiteLang, string> = { en: "en_AE", ar: "ar_AE" };

/**
 * Metadata for one marketing page: title, description, canonical address, the
 * English/Arabic alternates search engines use to pick the right language, and
 * the Open Graph / Twitter tags used for link previews.
 */
export function siteMetadata(lang: SiteLang, page: string, meta: { title: string; description: string }): Metadata {
  const url = siteUrl(lang, page);
  // The home page title already contains the product name; other pages get it appended.
  const title = page === "" ? { absolute: meta.title } : meta.title;
  const fullTitle = page === "" ? meta.title : `${meta.title} · ${APP_NAME}`;

  return {
    title,
    description: meta.description,
    alternates: {
      canonical: url,
      languages: { en: siteUrl("en", page), ar: siteUrl("ar", page), "x-default": siteUrl("en", page) },
    },
    openGraph: {
      type: "website",
      url,
      siteName: APP_NAME,
      title: fullTitle,
      description: meta.description,
      locale: OG_LOCALE[lang],
      alternateLocale: OG_LOCALE[lang === "en" ? "ar" : "en"],
      images: [OG_IMAGE],
    },
    twitter: { card: "summary_large_image", title: fullTitle, description: meta.description, images: [OG_IMAGE.url] },
    robots: { index: true, follow: true },
  };
}

/** schema.org description of the product and its plans, for the home and pricing pages. */
export function softwareJsonLd(lang: SiteLang, description: string, plans: { name: string; priceAed: number }[]) {
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
      price: plan.priceAed,
      priceCurrency: "AED",
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

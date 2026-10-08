import type { MetadataRoute } from "next";
import { SITE_LANGS, SITE_PAGES, SITE_UPDATED } from "@/lib/site-routes";
import { siteUrl } from "@/lib/site-seo";

// Built per request, so SITE_URL is read from the running server's environment
// (the Docker image is built without it).
export const dynamic = "force-dynamic";

const PRIORITY: Record<string, number> = { "": 1, "/features": 0.9, "/pricing": 0.9, "/industries": 0.8, "/integrations": 0.8, "/use-cases": 0.8, "/blog": 0.8, "/faq": 0.6, "/privacy": 0.2, "/terms": 0.2 };

/** Every public page in both languages, each pointing at its translation. */
export default function sitemap(): MetadataRoute.Sitemap {
  return SITE_PAGES.flatMap((page) =>
    SITE_LANGS.map((lang) => ({
      url: siteUrl(lang, page),
      lastModified: SITE_UPDATED,
      changeFrequency: page === "" ? ("weekly" as const) : ("monthly" as const),
      priority: PRIORITY[page] ?? 0.7,
      alternates: { languages: { en: siteUrl("en", page), ar: siteUrl("ar", page) } },
    })),
  );
}

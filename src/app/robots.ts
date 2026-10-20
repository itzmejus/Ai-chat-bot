import type { MetadataRoute } from "next";
import { headers } from "next/headers";
import { SITE_URL } from "@/lib/config";

/** Logged-in, account and widget areas: nothing there is useful to a search engine or an AI. */
export const PRIVATE_PATHS = [
  "/dashboard",
  "/admin",
  "/api/",
  "/embed/",
  "/onboarding",
  "/invite/",
  "/login",
  "/signup",
  "/forgot-password",
  "/reset-password/",
  "/verify-email/",
];

/**
 * AI search and answer assistants, and the main search engines, named explicitly so the site
 * shows up when people ask them about AI customer support. A crawler follows only the most
 * specific group naming it, so this group repeats the private paths rather than inheriting "*".
 */
export const NAMED_BOTS = ["OAI-SearchBot", "ChatGPT-User", "Claude-SearchBot", "Claude-User", "PerplexityBot", "Googlebot", "Bingbot"];

/**
 * Everyone may read the public site. When the dashboard or the widget runs on its own
 * hostname, that hostname is closed to crawlers entirely.
 */
export default async function robots(): Promise<MetadataRoute.Robots> {
  const requestHeaders = await headers();
  const host = requestHeaders.get("x-forwarded-host") ?? requestHeaders.get("host") ?? "";
  const siteHost = new URL(SITE_URL).host;

  if (host && host !== siteHost) return { rules: { userAgent: "*", disallow: "/" } };

  return {
    rules: [
      { userAgent: NAMED_BOTS, allow: "/", disallow: PRIVATE_PATHS },
      { userAgent: "*", allow: "/", disallow: PRIVATE_PATHS },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}

import type { MetadataRoute } from "next";
import { headers } from "next/headers";
import { SITE_URL } from "@/lib/config";

/**
 * Search engines may index the public site only. When the dashboard or the widget
 * runs on its own hostname, that hostname is closed to crawlers entirely.
 */
export default async function robots(): Promise<MetadataRoute.Robots> {
  const requestHeaders = await headers();
  const host = requestHeaders.get("x-forwarded-host") ?? requestHeaders.get("host") ?? "";
  const siteHost = new URL(SITE_URL).host;

  if (host && host !== siteHost) return { rules: { userAgent: "*", disallow: "/" } };

  return {
    rules: { userAgent: "*", allow: "/", disallow: ["/dashboard", "/api/", "/embed/", "/onboarding", "/invite/", "/login", "/signup"] },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}

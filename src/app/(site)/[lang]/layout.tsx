import { notFound } from "next/navigation";
import { SITE_LANGS } from "@/lib/site-routes";

/**
 * The public marketing site. Visitors never see the "[lang]" segment for English:
 * the proxy rewrites "/pricing" to "/en/pricing" (see src/proxy.ts), while Arabic
 * pages are served at "/ar/...". The header and footer are added by each page
 * through <SiteShell>, because the language link needs to know the page.
 */
export default async function SiteLayout({ children, params }: LayoutProps<"/[lang]">) {
  const { lang } = await params;
  if (!(SITE_LANGS as readonly string[]).includes(lang)) notFound();
  return children;
}

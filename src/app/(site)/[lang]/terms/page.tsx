import type { Metadata } from "next";
import { LegalPage } from "@/components/site/legal-page";
import { getSiteContent } from "@/content/site";
import type { SiteLang } from "@/lib/site-routes";
import { siteMetadata } from "@/lib/site-seo";

const asLang = (lang: string): SiteLang => (lang === "ar" ? "ar" : "en");

export async function generateMetadata({ params }: PageProps<"/[lang]/terms">): Promise<Metadata> {
  const lang = asLang((await params).lang);
  return siteMetadata(lang, "/terms", getSiteContent(lang).legal.terms.meta);
}

export default async function TermsPage({ params }: PageProps<"/[lang]/terms">) {
  return <LegalPage lang={asLang((await params).lang)} kind="terms" />;
}

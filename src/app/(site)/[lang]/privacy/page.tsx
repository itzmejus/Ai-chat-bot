import type { Metadata } from "next";
import { LegalPage } from "@/components/site/legal-page";
import { getSiteContent } from "@/content/site";
import type { SiteLang } from "@/lib/site-routes";
import { siteMetadata } from "@/lib/site-seo";

const asLang = (lang: string): SiteLang => (lang === "ar" ? "ar" : "en");

export async function generateMetadata({ params }: PageProps<"/[lang]/privacy">): Promise<Metadata> {
  const lang = asLang((await params).lang);
  return siteMetadata(lang, "/privacy", getSiteContent(lang).legal.privacy.meta);
}

export default async function PrivacyPage({ params }: PageProps<"/[lang]/privacy">) {
  return <LegalPage lang={asLang((await params).lang)} kind="privacy" />;
}

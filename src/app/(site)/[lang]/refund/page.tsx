import type { Metadata } from "next";
import { LegalPage } from "@/components/site/legal-page";
import { getSiteContent } from "@/content/site";
import type { SiteLang } from "@/lib/site-routes";
import { siteMetadata } from "@/lib/site-seo";

const asLang = (lang: string): SiteLang => (lang === "ar" ? "ar" : "en");

export async function generateMetadata({ params }: PageProps<"/[lang]/refund">): Promise<Metadata> {
  const lang = asLang((await params).lang);
  return siteMetadata(lang, "/refund", getSiteContent(lang).legal.refund.meta);
}

export default async function RefundPage({ params }: PageProps<"/[lang]/refund">) {
  return <LegalPage lang={asLang((await params).lang)} kind="refund" />;
}

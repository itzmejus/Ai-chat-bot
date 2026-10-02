import { Check } from "lucide-react";
import type { Metadata } from "next";
import { JsonLd } from "@/components/site/json-ld";
import { CtaBand, FaqList, PageHero, PricingCards, Section, SectionHeading } from "@/components/site/sections";
import { SiteShell } from "@/components/site/shell";
import { getSiteContent } from "@/content/site";
import type { SiteLang } from "@/lib/site-routes";
import { breadcrumbJsonLd, faqJsonLd, siteMetadata } from "@/lib/site-seo";

const PAGE = "/pricing";
const asLang = (lang: string): SiteLang => (lang === "ar" ? "ar" : "en");

export async function generateMetadata({ params }: PageProps<"/[lang]/pricing">): Promise<Metadata> {
  const lang = asLang((await params).lang);
  return siteMetadata(lang, PAGE, getSiteContent(lang).pricingPage.meta);
}

export default async function PricingPage({ params }: PageProps<"/[lang]/pricing">) {
  const lang = asLang((await params).lang);
  const t = getSiteContent(lang);
  const page = t.pricingPage;

  return (
    <SiteShell lang={lang} page={PAGE}>
      <JsonLd data={breadcrumbJsonLd(lang, t.breadcrumbHome, [{ name: t.nav.pricing, page: PAGE }])} />
      <JsonLd data={faqJsonLd(page.faq.items)} />

      <PageHero eyebrow={page.eyebrow} title={page.h1} sub={page.sub} />

      <Section className="!pt-14">
        <PricingCards lang={lang} />

        <div className="card-surface mt-10 rounded-3xl border border-border/80 p-7">
          <h2 className="text-xl font-bold">{page.included.title}</h2>
          <ul className="mt-5 grid gap-x-6 gap-y-3 sm:grid-cols-2 lg:grid-cols-3">
            {page.included.items.map((item) => (
              <li key={item} className="flex items-start gap-3 text-[15px]">
                <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-[#e7f8ee] text-success">
                  <Check className="size-3" strokeWidth={3} />
                </span>
                {item}
              </li>
            ))}
          </ul>
        </div>
      </Section>

      <Section tone="muted">
        <SectionHeading title={page.faq.title} />
        <div className="mt-10">
          <FaqList items={page.faq.items} />
        </div>
      </Section>

      <CtaBand lang={lang} />
    </SiteShell>
  );
}

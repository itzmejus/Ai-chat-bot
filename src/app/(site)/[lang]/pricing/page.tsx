import type { Metadata } from "next";
import { JsonLd } from "@/components/site/json-ld";
import { CtaBand, FaqList, IncludedInEveryPlan, PageHero, PlanComparison, PricingCards, Section, SectionHeading } from "@/components/site/sections";
import { SiteShell } from "@/components/site/shell";
import { getSiteContent, SITE_PLANS } from "@/content/site";
import type { SiteLang } from "@/lib/site-routes";
import { breadcrumbJsonLd, faqJsonLd, siteMetadata, softwareJsonLd } from "@/lib/site-seo";

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
      <JsonLd data={softwareJsonLd(lang, page.meta.description, SITE_PLANS.map((plan) => ({ name: page.plans[plan.id].name, priceAed: plan.priceAed })))} />

      <PageHero eyebrow={page.eyebrow} title={page.h1} sub={page.sub} />

      <Section tone="muted" className="!pt-14 lg:!pt-20">
        <PricingCards lang={lang} />
        <div className="mt-8 lg:mt-12">
          <IncludedInEveryPlan lang={lang} />
        </div>
      </Section>

      <Section>
        <SectionHeading title={page.compare.title} />
        <div className="mt-10">
          <PlanComparison lang={lang} />
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

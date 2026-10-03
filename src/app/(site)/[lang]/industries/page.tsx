import type { Metadata } from "next";
import { JsonLd } from "@/components/site/json-ld";
import { CtaBand, IndustryCards, IndustryShowcase, PageHero, Section, SectionHeading } from "@/components/site/sections";
import { CtaLink, SiteShell } from "@/components/site/shell";
import { getSiteContent } from "@/content/site";
import { INDUSTRY_SLUGS, type SiteLang } from "@/lib/site-routes";
import { appLink, breadcrumbJsonLd, siteMetadata, siteUrl } from "@/lib/site-seo";

const PAGE = "/industries";
const asLang = (lang: string): SiteLang => (lang === "ar" ? "ar" : "en");

export async function generateMetadata({ params }: PageProps<"/[lang]/industries">): Promise<Metadata> {
  const lang = asLang((await params).lang);
  return siteMetadata(lang, PAGE, getSiteContent(lang).industriesPage.meta);
}

/** All industries on one page: the tabs to explore them, then a card linking to each industry's own page. */
export default async function IndustriesPage({ params }: PageProps<"/[lang]/industries">) {
  const lang = asLang((await params).lang);
  const t = getSiteContent(lang);
  const page = t.industriesPage;

  return (
    <SiteShell lang={lang} page={PAGE}>
      <JsonLd data={breadcrumbJsonLd(lang, t.breadcrumbHome, [{ name: t.nav.industries, page: PAGE }])} />
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "ItemList",
          name: page.meta.title,
          itemListElement: INDUSTRY_SLUGS.map((slug, i) => ({
            "@type": "ListItem",
            position: i + 1,
            name: t.industries[slug].name,
            url: siteUrl(lang, `/industries/${slug}`),
          })),
        }}
      />

      <PageHero eyebrow={t.nav.industries} title={page.h1} sub={page.sub}>
        <CtaLink href={appLink("/signup")} size="lg" arrow>
          {t.nav.start}
        </CtaLink>
      </PageHero>

      <Section className="!pt-12 sm:!pt-16">
        <IndustryShowcase lang={lang} />
      </Section>

      <Section tone="muted">
        <SectionHeading title={page.all} />
        <div className="mt-10">
          <IndustryCards lang={lang} />
        </div>
      </Section>

      <CtaBand lang={lang} />
    </SiteShell>
  );
}

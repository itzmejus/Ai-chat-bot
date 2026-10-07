import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { INDUSTRY_ART } from "@/components/site/art";
import { JsonLd } from "@/components/site/json-ld";
import { Bubble } from "@/components/site/mockups";
import { CtaBand, Eyebrow, IndustryCards, Section, SectionHeading } from "@/components/site/sections";
import { CtaLink, SiteShell } from "@/components/site/shell";
import { getSiteContent } from "@/content/site";
import { INDUSTRY_SLUGS, sitePath, type IndustrySlug, type SiteLang } from "@/lib/site-routes";
import { APP_NAME, SITE_URL } from "@/lib/config";
import { appLink, breadcrumbJsonLd, siteMetadata, siteUrl } from "@/lib/site-seo";

const asLang = (lang: string): SiteLang => (lang === "ar" ? "ar" : "en");
const isIndustry = (slug: string): slug is IndustrySlug => (INDUSTRY_SLUGS as readonly string[]).includes(slug);

export async function generateMetadata({ params }: PageProps<"/[lang]/industries/[slug]">): Promise<Metadata> {
  const { lang, slug } = await params;
  if (!isIndustry(slug)) return {};
  return siteMetadata(asLang(lang), `/industries/${slug}`, getSiteContent(asLang(lang)).industries[slug].meta);
}

export default async function IndustryPage({ params }: PageProps<"/[lang]/industries/[slug]">) {
  const { lang: rawLang, slug } = await params;
  if (!isIndustry(slug)) notFound();
  const lang = asLang(rawLang);
  const t = getSiteContent(lang);
  const industry = t.industries[slug];
  const page = `/industries/${slug}`;
  const Art = INDUSTRY_ART[slug];

  return (
    <SiteShell lang={lang} page={page}>
      <JsonLd
        data={breadcrumbJsonLd(lang, t.breadcrumbHome, [
          { name: t.nav.industries, page: "/industries" },
          { name: industry.name, page },
        ])}
      />
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "Service",
          name: industry.meta.title,
          description: industry.meta.description,
          serviceType: "AI customer support chatbot",
          url: siteUrl(lang, page),
          inLanguage: lang,
          areaServed: "Worldwide",
          provider: { "@type": "Organization", name: APP_NAME, url: SITE_URL },
        }}
      />

      {/* ---- Hero */}
      <section className="site-hero relative overflow-hidden border-b border-border/60">
        <div className="mx-auto grid max-w-6xl items-center gap-12 px-4 py-14 sm:px-6 sm:py-20 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)]">
          <div className="flex flex-col items-start gap-6">
            <Art className="-mb-1" />
            <Eyebrow>
              {t.industryPage.eyebrow} · {industry.name}
            </Eyebrow>
            <h1 className="text-4xl leading-[1.1] font-bold tracking-tight text-balance sm:text-5xl">{industry.h1}</h1>
            <p className="max-w-xl text-lg leading-relaxed text-pretty text-muted-foreground">{industry.sub}</p>
            <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
              <CtaLink href={appLink("/signup")} size="lg" arrow>
                {t.industryPage.cta}
              </CtaLink>
              <CtaLink href={sitePath(lang, "/features")} variant="outline" size="lg">
                {t.nav.features}
              </CtaLink>
            </div>
          </div>

          {/* sample exchange */}
          <div aria-hidden className="mx-auto flex w-full max-w-md flex-col gap-3 rounded-3xl bg-[#f4f4f6] p-5 shadow-[0_32px_64px_-28px_rgb(27_27_32/0.45)] ring-1 ring-black/5">
            {industry.chat.map((line, i) => (
              <span key={i} className="site-pop flex flex-col" style={{ animationDelay: `${0.3 + i * 0.6}s` }}>
                <Bubble line={line} />
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ---- Questions it answers */}
      <Section>
        <SectionHeading title={t.industryPage.asks} />
        <ul className="mx-auto mt-10 flex max-w-4xl flex-wrap justify-center gap-3">
          {industry.questions.map((question) => (
            <li key={question} dir="auto" className="flex items-center gap-2.5 rounded-full border border-border bg-white px-4 py-2.5 text-[15px] font-medium shadow-[0_1px_2px_rgb(27_27_32/0.05)]">
              <span className="size-2 shrink-0 rounded-full bg-primary" />
              {question}
            </li>
          ))}
        </ul>
      </Section>

      {/* ---- Benefits */}
      <Section tone="muted">
        <SectionHeading title={t.industryPage.benefits} />
        <ul className="mt-10 grid gap-5 md:grid-cols-3">
          {industry.benefits.map((benefit, i) => (
            <li key={benefit.title} className="flex flex-col gap-3 rounded-3xl border border-border/70 bg-white p-7">
              <span className="flex size-10 items-center justify-center rounded-xl bg-accent text-base font-bold text-primary">{i + 1}</span>
              <h3 className="text-xl font-semibold">{benefit.title}</h3>
              <p className="text-[15px] leading-relaxed text-muted-foreground">{benefit.text}</p>
            </li>
          ))}
        </ul>
      </Section>

      {/* ---- Other industries */}
      <Section>
        <SectionHeading title={t.industryPage.other} />
        <div className="mt-10">
          <IndustryCards lang={lang} exclude={slug} />
        </div>
      </Section>

      <CtaBand lang={lang} />
    </SiteShell>
  );
}

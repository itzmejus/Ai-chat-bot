import { ArrowRight, Check } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { DotPattern } from "@/components/illustrations";
import { FEATURE_ART, STEP_ART } from "@/components/site/art";
import { JsonLd } from "@/components/site/json-ld";
import { HeadlineStroke, HeroStage } from "@/components/site/mockups";
import {
  ArrowLink,
  BilingualVisual,
  CtaBand,
  FaqList,
  GroundedVisual,
  HandoverSection,
  IncludedInEveryPlan,
  IndustryShowcase,
  PricingCards,
  Section,
  SectionHeading,
} from "@/components/site/sections";
import { CtaLink, SiteShell } from "@/components/site/shell";
import { getSiteContent, SITE_PLANS, type FeatureKey } from "@/content/site";
import { APP_NAME, SITE_URL } from "@/lib/config";
import { INDUSTRY_SLUGS, sitePath, type SiteLang } from "@/lib/site-routes";
import { appLink, faqJsonLd, siteMetadata, siteUrl, softwareJsonLd } from "@/lib/site-seo";
import { cn } from "@/lib/utils";

const asLang = (lang: string): SiteLang => (lang === "ar" ? "ar" : "en");

export async function generateMetadata({ params }: PageProps<"/[lang]">): Promise<Metadata> {
  const lang = asLang((await params).lang);
  return siteMetadata(lang, "", getSiteContent(lang).home.meta);
}

/** Layout of the feature grid: two wide cards, four small ones, two wide ones. */
const FEATURE_ORDER: { key: FeatureKey; wide: boolean }[] = [
  { key: "grounded", wide: true },
  { key: "bilingual", wide: true },
  { key: "leads", wide: false },
  { key: "handover", wide: false },
  { key: "inbox", wide: false },
  { key: "insights", wide: false },
  { key: "widget", wide: true },
  { key: "security", wide: true },
];

export default async function HomePage({ params }: PageProps<"/[lang]">) {
  const lang = asLang((await params).lang);
  const t = getSiteContent(lang);
  const home = t.home;

  const structuredData = [
    {
      "@context": "https://schema.org",
      "@type": "Organization",
      name: APP_NAME,
      url: SITE_URL,
      logo: `${SITE_URL}/apple-icon.png`,
      description: t.footer.tagline,
      areaServed: { "@type": "Country", name: "United Arab Emirates" },
    },
    { "@context": "https://schema.org", "@type": "WebSite", name: APP_NAME, url: siteUrl(lang, ""), inLanguage: lang },
    softwareJsonLd(lang, home.meta.description, SITE_PLANS.map((plan) => ({ name: t.pricingPage.plans[plan.id].name, priceAed: plan.priceAed }))),
    faqJsonLd(home.faq.items),
  ];

  return (
    <SiteShell lang={lang} page="">
      {structuredData.map((data, i) => (
        <JsonLd key={i} data={data} />
      ))}

      {/* ---- Hero */}
      <section className="site-hero relative overflow-hidden">
        <div className="mx-auto flex max-w-6xl flex-col items-center px-4 pt-12 text-center sm:px-6 sm:pt-16">
          <h1 className="max-w-4xl text-[2.5rem] leading-[1.05] font-bold tracking-tight text-balance sm:text-6xl lg:text-[4.25rem]">
            {home.h1[0]}
            <span className="relative inline-block text-primary sm:whitespace-nowrap">
              {home.h1[1]}
              <HeadlineStroke />
            </span>
            {home.h1[2]}
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-relaxed text-pretty text-muted-foreground sm:text-xl">{home.sub}</p>
          <div className="mt-8 flex w-full max-w-md flex-col gap-3 sm:max-w-none sm:flex-row sm:justify-center">
            <CtaLink href={appLink("/signup")} size="lg" arrow className="sm:min-w-64">
              {home.ctaPrimary}
            </CtaLink>
            <CtaLink href="#how-it-works" variant="outline" size="lg">
              {home.ctaSecondary}
            </CtaLink>
          </div>
          <ul className="mt-5 flex flex-wrap justify-center gap-x-6 gap-y-2 text-sm font-medium text-foreground/80">
            {home.assurances.map((item) => (
              <li key={item} className="flex items-center gap-2">
                <Check className="size-4 text-primary" strokeWidth={3} />
                {item}
              </li>
            ))}
          </ul>
          <HeroStage home={home} />
        </div>

        {/* what it does, in one dark line under the picture */}
        <div className="relative bg-sidebar text-white">
          <ul className="mx-auto flex max-w-6xl flex-wrap items-center justify-center gap-x-8 gap-y-2.5 px-4 py-4 text-sm font-semibold sm:px-6 lg:justify-between">
            {home.strip.map((item) => (
              <li key={item} className="flex items-center gap-2.5">
                <svg aria-hidden viewBox="-10 -10 20 20" className="size-3.5 shrink-0" fill="#fbbf24">
                  <path d="M0-10C1.5-3 3-1.5 10 0 3 1.5 1.5 3 0 10-1.5 3-3 1.5-10 0-3-1.5-1.5-3 0-10Z" />
                </svg>
                {item}
              </li>
            ))}
          </ul>
        </div>

        {/* industries strip */}
        <div className="border-b border-border/60 bg-white">
          <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-center gap-x-3 gap-y-3 px-4 py-5 sm:px-6">
            <span className="text-sm font-medium text-muted-foreground">{home.madeFor}</span>
            {INDUSTRY_SLUGS.map((slug) => (
              <Link
                key={slug}
                href={sitePath(lang, `/industries/${slug}`)}
                className="rounded-full border border-border bg-white px-3.5 py-1.5 text-sm font-medium transition-colors hover:border-primary/50 hover:text-primary"
              >
                {t.industries[slug].name}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ---- How it works */}
      <Section id="how-it-works">
        <SectionHeading eyebrow={home.steps.eyebrow} title={home.steps.title} sub={home.steps.sub} />
        <ol className="mt-12 grid gap-5 lg:grid-cols-3">
          {home.steps.items.map((step, i) => {
            const Art = STEP_ART[i];
            return (
              <li key={step.title} className="relative flex flex-col gap-3 rounded-3xl border border-border/80 bg-white p-6 sm:p-7">
                <div className="flex items-start justify-between gap-3">
                  <Art />
                  <span className="text-5xl leading-none font-bold text-primary/15">{i + 1}</span>
                </div>
                <h3 className="text-xl font-semibold">{step.title}</h3>
                <p className="text-[15px] leading-relaxed text-muted-foreground">{step.text}</p>
                {i < 2 && <ArrowRight className="absolute -end-[1.15rem] top-14 z-10 hidden size-6 rounded-full bg-white p-1 text-muted-foreground ring-1 ring-border lg:block rtl:rotate-180" />}
              </li>
            );
          })}
        </ol>
      </Section>

      {/* ---- Features */}
      <Section tone="muted" id="features">
        <SectionHeading eyebrow={home.features.eyebrow} title={home.features.title} sub={home.features.sub} />
        <ul className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {FEATURE_ORDER.map(({ key, wide }) => {
            const Art = FEATURE_ART[key];
            return (
              <li key={key} className={cn("flex flex-col gap-3 rounded-3xl border border-border/70 bg-white p-6", wide && "sm:col-span-2 sm:p-7")}>
                <Art className="-ms-1 h-20 w-[6.25rem]" />
                <h3 className={cn("font-semibold", wide ? "text-xl" : "text-lg")}>{home.features.items[key].title}</h3>
                <p className="text-[15px] leading-relaxed text-muted-foreground">{home.features.items[key].text}</p>
                {key === "grounded" && (
                  <div className="mt-auto rounded-2xl bg-muted p-4">
                    <GroundedVisual />
                  </div>
                )}
                {key === "bilingual" && (
                  <div className="mt-auto rounded-2xl bg-muted p-4">
                    <BilingualVisual />
                  </div>
                )}
              </li>
            );
          })}
        </ul>
        <div className="mt-10 flex justify-center">
          <ArrowLink href={sitePath(lang, "/features")}>{home.features.more}</ArrowLink>
        </div>
      </Section>

      {/* ---- AI and people, together */}
      <HandoverSection lang={lang} />

      {/* ---- Numbers */}
      <section className="mx-auto max-w-6xl px-4 sm:px-6">
        <dl className="hero-surface relative grid grid-cols-2 gap-x-6 gap-y-8 overflow-hidden rounded-[2rem] p-7 text-white sm:p-10 lg:grid-cols-4">
          <DotPattern className="text-white/10" />
          {home.stats.map((stat) => (
            <div key={stat.label} className="relative flex flex-col-reverse justify-end gap-2">
              <dt className="text-sm leading-snug text-white/65 sm:text-[15px]">{stat.label}</dt>
              <dd dir="ltr" className="text-4xl font-bold tracking-tight sm:text-5xl rtl:text-end">
                {stat.value}
              </dd>
            </div>
          ))}
        </dl>
      </section>

      {/* ---- Industries */}
      <Section id="industries">
        <SectionHeading eyebrow={home.industries.eyebrow} title={home.industries.title} sub={home.industries.sub} />
        <div className="mt-10 sm:mt-12">
          <IndustryShowcase lang={lang} />
        </div>
      </Section>

      {/* ---- Pricing */}
      <Section tone="muted" id="pricing">
        <SectionHeading eyebrow={home.pricing.eyebrow} title={home.pricing.title} sub={home.pricing.sub} />
        <div className="mt-12 lg:mt-16">
          <PricingCards lang={lang} />
        </div>
        <div className="mt-8 lg:mt-12">
          <IncludedInEveryPlan lang={lang} />
        </div>
        <div className="mt-6 flex justify-center">
          <ArrowLink href={sitePath(lang, "/pricing")}>{home.pricing.link}</ArrowLink>
        </div>
      </Section>

      {/* ---- FAQ */}
      <Section id="faq">
        <SectionHeading eyebrow={home.faq.eyebrow} title={home.faq.title} sub={home.faq.sub} />
        <div className="mt-12">
          <FaqList items={home.faq.items} />
        </div>
      </Section>

      <CtaBand lang={lang} />
    </SiteShell>
  );
}

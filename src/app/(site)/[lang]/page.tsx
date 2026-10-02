import { ArrowRight, Check } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { DotPattern } from "@/components/illustrations";
import { JsonLd } from "@/components/site/json-ld";
import { HeroStage, InboxMock, TickList } from "@/components/site/mockups";
import {
  BilingualVisual,
  CtaBand,
  Eyebrow,
  FaqList,
  FEATURE_ICONS,
  FEATURE_TINT,
  GroundedVisual,
  INDUSTRY_ICONS,
  IndustryCards,
  PricingCards,
  Section,
  SectionHeading,
} from "@/components/site/sections";
import { CtaLink, SiteShell } from "@/components/site/shell";
import { getSiteContent, SITE_PLANS, type FeatureKey } from "@/content/site";
import { APP_NAME, SITE_URL } from "@/lib/config";
import { INDUSTRY_SLUGS, sitePath, type SiteLang } from "@/lib/site-routes";
import { appLink, faqJsonLd, siteMetadata, siteUrl } from "@/lib/site-seo";
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
      description: t.footer.tagline,
      areaServed: { "@type": "Country", name: "United Arab Emirates" },
    },
    { "@context": "https://schema.org", "@type": "WebSite", name: APP_NAME, url: siteUrl(lang, ""), inLanguage: lang },
    {
      "@context": "https://schema.org",
      "@type": "SoftwareApplication",
      name: APP_NAME,
      applicationCategory: "BusinessApplication",
      operatingSystem: "Web",
      description: home.meta.description,
      url: siteUrl(lang, ""),
      inLanguage: ["en", "ar"],
      offers: SITE_PLANS.map((plan) => ({
        "@type": "Offer",
        name: t.pricingPage.plans[plan.id].name,
        price: plan.priceAed,
        priceCurrency: "AED",
        url: siteUrl(lang, "/pricing"),
      })),
    },
    faqJsonLd(home.faq.items),
  ];

  return (
    <SiteShell lang={lang} page="">
      {structuredData.map((data, i) => (
        <JsonLd key={i} data={data} />
      ))}

      {/* ---- Hero */}
      <section className="site-hero relative overflow-hidden">
        <div className="mx-auto flex max-w-6xl flex-col items-center px-4 pt-14 pb-16 text-center sm:px-6 sm:pt-20 sm:pb-24">
          <Eyebrow>
            <span className="relative flex size-2">
              <span className="absolute inline-flex size-full animate-ping rounded-full bg-primary/60 motion-reduce:hidden" />
              <span className="relative inline-flex size-2 rounded-full bg-primary" />
            </span>
            {home.badge}
          </Eyebrow>
          <h1 className="mt-6 max-w-4xl text-[2.6rem] leading-[1.06] font-bold tracking-tight text-balance sm:text-6xl lg:text-[4.5rem]">
            {home.h1[0]}
            <span className="site-gradient-text">{home.h1[1]}</span>
            {home.h1[2]}
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-relaxed text-pretty text-muted-foreground sm:text-xl">{home.sub}</p>
          <div className="mt-8 flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
            <CtaLink href={appLink("/signup")} size="lg" arrow>
              {home.ctaPrimary}
            </CtaLink>
            <CtaLink href="#how-it-works" variant="outline" size="lg">
              {home.ctaSecondary}
            </CtaLink>
          </div>
          <ul className="mt-6 flex flex-wrap justify-center gap-x-6 gap-y-2 text-sm text-muted-foreground">
            {home.assurances.map((item) => (
              <li key={item} className="flex items-center gap-2">
                <Check className="size-4 text-success" strokeWidth={3} />
                {item}
              </li>
            ))}
          </ul>
          <div className="mt-14 w-full sm:mt-16">
            <HeroStage home={home} />
          </div>
        </div>

        {/* industries strip */}
        <div className="border-y border-border/60 bg-white/70">
          <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-center gap-x-3 gap-y-3 px-4 py-5 sm:px-6">
            <span className="text-sm font-medium text-muted-foreground">{home.madeFor}</span>
            {INDUSTRY_SLUGS.map((slug) => {
              const Icon = INDUSTRY_ICONS[slug];
              return (
                <Link
                  key={slug}
                  href={sitePath(lang, `/industries/${slug}`)}
                  className="flex items-center gap-2 rounded-full border border-border bg-white px-3.5 py-1.5 text-sm font-medium transition-colors hover:border-primary/50 hover:text-primary"
                >
                  <Icon className="size-4 text-primary" />
                  {t.industries[slug].name}
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* ---- How it works */}
      <Section id="how-it-works">
        <SectionHeading eyebrow={home.steps.eyebrow} title={home.steps.title} sub={home.steps.sub} />
        <ol className="mt-12 grid gap-5 lg:grid-cols-3">
          {home.steps.items.map((step, i) => (
            <li key={step.title} className="card-surface relative flex flex-col gap-3 rounded-3xl border border-border/80 p-7">
              <span className="flex size-11 items-center justify-center rounded-2xl bg-foreground text-lg font-bold text-white">{i + 1}</span>
              <h3 className="text-xl font-semibold">{step.title}</h3>
              <p className="text-[15px] leading-relaxed text-muted-foreground">{step.text}</p>
              {i < 2 && <ArrowRight className="absolute -end-[1.15rem] top-10 z-10 hidden size-6 rounded-full bg-white p-1 text-muted-foreground ring-1 ring-border lg:block rtl:rotate-180" />}
            </li>
          ))}
        </ol>
      </Section>

      {/* ---- Features */}
      <Section tone="muted" id="features">
        <SectionHeading eyebrow={home.features.eyebrow} title={home.features.title} sub={home.features.sub} />
        <ul className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {FEATURE_ORDER.map(({ key, wide }) => {
            const Icon = FEATURE_ICONS[key];
            return (
              <li key={key} className={cn("flex flex-col gap-3 rounded-3xl border border-border/70 bg-white p-6", wide && "sm:col-span-2 sm:p-7")}>
                <span className={cn("flex size-11 items-center justify-center rounded-xl", FEATURE_TINT[key])}>
                  <Icon className="size-5" />
                </span>
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
          <Link href={sitePath(lang, "/features")} className="group flex h-11 items-center gap-2 rounded-lg px-3 text-[15px] font-semibold text-primary hover:bg-accent">
            {home.features.more}
            <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5 rtl:rotate-180 rtl:group-hover:-translate-x-0.5" />
          </Link>
        </div>
      </Section>

      {/* ---- Human takeover */}
      <section className="hero-surface relative overflow-hidden py-16 sm:py-24">
        <DotPattern className="text-white/10" />
        <div className="relative mx-auto grid max-w-6xl items-center gap-12 px-4 sm:px-6 lg:grid-cols-2">
          <div className="flex flex-col items-start gap-5">
            <Eyebrow tone="dark">{home.handover.eyebrow}</Eyebrow>
            <h2 className="text-3xl leading-tight font-bold tracking-tight text-balance text-white sm:text-[2.5rem]">{home.handover.title}</h2>
            <p className="text-lg leading-relaxed text-white/75">{home.handover.text}</p>
            <TickList items={home.handover.points} tone="dark" />
          </div>
          <InboxMock t={home.handover} />
        </div>
      </section>

      {/* ---- Numbers */}
      <Section className="!py-14 sm:!py-16">
        <dl className="grid grid-cols-2 gap-x-6 gap-y-10 lg:grid-cols-4">
          {home.stats.map((stat) => (
            <div key={stat.label} className="flex flex-col-reverse gap-2 border-s-2 border-primary/25 ps-5">
              <dt className="text-[15px] leading-snug text-muted-foreground">{stat.label}</dt>
              <dd dir="ltr" className="text-4xl font-bold tracking-tight sm:text-5xl rtl:text-end">
                {stat.value}
              </dd>
            </div>
          ))}
        </dl>
      </Section>

      {/* ---- Industries */}
      <Section tone="muted" id="industries">
        <SectionHeading eyebrow={home.industries.eyebrow} title={home.industries.title} sub={home.industries.sub} />
        <div className="mt-12">
          <IndustryCards lang={lang} />
        </div>
      </Section>

      {/* ---- Pricing */}
      <Section id="pricing">
        <SectionHeading eyebrow={home.pricing.eyebrow} title={home.pricing.title} sub={home.pricing.sub} />
        <div className="mt-14">
          <PricingCards lang={lang} />
        </div>
        <div className="mt-8 flex justify-center">
          <Link href={sitePath(lang, "/pricing")} className="group flex h-11 items-center gap-2 rounded-lg px-3 text-[15px] font-semibold text-primary hover:bg-accent">
            {home.pricing.link}
            <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5 rtl:rotate-180 rtl:group-hover:-translate-x-0.5" />
          </Link>
        </div>
      </Section>

      {/* ---- FAQ */}
      <Section tone="muted" id="faq">
        <SectionHeading eyebrow={home.faq.eyebrow} title={home.faq.title} sub={home.faq.sub} />
        <div className="mt-12">
          <FaqList items={home.faq.items} />
        </div>
      </Section>

      <CtaBand lang={lang} />
    </SiteShell>
  );
}

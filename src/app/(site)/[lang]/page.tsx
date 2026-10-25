import type { Metadata } from "next";
import { JsonLd } from "@/components/site/json-ld";
import { HeadlineStroke, HeroStage, PlatformMarquee } from "@/components/site/hero";
import { FeatureList, FeatureRows, StepsTimeline } from "@/components/site/home-sections";
import {
  ArrowLink,
  ContactSection,
  CtaBand,
  FaqList,
  HandoverSection,
  IncludedInEveryPlan,
  IndustryShowcase,
  PricingCards,
  Section,
  SectionHeading,
} from "@/components/site/sections";
import { CtaLink, SiteShell } from "@/components/site/shell";
import { getSiteContent, SITE_PLANS } from "@/content/site";
import { APP_NAME, CONTACT_EMAIL, SITE_URL, SITE_WIDGET_KEY } from "@/lib/config";
import { sitePath, type SiteLang } from "@/lib/site-routes";
import { appLink, faqJsonLd, siteMetadata, siteUrl, softwareJsonLd } from "@/lib/site-seo";
import { SOCIAL_PROFILES } from "@/lib/social";

const asLang = (lang: string): SiteLang => (lang === "ar" ? "ar" : "en");

export async function generateMetadata({ params }: PageProps<"/[lang]">): Promise<Metadata> {
  const lang = asLang((await params).lang);
  return siteMetadata(lang, "", getSiteContent(lang).home.meta);
}

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
      areaServed: "Worldwide",
      sameAs: SOCIAL_PROFILES,
      ...(CONTACT_EMAIL && {
        email: CONTACT_EMAIL,
        contactPoint: { "@type": "ContactPoint", contactType: "customer support", email: CONTACT_EMAIL, availableLanguage: ["English", "Arabic"] },
      }),
    },
    { "@context": "https://schema.org", "@type": "WebSite", name: APP_NAME, url: siteUrl(lang, ""), inLanguage: lang },
    softwareJsonLd(lang, home.meta.description, SITE_PLANS.map((plan) => ({ name: t.pricingPage.plans[plan.id].name, price: plan.price }))),
    faqJsonLd(home.faq.items),
  ];

  return (
    <SiteShell lang={lang} page="">
      {structuredData.map((data, i) => (
        <JsonLd key={i} data={data} />
      ))}

      {/* ---- Hero. On phones the words are kept compact (smaller type, buttons side by side)
          so the picture is already on screen when the page opens. */}
      <section className="site-hero relative overflow-hidden">
        <div className="mx-auto flex max-w-6xl flex-col items-center px-4 pt-7 text-center sm:px-6 sm:pt-16">
          <h1 className="max-w-4xl text-[2rem] leading-[1.08] font-bold tracking-tight text-balance sm:text-6xl sm:leading-[1.05] lg:text-[4.25rem]">
            {home.h1[0]}
            <span className="relative inline-block text-primary sm:whitespace-nowrap">
              {home.h1[1]}
              <HeadlineStroke />
            </span>
            {home.h1[2]}
          </h1>
          <p className="mt-4 max-w-2xl text-[15px] leading-relaxed text-pretty text-muted-foreground sm:mt-6 sm:text-xl">{home.sub}</p>
          <div className="mt-5 flex w-full max-w-md gap-2.5 sm:mt-8 sm:max-w-none sm:justify-center sm:gap-3">
            <CtaLink href={appLink("/signup")} size="lg" arrow className="max-sm:h-12 max-sm:flex-1 max-sm:px-3 max-sm:text-[15px] sm:min-w-64">
              {home.ctaPrimary}
            </CtaLink>
            {/* With the site's own assistant on the page, the best demo is trying it. */}
            <CtaLink href="#how-it-works" variant="outline" size="lg" opensChat={Boolean(SITE_WIDGET_KEY)} className="max-sm:h-12 max-sm:flex-1 max-sm:px-3 max-sm:text-[15px]">
              {SITE_WIDGET_KEY ? home.ctaTry : home.ctaSecondary}
            </CtaLink>
          </div>
          <p className="mt-3 text-sm font-medium text-muted-foreground sm:mt-4">{home.ctaNote}</p>
          <HeroStage home={home} />
        </div>

        {/* the website builders it plugs into, scrolling past under the picture */}
        <PlatformMarquee label={home.worksWith} />
      </section>

      {/* ---- How it works */}
      <Section tone="muted" id="how-it-works">
        <SectionHeading title={home.steps.title} sub={home.steps.sub} />
        <div className="mt-12 sm:mt-16">
          <StepsTimeline steps={home.steps} />
        </div>
        <div className="mt-10 flex justify-center sm:mt-14">
          <CtaLink href={appLink("/signup")} size="lg" arrow className="w-full sm:w-auto">
            {home.ctaPrimary}
          </CtaLink>
        </div>
      </Section>

      {/* ---- What you get: four large rows, then the rest as a list */}
      <Section id="features">
        <SectionHeading title={home.features.title} sub={home.features.sub} />
        <div className="mt-12 sm:mt-20">
          <FeatureRows home={home} />
        </div>
        <div className="mt-16 border-t border-border pt-12 sm:mt-24 sm:pt-16">
          <FeatureList home={home} keys={["products", "inbox", "insights", "security"]} />
        </div>
        <div className="mt-10 flex justify-center">
          <CtaLink href={sitePath(lang, "/features")} variant="dark" arrow>
            {home.features.more}
          </CtaLink>
        </div>
      </Section>

      {/* ---- AI and people, together */}
      <HandoverSection lang={lang} />

      {/* ---- Industries */}
      <Section id="industries">
        <SectionHeading title={home.industries.title} sub={home.industries.sub} />
        <div className="mt-10 sm:mt-12">
          <IndustryShowcase lang={lang} />
        </div>
      </Section>

      {/* ---- Pricing */}
      <Section tone="muted" id="pricing">
        <SectionHeading title={home.pricing.title} sub={home.pricing.sub} />
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
        <SectionHeading title={home.faq.title} sub={home.faq.sub} />
        <div className="mt-12">
          <FaqList items={home.faq.items} />
        </div>
      </Section>

      {/* ---- Contact */}
      <ContactSection lang={lang} tone="muted" />

      <CtaBand lang={lang} />
    </SiteShell>
  );
}

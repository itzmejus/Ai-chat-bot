import type { Metadata } from "next";
import { FEATURE_ART } from "@/components/site/art";
import { JsonLd } from "@/components/site/json-ld";
import { TickList } from "@/components/site/mockups";
import { CtaBand, PageHero, Section } from "@/components/site/sections";
import { CtaLink, SiteShell } from "@/components/site/shell";
import { getSiteContent } from "@/content/site";
import type { SiteLang } from "@/lib/site-routes";
import { appLink, breadcrumbJsonLd, siteMetadata } from "@/lib/site-seo";
import { cn } from "@/lib/utils";

const PAGE = "/features";
const asLang = (lang: string): SiteLang => (lang === "ar" ? "ar" : "en");

export async function generateMetadata({ params }: PageProps<"/[lang]/features">): Promise<Metadata> {
  const lang = asLang((await params).lang);
  return siteMetadata(lang, PAGE, getSiteContent(lang).featuresPage.meta);
}

export default async function FeaturesPage({ params }: PageProps<"/[lang]/features">) {
  const lang = asLang((await params).lang);
  const t = getSiteContent(lang);
  const page = t.featuresPage;

  return (
    <SiteShell lang={lang} page={PAGE}>
      <JsonLd data={breadcrumbJsonLd(lang, t.breadcrumbHome, [{ name: t.nav.features, page: PAGE }])} />

      <PageHero eyebrow={page.eyebrow} title={page.h1} sub={page.sub}>
        <CtaLink href={appLink("/signup")} size="lg" arrow>
          {t.nav.start}
        </CtaLink>
      </PageHero>

      <Section>
        <div className="grid gap-5 md:grid-cols-2">
          {page.groups.map((group) => {
            const Art = FEATURE_ART[group.key];
            return (
              <article key={group.key} id={group.key} className="flex scroll-mt-24 flex-col gap-5 rounded-3xl border border-border/80 bg-white p-6 sm:p-7">
                <Art className="-ms-1" />
                <div className="flex flex-col gap-2">
                  <h2 className="text-2xl font-bold tracking-tight">{group.title}</h2>
                  <p className="text-[15px] leading-relaxed text-muted-foreground">{group.text}</p>
                </div>
                <TickList items={group.points} />
              </article>
            );
          })}
        </div>
      </Section>

      <Section tone="muted">
        <div className="mx-auto flex max-w-3xl flex-col gap-6">
          <div className="flex flex-col gap-2 text-center">
            <h2 className="text-3xl font-bold tracking-tight">{page.channels.title}</h2>
            <p className="text-lg text-muted-foreground">{page.channels.text}</p>
          </div>
          <ul className="flex flex-col gap-3">
            {page.channels.items.map((channel) => (
              <li key={channel.name} className="flex items-center justify-between gap-4 rounded-2xl border border-border/80 bg-white px-5 py-4">
                <span className="text-base font-semibold">{channel.name}</span>
                <span className={cn("rounded-full px-3 py-1 text-xs font-semibold", channel.live ? "bg-[#e7f8ee] text-success" : "bg-muted text-muted-foreground")}>
                  {channel.live ? page.channels.live : page.channels.soon}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </Section>

      <CtaBand lang={lang} />
    </SiteShell>
  );
}

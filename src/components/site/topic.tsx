import { ArrowRight, ChevronRight } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { JsonLd } from "@/components/site/json-ld";
import { CardImage, PageFigure, pageImage } from "@/components/site/page-image";
import { ContactSection, CtaBand, Eyebrow, FaqList, PageHero, Section, SectionHeading } from "@/components/site/sections";
import { CtaLink, SiteShell } from "@/components/site/shell";
import { getSiteContent, type SiteContent, type TopicPage } from "@/content/site";
import { APP_NAME, SITE_URL, WIDGET_URL } from "@/lib/config";
import { LinkList } from "@/components/site/link-list";
import { platformIndustryLinks } from "@/content/site/local/pages";
import { SITE_UPDATED, sitePath, TOPIC_GROUPS, type IntegrationSlug, type SiteLang, type TopicGroup } from "@/lib/site-routes";
import { appLink, breadcrumbJsonLd, faqJsonLd, siteMetadata, siteUrl } from "@/lib/site-seo";

/**
 * The search-focused pages: setup instructions per website builder, use cases, and blog
 * articles. All three groups share this file: one hub page listing the group, and one
 * page per entry. Everything is rendered on the server, so each address returns a complete
 * HTML page with all of its text, which is what search engines index.
 */

const asLang = (lang: string): SiteLang => (lang === "ar" ? "ar" : "en");

const pagesOf = (t: SiteContent, group: TopicGroup) => t.topics[group] as Record<string, TopicPage>;

function find(lang: SiteLang, group: TopicGroup, slug: string) {
  const t = getSiteContent(lang);
  const topic = (TOPIC_GROUPS[group].slugs as readonly string[]).includes(slug) ? pagesOf(t, group)[slug] : undefined;
  return { t, topic, page: `${TOPIC_GROUPS[group].base}/${slug}` };
}

// ---------------------------------------------------------------- metadata, used by the route files

export function hubMetadata(lang: string, group: TopicGroup): Metadata {
  const l = asLang(lang);
  return siteMetadata(l, TOPIC_GROUPS[group].base, getSiteContent(l).topics.hubs[group].meta);
}

export function topicMetadata(lang: string, group: TopicGroup, slug: string): Metadata {
  const l = asLang(lang);
  const { topic, page } = find(l, group, slug);
  if (!topic) return {};
  const image = pageImage(page);
  return siteMetadata(l, page, topic.meta, image ? { url: image.og, alt: image.alt[l] } : undefined);
}

// ---------------------------------------------------------------- shared pieces

/** "Home > Blog > Article": links for visitors, and the same trail as structured data. */
export function Breadcrumbs({ lang, trail }: { lang: SiteLang; trail: { name: string; page: string }[] }) {
  const t = getSiteContent(lang);
  const items = [{ name: t.breadcrumbHome, page: "" }, ...trail];
  return (
    <nav aria-label="Breadcrumb" className="mx-auto w-full max-w-6xl px-4 pt-5 sm:px-6">
      <ol className="flex flex-wrap items-center gap-1.5 text-sm text-muted-foreground">
        {items.map((item, i) => (
          <li key={item.page} className="flex min-w-0 items-center gap-1.5">
            {i > 0 && <ChevronRight className="size-3.5 shrink-0 rtl:rotate-180" />}
            {i === items.length - 1 ? (
              <span aria-current="page" className="truncate font-medium text-foreground">
                {item.name}
              </span>
            ) : (
              <Link href={sitePath(lang, item.page)} className="hover:text-foreground hover:underline">
                {item.name}
              </Link>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}

/** How many related pages an entry links to: its neighbours in the group, so every page is linked from several others. */
const RELATED = 6;

/** The pages after `slug` in its group, wrapping round to the start. */
function neighbours(slugs: readonly string[], slug: string) {
  const at = slugs.indexOf(slug);
  return Array.from({ length: Math.min(RELATED, slugs.length - 1) }, (_, i) => slugs[(at + 1 + i) % slugs.length]);
}

/** Cards linking to the pages of a group: all of them, or the pages related to `relatedTo`. */
function TopicCards({ lang, group, relatedTo }: { lang: SiteLang; group: TopicGroup; relatedTo?: string }) {
  const t = getSiteContent(lang);
  const { base, slugs } = TOPIC_GROUPS[group];
  return (
    <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {(relatedTo ? neighbours(slugs, relatedTo) : slugs).map((slug) => {
          const topic = pagesOf(t, group)[slug];
          return (
            <li key={slug}>
              <Link
                href={sitePath(lang, `${base}/${slug}`)}
                className="group flex h-full flex-col gap-2.5 rounded-3xl border border-border/80 bg-white p-6 transition-[box-shadow,translate,border-color] hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-[0_18px_40px_-24px_rgb(220_38_38/0.5)]"
              >
                <CardImage lang={lang} page={`${base}/${slug}`} className="mb-2" />
                <h3 className="text-lg leading-snug font-semibold text-balance">{topic.name}</h3>
                <p className="text-[15px] leading-relaxed text-muted-foreground">{topic.short}</p>
                <span className="mt-auto flex items-center gap-1.5 pt-2 text-sm font-semibold text-primary">
                  {t.topics.labels.readMore}
                  <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5 rtl:rotate-180 rtl:group-hover:-translate-x-0.5" />
                </span>
              </Link>
            </li>
          );
        })}
    </ul>
  );
}

// ---------------------------------------------------------------- hub page

/** The list page of a group: /integrations, /use-cases or /blog. */
export function TopicHub({ lang: rawLang, group }: { lang: string; group: TopicGroup }) {
  const lang = asLang(rawLang);
  const t = getSiteContent(lang);
  const hub = t.topics.hubs[group];
  const { base, slugs } = TOPIC_GROUPS[group];

  return (
    <SiteShell lang={lang} page={base}>
      <JsonLd data={breadcrumbJsonLd(lang, t.breadcrumbHome, [{ name: t.topics.labels[group], page: base }])} />
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "ItemList",
          itemListElement: slugs.map((slug, i) => ({ "@type": "ListItem", position: i + 1, name: pagesOf(t, group)[slug].name, url: siteUrl(lang, `${base}/${slug}`) })),
        }}
      />
      <PageHero eyebrow={t.topics.labels[group]} title={hub.h1} sub={hub.sub} />
      <Section>
        <TopicCards lang={lang} group={group} />
      </Section>
      <CtaBand lang={lang} />
    </SiteShell>
  );
}

// ---------------------------------------------------------------- one page

/** A setup page, a use-case page or a blog article. */
export function TopicPageView({ lang: rawLang, group, slug }: { lang: string; group: TopicGroup; slug: string }) {
  const lang = asLang(rawLang);
  const { t, topic, page } = find(lang, group, slug);
  if (!topic) notFound();

  const labels = t.topics.labels;
  const base = TOPIC_GROUPS[group].base;
  const article = group === "guides";
  const embedCode = `<script src="${WIDGET_URL}/widget.js" data-workspace="pk_..." async></script>`;
  const image = pageImage(page);

  return (
    <SiteShell lang={lang} page={page}>
      <JsonLd
        data={breadcrumbJsonLd(lang, t.breadcrumbHome, [
          { name: labels[group], page: base },
          { name: topic.name, page },
        ])}
      />
      <JsonLd data={faqJsonLd(topic.faq)} />
      {article && (
        <JsonLd
          data={{
            "@context": "https://schema.org",
            "@type": "Article",
            headline: topic.h1,
            description: topic.meta.description,
            inLanguage: lang,
            datePublished: SITE_UPDATED,
            dateModified: SITE_UPDATED,
            mainEntityOfPage: siteUrl(lang, page),
            image: image ? `${SITE_URL}${image.og}` : `${SITE_URL}/opengraph-image`,
            author: { "@type": "Organization", name: APP_NAME, url: SITE_URL },
            publisher: { "@type": "Organization", name: APP_NAME, url: SITE_URL, logo: { "@type": "ImageObject", url: `${SITE_URL}/apple-icon.png` } },
          }}
        />
      )}

      <div className="site-hero border-b border-border/60">
        <Breadcrumbs
          lang={lang}
          trail={[
            { name: labels[group], page: base },
            { name: topic.name, page },
          ]}
        />
        <header className="mx-auto flex max-w-3xl flex-col items-start gap-5 px-4 pt-8 pb-12 sm:px-6 sm:pt-12 sm:pb-16">
          <Eyebrow>{labels[group]}</Eyebrow>
          <h1 className="text-[2rem] leading-[1.1] font-bold tracking-tight text-balance sm:text-5xl">{topic.h1}</h1>
          <p className="text-lg leading-relaxed text-pretty text-muted-foreground sm:text-xl">{topic.sub}</p>
          {article ? (
            <p className="text-sm text-muted-foreground">
              <time dateTime={SITE_UPDATED}>{labels.updated}</time>
            </p>
          ) : (
            <CtaLink href={appLink("/signup")} size="lg" arrow className="max-sm:w-full">
              {labels.cta}
            </CtaLink>
          )}
        </header>
      </div>

      <article className="mx-auto flex max-w-3xl flex-col gap-10 px-4 py-12 sm:px-6 sm:py-16">
        <PageFigure lang={lang} page={page} />
        <div className="flex flex-col gap-4">
          {topic.intro.map((paragraph) => (
            <p key={paragraph} className="text-lg leading-relaxed text-foreground/85">
              {paragraph}
            </p>
          ))}
        </div>

        {topic.steps && (
          <section className="flex flex-col gap-5">
            <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">{labels.steps}</h2>
            <ol className="flex flex-col gap-3">
              {topic.steps.map((step, i) => (
                <li key={step.title} className="flex gap-4 rounded-3xl border border-border/80 bg-white p-5 sm:p-6">
                  <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-foreground text-sm font-bold text-white">{i + 1}</span>
                  <div className="flex min-w-0 flex-col gap-1.5">
                    <h3 className="text-lg font-semibold">{step.title}</h3>
                    <p className="text-[15px] leading-relaxed text-muted-foreground">{step.text}</p>
                    {/* The line of code itself, where the steps say to copy it. */}
                    {i === 2 && (
                      <pre dir="ltr" className="mt-2 overflow-x-auto rounded-2xl bg-foreground p-4 text-start text-[13px] leading-relaxed text-white">
                        <code>{embedCode}</code>
                      </pre>
                    )}
                  </div>
                </li>
              ))}
            </ol>
          </section>
        )}

        {topic.points && (
          <section className="flex flex-col gap-5">
            <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">{labels.why}</h2>
            <ul className="grid gap-3 sm:grid-cols-2">
              {topic.points.map((point) => (
                <li key={point.title} className="flex flex-col gap-1.5 rounded-3xl bg-muted p-5 sm:p-6">
                  <h3 className="text-lg font-semibold">{point.title}</h3>
                  <p className="text-[15px] leading-relaxed text-muted-foreground">{point.text}</p>
                </li>
              ))}
            </ul>
          </section>
        )}

        {topic.sections?.map((section) => (
          <section key={section.h} className="flex flex-col gap-3">
            <h2 className="text-2xl font-bold tracking-tight">{section.h}</h2>
            {section.p.map((paragraph) => (
              <p key={paragraph} className="text-[17px] leading-relaxed text-foreground/85">
                {paragraph}
              </p>
            ))}
          </section>
        ))}

        {article && (
          <CtaLink href={appLink("/signup")} size="lg" arrow className="self-start max-sm:w-full">
            {labels.cta}
          </CtaLink>
        )}
      </article>

      <Section tone="muted">
        <SectionHeading title={labels.questions} />
        <div className="mt-10">
          <FaqList items={topic.faq} />
        </div>
      </Section>

      {/* A setup page per industry for this website builder (English only, like those pages) */}
      {group === "integrations" && lang === "en" && (
        <Section>
          <SectionHeading title={`${topic.name} for your industry`} />
          <div className="mt-10">
            <LinkList links={platformIndustryLinks(slug as IntegrationSlug)} />
          </div>
        </Section>
      )}

      <Section>
        <SectionHeading title={labels.related} />
        <div className="mt-10">
          <TopicCards lang={lang} group={group} relatedTo={slug} />
        </div>
      </Section>

      <CtaBand lang={lang} />
    </SiteShell>
  );
}

// ---------------------------------------------------------------- FAQ page

/** Every question from the home and pricing pages on one address. */
export function FaqPageView({ lang: rawLang }: { lang: string }) {
  const lang = asLang(rawLang);
  const t = getSiteContent(lang);
  const hub = t.topics.hubs.faq;
  const groups = [
    { title: t.home.faq.title, items: t.home.faq.items },
    { title: t.pricingPage.faq.title, items: t.pricingPage.faq.items },
  ];

  return (
    <SiteShell lang={lang} page="/faq">
      <JsonLd data={breadcrumbJsonLd(lang, t.breadcrumbHome, [{ name: t.topics.labels.faq, page: "/faq" }])} />
      <JsonLd data={faqJsonLd(groups.flatMap((group) => group.items))} />
      <PageHero eyebrow={t.topics.labels.faq} title={hub.h1} sub={hub.sub} />
      {groups.map((group, i) => (
        <Section key={group.title} tone={i % 2 === 1 ? "muted" : "white"}>
          <SectionHeading title={group.title} />
          <div className="mt-10">
            <FaqList items={group.items} />
          </div>
        </Section>
      ))}
      <ContactSection lang={lang} />
      <CtaBand lang={lang} />
    </SiteShell>
  );
}

export function faqMetadata(lang: string): Metadata {
  const l = asLang(lang);
  return siteMetadata(l, "/faq", getSiteContent(l).topics.hubs.faq.meta);
}

import type { Metadata } from "next";
import Link from "next/link";
import { JsonLd } from "@/components/site/json-ld";
import { LinkList } from "@/components/site/link-list";
import { Bubble } from "@/components/site/mockups";
import { CtaBand, Eyebrow, FaqList, Section, SectionHeading } from "@/components/site/sections";
import { CtaLink, SiteShell } from "@/components/site/shell";
import { Breadcrumbs } from "@/components/site/topic";
import { getSiteContent } from "@/content/site";
import type { LocalPage } from "@/content/site/local/pages";
import { APP_NAME, SITE_URL, WIDGET_URL } from "@/lib/config";
import { sitePath } from "@/lib/site-routes";
import { appLink, breadcrumbJsonLd, faqJsonLd, siteMetadata, siteUrl } from "@/lib/site-seo";

/**
 * One local page (city, industry in a city, website builder for an industry), English only.
 * Server-rendered like the rest of the site, so each address returns its full text.
 */

export const localMetadata = (page: LocalPage): Metadata => siteMetadata("en", page.page, page.meta, undefined, { englishOnly: true });

export function LocalPageView({ data }: { data: LocalPage }) {
  const t = getSiteContent("en");
  const embedCode = `<script src="${WIDGET_URL}/widget.js" data-workspace="pk_..." async></script>`;

  return (
    <SiteShell lang="en" page={data.page}>
      <JsonLd data={breadcrumbJsonLd("en", t.breadcrumbHome, data.trail)} />
      <JsonLd data={faqJsonLd(data.faq)} />
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "Service",
          name: data.meta.title,
          description: data.meta.description,
          serviceType: "AI customer support chatbot",
          url: siteUrl("en", data.page),
          inLanguage: "en",
          provider: { "@type": "Organization", name: APP_NAME, url: SITE_URL },
        }}
      />

      {/* ---- Hero */}
      <div className="site-hero border-b border-border/60">
        <Breadcrumbs lang="en" trail={data.trail} />
        <div className="mx-auto grid max-w-6xl items-center gap-10 px-4 pt-8 pb-14 sm:px-6 sm:pt-12 sm:pb-20 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)]">
          <header className="flex flex-col items-start gap-5">
            <Eyebrow>{data.eyebrow}</Eyebrow>
            <h1 className="text-[2rem] leading-[1.1] font-bold tracking-tight text-balance sm:text-5xl">{data.h1}</h1>
            <p className="text-lg leading-relaxed text-pretty text-muted-foreground sm:text-xl">{data.sub}</p>
            <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
              <CtaLink href={appLink("/signup")} size="lg" arrow>
                {t.topics.labels.cta}
              </CtaLink>
              <CtaLink href={sitePath("en", "/pricing")} variant="outline" size="lg">
                {t.nav.pricing}
              </CtaLink>
            </div>
          </header>
          {data.chat && (
            <div aria-hidden className="mx-auto flex w-full max-w-md flex-col gap-3 rounded-3xl bg-[#f4f4f6] p-5 shadow-[0_32px_64px_-28px_rgb(27_27_32/0.45)] ring-1 ring-black/5">
              {data.chat.map((line, i) => (
                <span key={i} className="flex flex-col">
                  <Bubble line={line} />
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      <article className="mx-auto flex max-w-3xl flex-col gap-12 px-4 py-12 sm:px-6 sm:py-16">
        <div className="flex flex-col gap-4">
          {data.intro.map((paragraph) => (
            <p key={paragraph} className="text-lg leading-relaxed text-foreground/85">
              {paragraph}
            </p>
          ))}
        </div>

        {data.questions && (
          <section className="flex flex-col gap-5">
            <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">{data.questions.title}</h2>
            <ul className="flex flex-wrap gap-2.5">
              {data.questions.items.map((question) => (
                <li key={question} dir="auto" className="flex items-center gap-2.5 rounded-full border border-border bg-white px-4 py-2 text-[15px] font-medium">
                  <span className="size-2 shrink-0 rounded-full bg-primary" />
                  {question}
                </li>
              ))}
            </ul>
          </section>
        )}

        {data.points && (
          <section className="flex flex-col gap-5">
            <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">{data.points.title}</h2>
            <ul className="grid gap-3 sm:grid-cols-3">
              {data.points.items.map((point) => (
                <li key={point.title} className="flex flex-col gap-1.5 rounded-3xl bg-muted p-5">
                  <h3 className="text-lg font-semibold">{point.title}</h3>
                  <p className="text-[15px] leading-relaxed text-muted-foreground">{point.text}</p>
                </li>
              ))}
            </ul>
          </section>
        )}

        {data.sections.map((section) => (
          <section key={section.h} className="flex flex-col gap-3">
            <h2 className="text-2xl font-bold tracking-tight">{section.h}</h2>
            {section.p.map((paragraph) => (
              <p key={paragraph} className="text-[17px] leading-relaxed text-foreground/85">
                {paragraph}
              </p>
            ))}
          </section>
        ))}

        {data.steps && (
          <section className="flex flex-col gap-5">
            <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">{data.steps.title}</h2>
            <ol className="flex flex-col gap-3">
              {data.steps.items.map((step, i) => (
                <li key={step.title} className="flex gap-4 rounded-3xl border border-border/80 bg-white p-5 sm:p-6">
                  <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-foreground text-sm font-bold text-white">{i + 1}</span>
                  <div className="flex min-w-0 flex-col gap-1.5">
                    <h3 className="text-lg font-semibold">{step.title}</h3>
                    <p className="text-[15px] leading-relaxed text-muted-foreground">{step.text}</p>
                    {i === data.steps!.codeAt && (
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
      </article>

      {data.cards && (
        <Section tone="muted">
          <SectionHeading title={data.cards.title} />
          <ul className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {data.cards.links.map((card) => (
              <li key={card.page}>
                <Link
                  href={sitePath("en", card.page)}
                  className="group flex h-full flex-col gap-2 rounded-3xl border border-border/80 bg-white p-6 transition-[box-shadow,translate,border-color] hover:-translate-y-0.5 hover:border-primary/40"
                >
                  <h3 className="text-lg font-semibold">{card.label}</h3>
                  {card.hint && <p className="text-[15px] leading-relaxed text-muted-foreground">{card.hint}</p>}
                </Link>
              </li>
            ))}
          </ul>
        </Section>
      )}

      <Section tone={data.cards ? "white" : "muted"}>
        <SectionHeading title={t.topics.labels.questions} />
        <div className="mt-10">
          <FaqList items={data.faq} />
        </div>
      </Section>

      <Section tone={data.cards ? "muted" : "white"}>
        <div className="flex flex-col gap-10">
          {data.links.map((group) => (
            <nav key={group.title} aria-label={group.title} className="flex flex-col gap-4">
              <h2 className="text-xl font-bold tracking-tight">{group.title}</h2>
              <LinkList links={group.links} />
            </nav>
          ))}
        </div>
      </Section>

      <CtaBand lang="en" />
    </SiteShell>
  );
}

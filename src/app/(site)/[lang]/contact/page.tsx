import { Handshake, LifeBuoy, Mail, Tag, type LucideIcon } from "lucide-react";
import type { Metadata } from "next";
import { JsonLd } from "@/components/site/json-ld";
import { ArrowLink, CtaBand, PageHero, Section, SectionHeading } from "@/components/site/sections";
import { CtaLink, SiteShell } from "@/components/site/shell";
import { getSiteContent } from "@/content/site";
import { APP_NAME, CONTACT_EMAIL, SITE_URL } from "@/lib/config";
import { sitePath, type SiteLang } from "@/lib/site-routes";
import { breadcrumbJsonLd, siteMetadata, siteUrl } from "@/lib/site-seo";

const PAGE = "/contact";
const asLang = (lang: string): SiteLang => (lang === "ar" ? "ar" : "en");

/** One icon per reason, in the order of contactPage.reasons. */
const REASON_ICONS: LucideIcon[] = [Tag, LifeBuoy, Handshake];

const mailto = (subject?: string) => `mailto:${CONTACT_EMAIL}${subject ? `?subject=${encodeURIComponent(subject)}` : ""}`;

export async function generateMetadata({ params }: PageProps<"/[lang]/contact">): Promise<Metadata> {
  const lang = asLang((await params).lang);
  return siteMetadata(lang, PAGE, getSiteContent(lang).contactPage.meta);
}

export default async function ContactPage({ params }: PageProps<"/[lang]/contact">) {
  const lang = asLang((await params).lang);
  const t = getSiteContent(lang);
  const page = t.contactPage;

  return (
    <SiteShell lang={lang} page={PAGE}>
      <JsonLd data={breadcrumbJsonLd(lang, t.breadcrumbHome, [{ name: t.footer.contact, page: PAGE }])} />
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "ContactPage",
          name: page.meta.title,
          url: siteUrl(lang, PAGE),
          inLanguage: lang,
          about: {
            "@type": "Organization",
            name: APP_NAME,
            url: SITE_URL,
            email: CONTACT_EMAIL,
            contactPoint: { "@type": "ContactPoint", contactType: "customer support", email: CONTACT_EMAIL, availableLanguage: ["English", "Arabic"] },
          },
        }}
      />

      <PageHero eyebrow={t.contact.eyebrow} title={page.h1} sub={page.sub}>
        <div className="flex w-full flex-col items-center gap-4">
          <a href={mailto()} dir="ltr" className="flex items-center gap-3 text-xl font-semibold break-all text-foreground hover:text-primary sm:text-2xl">
            <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-accent text-primary">
              <Mail className="size-5" />
            </span>
            {CONTACT_EMAIL}
          </a>
          <CtaLink href={mailto()} size="lg" arrow className="w-full sm:w-auto">
            {t.contact.button}
          </CtaLink>
        </div>
      </PageHero>

      <Section>
        <SectionHeading title={page.reasonsTitle} />
        <div className="mt-10 grid gap-4 sm:mt-12 md:grid-cols-3">
          {page.reasons.map((reason, i) => {
            const Icon = REASON_ICONS[i] ?? Mail;
            return (
              <a
                key={reason.title}
                href={mailto(reason.subject)}
                className="group flex flex-col gap-3 rounded-2xl border border-border/80 bg-white p-6 transition-shadow hover:shadow-[0_12px_30px_-20px_rgb(27_27_32/0.35)]"
              >
                <span className="grid size-11 place-items-center rounded-xl bg-accent text-primary">
                  <Icon className="size-5" />
                </span>
                <h3 className="text-lg font-semibold">{reason.title}</h3>
                <p className="flex-1 text-[15px] leading-relaxed text-muted-foreground">{reason.text}</p>
                <span className="text-[15px] font-semibold text-primary group-hover:underline">{t.contact.button}</span>
              </a>
            );
          })}
        </div>
      </Section>

      <Section tone="muted">
        <SectionHeading title={page.selfServe.title} sub={page.selfServe.sub} />
        <div className="mt-8 flex flex-wrap justify-center gap-2">
          <ArrowLink href={sitePath(lang, "/faq")}>{t.topics.labels.faq}</ArrowLink>
          <ArrowLink href={sitePath(lang, "/integrations")}>{t.topics.labels.integrations}</ArrowLink>
          <ArrowLink href={sitePath(lang, "/pricing")}>{t.nav.pricing}</ArrowLink>
        </div>
      </Section>

      <CtaBand lang={lang} />
    </SiteShell>
  );
}

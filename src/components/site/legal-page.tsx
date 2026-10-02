import { JsonLd } from "@/components/site/json-ld";
import { SiteShell } from "@/components/site/shell";
import { getSiteContent } from "@/content/site";
import { CONTACT_EMAIL } from "@/lib/config";
import type { SiteLang } from "@/lib/site-routes";
import { breadcrumbJsonLd } from "@/lib/site-seo";

/** Privacy policy and terms of service share one plain, readable layout. */
export function LegalPage({ lang, kind }: { lang: SiteLang; kind: "privacy" | "terms" }) {
  const t = getSiteContent(lang);
  const doc = t.legal[kind];
  const page = `/${kind}`;

  return (
    <SiteShell lang={lang} page={page}>
      <JsonLd data={breadcrumbJsonLd(lang, t.breadcrumbHome, [{ name: doc.title, page }])} />
      <article className="mx-auto flex max-w-3xl flex-col gap-8 px-4 py-14 sm:px-6 sm:py-20">
        <header className="flex flex-col gap-3 border-b border-border pb-8">
          <h1 className="text-4xl font-bold tracking-tight">{doc.title}</h1>
          <p className="text-sm text-muted-foreground">{t.legal.updated}</p>
          <p className="text-lg leading-relaxed text-muted-foreground">{doc.intro}</p>
        </header>
        {doc.sections.map((section) => (
          <section key={section.h} className="flex flex-col gap-3">
            <h2 className="text-xl font-semibold">{section.h}</h2>
            {section.p.map((paragraph) => (
              <p key={paragraph} className="text-base leading-relaxed text-foreground/80">
                {paragraph}
              </p>
            ))}
          </section>
        ))}
        {CONTACT_EMAIL && (
          <p className="rounded-2xl bg-muted p-5 text-base">
            {t.footer.contact}:{" "}
            <a href={`mailto:${CONTACT_EMAIL}`} dir="ltr" className="font-semibold text-primary">
              {CONTACT_EMAIL}
            </a>
          </p>
        )}
      </article>
    </SiteShell>
  );
}

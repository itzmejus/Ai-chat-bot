import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { JsonLd } from "@/components/site/json-ld";
import { LinkList } from "@/components/site/link-list";
import { CtaBand, PageHero, Section, SectionHeading } from "@/components/site/sections";
import { SiteShell } from "@/components/site/shell";
import { getSiteContent } from "@/content/site";
import { citiesByRegion, LOCATIONS_META } from "@/content/site/local/pages";
import { INDUSTRY_SLUGS, sitePath } from "@/lib/site-routes";
import { breadcrumbJsonLd, siteMetadata } from "@/lib/site-seo";

const PAGE = "/locations";

export async function generateMetadata({ params }: PageProps<"/[lang]/locations">): Promise<Metadata> {
  return (await params).lang === "en" ? siteMetadata("en", PAGE, LOCATIONS_META, undefined, { englishOnly: true }) : {};
}

/** Every city with its own page, grouped by region. English only. */
export default async function LocationsPage({ params }: PageProps<"/[lang]/locations">) {
  if ((await params).lang !== "en") notFound();
  const t = getSiteContent("en");

  return (
    <SiteShell lang="en" page={PAGE}>
      <JsonLd data={breadcrumbJsonLd("en", t.breadcrumbHome, [{ name: "Locations", page: PAGE }])} />
      <PageHero
        eyebrow="Locations"
        title="An AI chatbot for businesses in your city"
        sub="The assistant answers customers in their own language, wherever they are. Pick your city to see how it works for local businesses, then your industry."
      />

      <Section>
        <div className="grid gap-12 md:grid-cols-2">
          {citiesByRegion().map((group) => (
            <section key={group.region} className="flex flex-col gap-4">
              <h2 className="text-xl font-bold tracking-tight">{group.name}</h2>
              <ul className="flex flex-wrap gap-2.5">
                {group.cities.map(({ slug, city }) => (
                  <li key={slug}>
                    <Link
                      href={sitePath("en", `/locations/${slug}`)}
                      className="flex rounded-full border border-border bg-white px-4 py-2 text-[15px] font-medium transition-colors hover:border-primary/40 hover:text-primary"
                    >
                      {city.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      </Section>

      <Section tone="muted">
        <SectionHeading title="Or start from your industry" />
        <div className="mt-10">
          <LinkList links={INDUSTRY_SLUGS.map((slug) => ({ page: `/industries/${slug}`, label: t.industries[slug].name }))} />
        </div>
      </Section>

      <CtaBand lang="en" />
    </SiteShell>
  );
}

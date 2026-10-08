import { getSiteContent } from "@/content/site";
import { APP_NAME } from "@/lib/config";
import { INDUSTRY_SLUGS, TOPIC_GROUPS, type TopicGroup } from "@/lib/site-routes";
import { siteUrl } from "@/lib/site-seo";

// Built per request, so the addresses use the running server's SITE_URL.
export const dynamic = "force-dynamic";

/**
 * GET /llms.txt: a plain-text summary of the site for AI assistants and AI search engines,
 * in the llms.txt convention: what the product is, then its main pages with one line each.
 */
export function GET() {
  const t = getSiteContent("en");
  const link = (name: string, page: string, note: string) => `- [${name}](${siteUrl("en", page)}): ${note}`;
  const group = (key: TopicGroup) =>
    TOPIC_GROUPS[key].slugs.map((slug) => {
      const page = (t.topics[key] as Record<string, { name: string; short: string }>)[slug];
      return link(page.name, `${TOPIC_GROUPS[key].base}/${slug}`, page.short);
    });

  const text = [
    `# ${APP_NAME}`,
    "",
    `> ${t.home.meta.description}`,
    "",
    "## Product",
    link(t.nav.features, "/features", t.featuresPage.meta.description),
    link(t.nav.pricing, "/pricing", t.pricingPage.meta.description),
    link(t.topics.labels.faq, "/faq", t.topics.hubs.faq.meta.description),
    "",
    `## ${t.topics.labels.integrations}`,
    ...group("integrations"),
    "",
    `## ${t.topics.labels.useCases}`,
    ...group("useCases"),
    "",
    `## ${t.nav.industries}`,
    ...INDUSTRY_SLUGS.map((slug) => link(t.industries[slug].name, `/industries/${slug}`, t.industries[slug].short)),
    "",
    `## ${t.topics.labels.guides}`,
    ...group("guides"),
    "",
    "## Languages",
    `- Arabic version of every page: ${siteUrl("ar", "")}`,
    "",
  ].join("\n");

  return new Response(text, { headers: { "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "public, max-age=3600" } });
}

import { describe, expect, it } from "vitest";
import { localPage, type LocalPage } from "@/content/site/local/pages";
import { CITY_SLUGS, INDUSTRY_SLUGS, INTEGRATION_SLUGS, LOCAL_PAGES, matchSitePath, SITE_PAGES } from "@/lib/site-routes";

const pages = LOCAL_PAGES.filter((page) => page !== "/locations").map((page) => localPage(page)!);
const allPages = new Set<string>([...SITE_PAGES, ...LOCAL_PAGES]);

/** All the visible text of a page, for length and placeholder checks. */
function text(page: LocalPage): string {
  return [
    page.h1,
    page.sub,
    ...page.intro,
    ...(page.questions?.items ?? []),
    ...(page.points?.items.flatMap((p) => [p.title, p.text]) ?? []),
    ...page.sections.flatMap((s) => [s.h, ...s.p]),
    ...(page.steps?.items.flatMap((s) => [s.title, s.text]) ?? []),
    ...page.faq.flatMap((f) => [f.q, f.a]),
  ].join(" ");
}
const words = (page: LocalPage) => text(page).split(/\s+/).length;

describe("local SEO pages", () => {
  it("covers every city, industry in each city and website builder for each industry", () => {
    expect(LOCAL_PAGES).toHaveLength(1 + CITY_SLUGS.length + INDUSTRY_SLUGS.length * CITY_SLUGS.length + INTEGRATION_SLUGS.length * INDUSTRY_SLUGS.length);
    expect(pages.every(Boolean)).toBe(true);
    expect(new Set(LOCAL_PAGES).size).toBe(LOCAL_PAGES.length);
  });

  it("gives every page its own title, description and heading", () => {
    for (const field of ["title", "description"] as const) {
      expect(new Set(pages.map((p) => p.meta[field])).size).toBe(pages.length);
    }
    expect(new Set(pages.map((p) => p.h1)).size).toBe(pages.length);
  });

  it("keeps titles and descriptions to what search results show", () => {
    for (const page of pages) {
      expect(page.meta.title.length, page.page).toBeLessThanOrEqual(75);
      expect(page.meta.description.length, page.page).toBeLessThanOrEqual(185);
      expect(page.meta.description.length, page.page).toBeGreaterThanOrEqual(100);
    }
  });

  it("has a real amount of text and no unfilled placeholders", () => {
    for (const page of pages) {
      expect(text(page), page.page).not.toMatch(/\{[a-z]+\}|undefined|null|NaN/);
      const minimum = page.page.startsWith("/industries/") ? 750 : 450;
      expect(words(page), page.page).toBeGreaterThanOrEqual(minimum);
      expect(page.faq.length, page.page).toBeGreaterThanOrEqual(4);
    }
  });

  it("only links to pages that exist, and to plenty of them", () => {
    for (const page of pages) {
      const links = page.links.flatMap((group) => group.links).concat(page.cards?.links ?? []);
      expect(links.length, page.page).toBeGreaterThanOrEqual(25);
      for (const link of links) expect(allPages.has(link.page), `${page.page} -> ${link.page}`).toBe(true);
      for (const crumb of page.trail) expect(allPages.has(crumb.page), `${page.page} crumb ${crumb.page}`).toBe(true);
      expect(links.some((link) => link.page === page.page), `${page.page} links to itself`).toBe(false);
    }
  });

  it("is served in English only", () => {
    expect(matchSitePath("/industries/clinics/dubai")).toEqual({ lang: "en", page: "/industries/clinics/dubai" });
    expect(matchSitePath("/integrations/wordpress/clinics")).toEqual({ lang: "en", page: "/integrations/wordpress/clinics" });
    expect(matchSitePath("/locations")).toEqual({ lang: "en", page: "/locations" });
    expect(matchSitePath("/ar/industries/clinics/dubai")).toBeNull();
    expect(matchSitePath("/ar/locations")).toBeNull();
    expect(matchSitePath("/industries/clinics/atlantis")).toBeNull();
    expect(localPage("/industries/clinics/atlantis")).toBeNull();
  });
});

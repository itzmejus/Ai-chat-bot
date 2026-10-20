import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { pageImageFiles } from "@/components/site/page-image";
import { PAGE_IMAGES } from "@/content/site/page-images";
import { INDUSTRY_SLUGS, SITE_PAGES, TOPIC_GROUPS } from "@/lib/site-routes";

const detailPages = [
  ...INDUSTRY_SLUGS.map((slug) => `/industries/${slug}`),
  ...Object.values(TOPIC_GROUPS).flatMap((group) => group.slugs.map((slug) => `${group.base}/${slug}`)),
];

describe("page pictures", () => {
  it("every industry, integration, use-case and blog page has one", () => {
    expect(detailPages.filter((page) => !PAGE_IMAGES[page])).toEqual([]);
  });

  it("only for pages that exist, with alt text in both languages", () => {
    for (const [page, entry] of Object.entries(PAGE_IMAGES)) {
      expect(SITE_PAGES, page).toContain(page);
      expect(entry.scene.length, page).toBeGreaterThan(40);
      expect(entry.alt.en.trim(), page).not.toBe("");
      expect(entry.alt.ar.trim(), page).not.toBe("");
    }
  });

  it("the generated files are in public/images/pages", () => {
    const missing = Object.keys(PAGE_IMAGES)
      .flatMap(pageImageFiles)
      .filter((file) => !fs.existsSync(path.join("public", file)));
    expect(missing).toEqual([]);
  });
});

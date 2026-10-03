import { NextRequest } from "next/server";
import { describe, expect, it } from "vitest";
import sitemap from "@/app/sitemap";
import { getSiteContent, SITE_PLANS } from "@/content/site";
import { ar } from "@/content/site/ar";
import { en } from "@/content/site/en";
import { matchSitePath, SITE_PAGES, sitePath } from "@/lib/site-routes";
import { siteMetadata, siteUrl } from "@/lib/site-seo";
import { proxy } from "@/proxy";
import { prisma } from "@/server/db/prisma";

// vitest.config.ts sets three hostnames: www.example.com (site), app.example.com, chat.example.com.
const visit = (url: string) => {
  const res = proxy(new NextRequest(url, { headers: { host: new URL(url).host } }));
  return {
    status: res.status,
    redirect: res.headers.get("location"),
    rewrite: res.headers.get("x-middleware-rewrite"),
    locale: res.headers.get("x-middleware-request-x-site-locale"),
  };
};

describe("public site addresses", () => {
  it("recognises marketing pages in both languages and nothing else", () => {
    expect(matchSitePath("/")).toEqual({ lang: "en", page: "" });
    expect(matchSitePath("/pricing")).toEqual({ lang: "en", page: "/pricing" });
    expect(matchSitePath("/pricing/")).toEqual({ lang: "en", page: "/pricing" });
    expect(matchSitePath("/ar")).toEqual({ lang: "ar", page: "" });
    expect(matchSitePath("/ar/industries/clinics")).toEqual({ lang: "ar", page: "/industries/clinics" });
    for (const path of ["/dashboard", "/login", "/en/pricing", "/arabic", "/industries/unknown", "/ar/dashboard", "/api/widget/message"]) {
      expect(matchSitePath(path), path).toBeNull();
    }
  });

  it("builds English URLs without a prefix and Arabic ones under /ar", () => {
    expect(sitePath("en", "")).toBe("/");
    expect(sitePath("ar", "")).toBe("/ar");
    expect(sitePath("en", "/pricing")).toBe("/pricing");
    expect(sitePath("ar", "/pricing")).toBe("/ar/pricing");
    expect(siteUrl("en", "")).toBe("https://www.example.com");
    expect(siteUrl("ar", "/features")).toBe("https://www.example.com/ar/features");
  });
});

describe("host routing", () => {
  it("serves marketing pages on the site host, passing the language to the page", () => {
    expect(visit("https://www.example.com/")).toMatchObject({ rewrite: "https://www.example.com/en", locale: "en" });
    expect(visit("https://www.example.com/pricing")).toMatchObject({ rewrite: "https://www.example.com/en/pricing", locale: "en" });
    expect(visit("https://www.example.com/ar/pricing")).toMatchObject({ rewrite: "https://www.example.com/ar/pricing", locale: "ar" });
  });

  it("sends the other www spelling of the site host to the configured one", () => {
    expect(visit("https://example.com/pricing")).toMatchObject({ status: 308, redirect: "https://www.example.com/pricing" });
    expect(visit("https://example.com/")).toMatchObject({ status: 308, redirect: "https://www.example.com/" });
  });

  it("does not expose the internal /en address", () => {
    expect(visit("https://www.example.com/en/pricing")).toMatchObject({ status: 308, redirect: "https://www.example.com/pricing" });
    expect(visit("https://www.example.com/en")).toMatchObject({ status: 308, redirect: "https://www.example.com/" });
  });

  it("sends app pages opened on the site host to the app, and lets crawler files through", () => {
    expect(visit("https://www.example.com/login").redirect).toBe("https://app.example.com/login");
    expect(visit("https://www.example.com/dashboard/inbox?filter=all").redirect).toBe("https://app.example.com/dashboard/inbox?filter=all");
    expect(visit("https://www.example.com/api/leads/export").status).toBe(404);
    for (const file of ["/sitemap.xml", "/robots.txt", "/opengraph-image"]) {
      expect(visit(`https://www.example.com${file}`), file).toMatchObject({ status: 200, redirect: null, rewrite: null });
    }
  });

  it("keeps the app host for the app: no marketing pages, home goes to the dashboard", () => {
    expect(visit("https://app.example.com/").redirect).toBe("https://app.example.com/dashboard");
    expect(visit("https://app.example.com/pricing")).toMatchObject({ status: 308, redirect: "https://www.example.com/pricing" });
    expect(visit("https://app.example.com/dashboard")).toMatchObject({ status: 200, redirect: null, rewrite: null });
    expect(visit("https://app.example.com/embed/pk_x").status).toBe(404);
  });

  it("keeps the widget host for the widget", () => {
    expect(visit("https://chat.example.com/widget.js").status).toBe(200);
    expect(visit("https://chat.example.com/embed/pk_x").status).toBe(200);
    expect(visit("https://chat.example.com/pricing").status).toBe(404);
    expect(visit("https://chat.example.com/dashboard").status).toBe(404);
    expect(visit("https://chat.example.com/").redirect).toBe("https://www.example.com/");
  });
});

describe("search engine files", () => {
  it("lists every page in both languages, each with its translation", () => {
    const entries = sitemap();
    expect(entries).toHaveLength(SITE_PAGES.length * 2);
    expect(new Set(entries.map((e) => e.url)).size).toBe(entries.length);
    const arabicPricing = entries.find((e) => e.url === "https://www.example.com/ar/pricing");
    expect(arabicPricing?.alternates?.languages).toEqual({ en: "https://www.example.com/pricing", ar: "https://www.example.com/ar/pricing" });
  });

  it("gives each page a canonical address, language alternates and allows indexing", () => {
    const meta = siteMetadata("ar", "/pricing", { title: "T", description: "D" });
    expect(meta.alternates).toEqual({
      canonical: "https://www.example.com/ar/pricing",
      languages: { en: "https://www.example.com/pricing", ar: "https://www.example.com/ar/pricing", "x-default": "https://www.example.com/pricing" },
    });
    expect(meta.robots).toEqual({ index: true, follow: true });
    expect(siteMetadata("en", "", { title: "Home title", description: "D" }).title).toEqual({ absolute: "Home title" });
  });
});

/** The same keys, and lists of the same length, all the way down. */
function shape(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(shape);
  if (value && typeof value === "object") return Object.fromEntries(Object.entries(value).map(([k, v]) => [k, shape(v)]));
  return typeof value;
}

describe("site content", () => {
  it("has the same structure in English and Arabic", () => {
    expect(shape(ar)).toEqual(shape(en));
  });

  it("writes Arabic pages in Arabic and fills in the product name", () => {
    expect(ar.home.h1.join("")).toMatch(/[؀-ۿ]/);
    expect(en.home.h1.join("")).not.toMatch(/[؀-ۿ]/);
    for (const lang of ["en", "ar"] as const) expect(JSON.stringify(getSiteContent(lang))).not.toContain("{name}");
  });

  it("keeps titles and descriptions within what search results show", () => {
    for (const content of [en, ar]) {
      const metas = [content.home.meta, content.featuresPage.meta, content.pricingPage.meta, content.industriesPage.meta, ...Object.values(content.industries).map((i) => i.meta)];
      for (const meta of metas) {
        expect(meta.title.length, meta.title).toBeLessThanOrEqual(90);
        expect(meta.description.length, meta.description).toBeGreaterThanOrEqual(70);
        expect(meta.description.length, meta.description).toBeLessThanOrEqual(230);
      }
    }
  });

  it("advertises the same plan limits the database enforces", async () => {
    const plans = await prisma.plan.findMany();
    for (const shown of SITE_PLANS) {
      const real = plans.find((p) => p.id === shown.id)!;
      expect({ messages: real.monthlyMessages, pages: real.maxKnowledgePages, seats: real.maxAgents }).toEqual({ messages: shown.messages, pages: shown.pages, seats: shown.seats });
    }
  });
});

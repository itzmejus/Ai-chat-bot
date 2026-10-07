import robotsParser from "robots-parser";
import { extractPage } from "./html";
import { renderPage, type Renderer } from "./render";
import { CRAWLER_USER_AGENT, safeFetch, type Fetcher } from "./safe-fetch";

export type CrawledPage = { url: string; title: string; text: string };

const SKIP_EXTENSIONS =
  /\.(pdf|jpe?g|png|gif|webp|svg|ico|css|js|json|xml|zip|rar|gz|mp4|mp3|mov|avi|woff2?|ttf|eot|docx?|xlsx?|pptx?|apk|exe|dmg)$/i;

const siteKey = (host: string) => host.toLowerCase().replace(/^www\./, "");

/**
 * Below this much text a page has probably not been drawn yet: it is a JavaScript app that
 * builds itself in the browser. Such pages are sent to the page reader when one is configured.
 */
export const THIN_PAGE_CHARS = 400;

/** Page addresses listed in a sitemap (or, for a sitemap index, the sitemaps it points to). */
function sitemapLocations(xml: string): string[] {
  return [...xml.matchAll(/<loc>\s*(?:<!\[CDATA\[)?\s*([^<\]\s]+)/gi)].map((m) => m[1].replace(/&amp;/g, "&"));
}

/** Canonical form used to avoid visiting the same page twice. */
export function normalizeUrl(raw: string): string | null {
  try {
    const url = new URL(raw);
    if (url.protocol !== "http:" && url.protocol !== "https:") return null;
    url.hash = "";
    for (const key of [...url.searchParams.keys()]) {
      if (/^(utm_|fbclid|gclid|ref$)/i.test(key)) url.searchParams.delete(key);
    }
    if (url.pathname.length > 1) url.pathname = url.pathname.replace(/\/+$/, "");
    return url.toString();
  } catch {
    return null;
  }
}

/**
 * Menus, footers and cookie banners repeat on every page. Keep such lines on
 * the first page only, so they are still searchable (footers often hold the
 * address and phone number) without bloating every chunk.
 */
function dropRepeatedLines(pages: CrawledPage[]): CrawledPage[] {
  if (pages.length < 4) return pages;
  const seenOn = new Map<string, number>();
  for (const page of pages) {
    for (const line of new Set(page.text.split("\n"))) seenOn.set(line, (seenOn.get(line) ?? 0) + 1);
  }
  const threshold = pages.length / 2;
  return pages
    .map((page, i) =>
      i === 0 ? page : { ...page, text: page.text.split("\n").filter((l) => (seenOn.get(l) ?? 0) <= threshold).join("\n") },
    )
    .filter((page) => page.text.trim().length > 0);
}

/**
 * Breadth-first crawl of one website.
 *  - stays on the start URL's domain (www and non-www are treated as the same site)
 *  - obeys robots.txt
 *  - also visits the pages listed in the site's sitemap, which finds pages no link points to
 *    (and is the only way to find them on sites whose links are drawn by JavaScript)
 *  - pages with almost no text in their HTML are read through the page reader, if configured
 *  - stops at `maxPages` pages or when the time budget runs out
 */
export async function crawlSite(
  startUrl: string,
  opts: { maxPages: number; fetcher?: Fetcher; renderer?: Renderer; concurrency?: number; timeBudgetMs?: number },
): Promise<CrawledPage[]> {
  const fetcher = opts.fetcher ?? safeFetch;
  const renderer = opts.renderer ?? renderPage;
  const concurrency = opts.concurrency ?? 3;
  const deadline = Date.now() + (opts.timeBudgetMs ?? 4 * 60_000);

  const start = normalizeUrl(startUrl);
  if (!start) throw new Error(`Invalid URL: ${startUrl}`);
  const origin = new URL(start);
  const site = siteKey(origin.hostname);

  // robots.txt: if it cannot be fetched, crawling is allowed (the standard behaviour).
  let robots: ReturnType<typeof robotsParser> | null = null;
  try {
    const robotsUrl = new URL("/robots.txt", origin).toString();
    const res = await fetcher(robotsUrl);
    if (res.status === 200) robots = robotsParser(robotsUrl, res.body);
  } catch {
    // treated as "no robots.txt"
  }
  const allowed = (url: string) => robots?.isAllowed(url, CRAWLER_USER_AGENT) !== false;

  const queue: string[] = [start];
  const seen = new Set<string>([start]);

  /** Queue a page of this site, once. */
  const enqueue = (link: string) => {
    const next = normalizeUrl(link);
    if (!next || seen.has(next) || seen.size >= opts.maxPages * 10) return;
    const parsed = new URL(next);
    if (siteKey(parsed.hostname) !== site || SKIP_EXTENSIONS.test(parsed.pathname)) return;
    seen.add(next);
    queue.push(next);
  };

  // Sitemaps: the ones robots.txt names, else the conventional address. One level of sitemap index is followed.
  try {
    const named = robots?.getSitemaps() ?? [];
    const sitemaps = (named.length ? named : [new URL("/sitemap.xml", origin).toString()]).slice(0, 3);
    for (let i = 0; i < sitemaps.length && i < 6; i++) {
      const res = await fetcher(sitemaps[i]).catch(() => null);
      if (!res || res.status !== 200) continue;
      for (const location of sitemapLocations(res.body).slice(0, 500)) {
        if (/\.xml(\.gz)?$/i.test(new URL(location).pathname)) sitemaps.push(location);
        else enqueue(location);
      }
    }
  } catch {
    // a broken sitemap is not a reason to fail the crawl
  }
  const fingerprints = new Set<string>();
  const pages: CrawledPage[] = [];
  let firstError: unknown;

  const visit = async (url: string) => {
    if (!allowed(url)) return;
    try {
      const res = await fetcher(url);
      const finalUrl = normalizeUrl(res.url);
      // A redirect may have left the site.
      if (!finalUrl || siteKey(new URL(finalUrl).hostname) !== site) return;
      if (res.status !== 200 || !/text\/html|application\/xhtml/i.test(res.contentType)) return;

      let { title, text, links } = extractPage(res.body, finalUrl);
      if (text.length < THIN_PAGE_CHARS) {
        // Probably drawn by JavaScript: ask the page reader for what a browser would show.
        const rendered = await renderer(finalUrl);
        if (rendered && rendered.text.length > text.length) ({ title, text, links } = { title: rendered.title || title, text: rendered.text, links: [...links, ...rendered.links] });
      }

      for (const link of links) enqueue(link);

      // Skip near-empty pages and exact duplicates (e.g. the same page under two URLs).
      if (text.length < 80 || fingerprints.has(text)) return;
      fingerprints.add(text);
      if (pages.length < opts.maxPages) pages.push({ url: finalUrl, title, text });
    } catch (err) {
      firstError ??= err;
    }
  };

  while (queue.length > 0 && pages.length < opts.maxPages && Date.now() < deadline) {
    const batch = queue.splice(0, Math.min(concurrency, opts.maxPages - pages.length));
    await Promise.all(batch.map(visit));
  }

  // Nothing at all usually means the site was unreachable: surface the real cause.
  if (pages.length === 0 && firstError) throw firstError;
  return dropRepeatedLines(pages);
}

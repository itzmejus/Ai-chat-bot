import robotsParser from "robots-parser";
import { extractPage } from "./html";
import { CRAWLER_USER_AGENT, safeFetch, type Fetcher } from "./safe-fetch";

export type CrawledPage = { url: string; title: string; text: string };

const SKIP_EXTENSIONS =
  /\.(pdf|jpe?g|png|gif|webp|svg|ico|css|js|json|xml|zip|rar|gz|mp4|mp3|mov|avi|woff2?|ttf|eot|docx?|xlsx?|pptx?|apk|exe|dmg)$/i;

const siteKey = (host: string) => host.toLowerCase().replace(/^www\./, "");

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
 *  - stops at `maxPages` pages or when the time budget runs out
 */
export async function crawlSite(
  startUrl: string,
  opts: { maxPages: number; fetcher?: Fetcher; concurrency?: number; timeBudgetMs?: number },
): Promise<CrawledPage[]> {
  const fetcher = opts.fetcher ?? safeFetch;
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

      const { title, text, links } = extractPage(res.body, finalUrl);

      for (const link of links) {
        const next = normalizeUrl(link);
        if (!next || seen.has(next) || seen.size >= opts.maxPages * 10) continue;
        const parsed = new URL(next);
        if (siteKey(parsed.hostname) !== site || SKIP_EXTENSIONS.test(parsed.pathname)) continue;
        seen.add(next);
        queue.push(next);
      }

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

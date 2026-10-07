import { cleanText } from "./html";

/**
 * Reading pages that are built by JavaScript.
 *
 * Many modern sites (React, Vue, Vite apps) send an almost empty HTML file and draw the
 * page in the browser. A plain download of such a page contains no text and no links.
 * Running a browser inside this app would need far more memory than the rest of it, so
 * rendering is delegated to a "reader" service that opens the page in a real browser and
 * returns its text.
 *
 * Off unless JS_RENDER_URL is set. The value is the service's address prefix; the default
 * choice is Jina Reader ("https://r.jina.ai/"), which works without an account at a low
 * rate limit and with JS_RENDER_API_KEY at a higher one. Only the page's public address is
 * sent to the service, and only for pages whose plain HTML had almost no text.
 */

export type RenderedPage = { title: string; text: string; links: string[] };
export type Renderer = (url: string) => Promise<RenderedPage | null>;

export const renderConfigured = () => Boolean(process.env.JS_RENDER_URL);

/** Markdown from the reader, as plain text: no images, links reduced to their words. */
function markdownToText(markdown: string): string {
  return cleanText(
    markdown
      .replace(/!\[[^\]]*\]\([^)]*\)/g, "") // images
      .replace(/\[([^\]]*)\]\([^)]*\)/g, "$1") // links
      .replace(/^#{1,6}\s+/gm, "") // heading marks
      .replace(/^\s*[-*]\s+/gm, "") // bullets
      .replace(/[*_`]{1,3}/g, ""), // emphasis
  );
}

/** The rendered text and links of a page, or null when rendering is off or fails. */
export const renderPage: Renderer = async (url) => {
  const base = process.env.JS_RENDER_URL;
  if (!base) return null;
  try {
    const res = await fetch(base.replace(/\/?$/, "/") + url, {
      headers: {
        Accept: "application/json",
        "X-With-Links-Summary": "true",
        "X-Retain-Images": "none",
        ...(process.env.JS_RENDER_API_KEY ? { Authorization: `Bearer ${process.env.JS_RENDER_API_KEY}` } : {}),
      },
      signal: AbortSignal.timeout(45_000),
    });
    if (!res.ok) {
      console.error(`[ingest] page reader answered ${res.status} for ${url}`);
      return null;
    }
    const data = ((await res.json()) as { data?: { title?: string; description?: string; content?: string; links?: Record<string, string> } }).data;
    if (!data?.content) return null;
    const title = (data.title ?? "").trim();
    return {
      title,
      text: cleanText([title, data.description ?? "", markdownToText(data.content)].join("\n")),
      links: Object.values(data.links ?? {}).filter((link): link is string => typeof link === "string"),
    };
  } catch (err) {
    console.error(`[ingest] page reader failed for ${url}`, err);
    return null;
  }
};

import * as cheerio from "cheerio";

const BLOCK_TAGS =
  "p,div,section,article,main,header,footer,aside,nav,li,ul,ol,tr,td,th,table,h1,h2,h3,h4,h5,h6,blockquote,pre,address,dt,dd,figcaption,option";

/** Collapse whitespace, drop empty lines and immediate repeats. */
export function cleanText(raw: string): string {
  const lines: string[] = [];
  for (const line of raw.split(/\r?\n/)) {
    const text = line.replace(/[\t  ]+/g, " ").trim();
    if (text && text !== lines[lines.length - 1]) lines.push(text);
  }
  return lines.join("\n");
}

/** Turn an HTML page into readable text plus the links it contains. */
export function extractPage(html: string, pageUrl: string): { title: string; text: string; links: string[] } {
  const $ = cheerio.load(html);

  const links: string[] = [];
  $("a[href]").each((_, el) => {
    const href = $(el).attr("href");
    if (!href || /^(mailto|tel|javascript|whatsapp|sms):/i.test(href) || href.startsWith("#")) return;
    try {
      links.push(new URL(href, pageUrl).toString());
    } catch {
      // ignore malformed links
    }
  });

  const title = $("title").first().text().trim();
  const description = $('meta[name="description"]').attr("content")?.trim() ?? "";

  $("script,style,noscript,svg,iframe,template,canvas,video,audio,link,meta").remove();
  // Line breaks around block elements so separate items do not run together.
  $("br").replaceWith("\n");
  $(BLOCK_TAGS).each((_, el) => {
    $(el).before("\n").after("\n");
  });

  const body = cleanText($("body").text());
  return { title, text: cleanText([title, description, body].join("\n")), links };
}

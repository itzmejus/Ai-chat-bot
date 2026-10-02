import { beforeEach, describe, expect, it, vi } from "vitest";

// OpenAI is never called in tests: embeddings are deterministic fakes.
const embedTexts = vi.hoisted(() => vi.fn(async (texts: string[]) => texts.map(() => Array(1536).fill(0.01))));
vi.mock("@/server/ai/openai", async (original) => ({
  ...(await original<typeof import("@/server/ai/openai")>()),
  embedTexts,
}));
// The job queue is replaced by a spy; tests call processSource directly.
const enqueueIngest = vi.hoisted(() => vi.fn(async () => {}));
vi.mock("@/server/jobs/queue", () => ({ enqueueIngest }));

import { MissingOpenAIKeyError } from "@/server/ai/openai";
import { prisma } from "@/server/db/prisma";
import { replaceSourceChunks } from "@/server/db/chunks";
import { tenantDb } from "@/server/db/tenant";
import { chunkText, countTokens } from "@/server/ingest/chunker";
import { crawlSite, normalizeUrl } from "@/server/ingest/crawler";
import { extractPage } from "@/server/ingest/html";
import { extractFileText, FileParseError } from "@/server/ingest/parsers";
import { processSource } from "@/server/ingest/process";
import { assertPublicUrl, isPrivateAddress, type Fetcher } from "@/server/ingest/safe-fetch";
import { addFaqSource, addUrlSource, KnowledgeLimitError, resyncSource, saveNotes } from "@/server/knowledge";
import { createTenant } from "./helpers";

beforeEach(() => {
  embedTexts.mockClear();
  enqueueIngest.mockClear();
});

describe("chunker", () => {
  const sentence = (i: number) => `Sentence number ${i} explains one of the clinic's policies in a little detail.`;

  it("keeps short text in a single chunk", () => {
    const chunks = chunkText("We are open from 9am to 6pm.\nFree parking is available.");
    expect(chunks).toHaveLength(1);
    expect(chunks[0].content).toContain("Free parking");
  });

  it("splits long text into chunks within the token limit, with overlap", () => {
    const text = Array.from({ length: 400 }, (_, i) => sentence(i)).join("\n");
    const chunks = chunkText(text);

    expect(chunks.length).toBeGreaterThan(3);
    for (const chunk of chunks) expect(countTokens(chunk.content)).toBeLessThanOrEqual(800);
    // All but the last chunk should be reasonably full.
    for (const chunk of chunks.slice(0, -1)) expect(countTokens(chunk.content)).toBeGreaterThanOrEqual(500);

    // Each chunk begins with the end of the previous one.
    for (let i = 1; i < chunks.length; i++) {
      const firstLine = chunks[i].content.split("\n")[0];
      expect(chunks[i - 1].content.endsWith(firstLine) || chunks[i - 1].content.includes(firstLine)).toBe(true);
    }
    // Nothing is lost.
    for (let i = 0; i < 400; i++) expect(chunks.some((c) => c.content.includes(sentence(i)))).toBe(true);
  });

  it("handles one enormous paragraph and Arabic text", () => {
    const wall = "word ".repeat(5000);
    for (const chunk of chunkText(wall)) expect(countTokens(chunk.content)).toBeLessThanOrEqual(800);

    const arabic = Array.from({ length: 300 }, (_, i) => `هذه الجملة رقم ${i} تشرح خدمات عيادة الأسنان وأسعارها.`).join(" ");
    const chunks = chunkText(arabic);
    expect(chunks.length).toBeGreaterThan(1);
    for (const chunk of chunks) expect(countTokens(chunk.content)).toBeLessThanOrEqual(800);
  });

  it("returns nothing for empty text", () => {
    expect(chunkText("  \n \n")).toEqual([]);
  });
});

describe("URL safety (SSRF protection)", () => {
  it("recognises private and public addresses", () => {
    for (const ip of ["127.0.0.1", "10.1.2.3", "192.168.1.1", "172.20.0.1", "169.254.169.254", "100.64.0.1", "0.0.0.0", "::1", "fe80::1", "fd00::1", "::ffff:10.0.0.1"]) {
      expect(isPrivateAddress(ip), ip).toBe(true);
    }
    for (const ip of ["8.8.8.8", "1.1.1.1", "2606:4700:4700::1111", "::ffff:8.8.8.8"]) {
      expect(isPrivateAddress(ip), ip).toBe(false);
    }
  });

  it("rejects URLs that point at internal services", () => {
    for (const url of [
      "http://localhost:3000/",
      "http://127.0.0.1/admin",
      "http://169.254.169.254/latest/meta-data/",
      "http://[::1]/",
      "http://db.internal/",
      "file:///etc/passwd",
      "ftp://example.com/",
      "http://user:pass@example.com/",
      "not a url",
    ]) {
      expect(() => assertPublicUrl(url), url).toThrow();
    }
    expect(assertPublicUrl("https://example.ae/menu").hostname).toBe("example.ae");
  });
});

describe("HTML extraction", () => {
  it("keeps visible text and links, drops scripts and styles", () => {
    const { title, text, links } = extractPage(
      `<html><head><title>Bright Smile</title><meta name="description" content="Dental clinic in Dubai">
       <style>.x{color:red}</style><script>alert("secret")</script></head>
       <body><nav><a href="/prices">Prices</a><a href="mailto:a@b.c">Mail</a><a href="https://other.com/x">Other</a></nav>
       <h1>Welcome</h1><p>Cleaning costs <b>AED 250</b>.</p><ul><li>Whitening</li><li>Braces</li></ul></body></html>`,
      "https://brightsmile.ae/",
    );
    expect(title).toBe("Bright Smile");
    expect(text).toContain("Dental clinic in Dubai");
    expect(text).toContain("Cleaning costs AED 250.");
    expect(text).toMatch(/Whitening\nBraces/);
    expect(text).not.toContain("alert");
    expect(text).not.toContain("color:red");
    expect(links).toEqual(["https://brightsmile.ae/prices", "https://other.com/x"]);
  });
});

/** A fake website served from memory. */
function fakeSite(pages: Record<string, string>, robots?: string) {
  const requested: string[] = [];
  const fetcher: Fetcher = async (url) => {
    requested.push(url);
    const path = new URL(url).pathname;
    if (new URL(url).hostname.replace(/^www\./, "") !== "shop.ae") throw new Error(`unexpected off-site request: ${url}`);
    if (path === "/robots.txt") {
      return robots ? { url, status: 200, contentType: "text/plain", body: robots } : { url, status: 404, contentType: "text/plain", body: "" };
    }
    const html = pages[path];
    if (html === undefined) return { url, status: 404, contentType: "text/html", body: "not found" };
    return { url, status: 200, contentType: "text/html; charset=utf-8", body: html };
  };
  return { fetcher, requested };
}

const page = (body: string, links: string[] = []) =>
  `<html><body><p>${body} ${"This paragraph pads the page so it is long enough to be indexed. ".repeat(2)}</p>${links
    .map((l) => `<a href="${l}">link</a>`)
    .join("")}</body></html>`;

describe("crawler", () => {
  it("normalises URLs", () => {
    expect(normalizeUrl("https://Shop.ae/a/?utm_source=x#top")).toBe("https://shop.ae/a");
    expect(normalizeUrl("mailto:a@b.c")).toBeNull();
  });

  it("follows links on the same domain only", async () => {
    const { fetcher, requested } = fakeSite({
      "/": page("Home page.", ["/about", "https://www.shop.ae/contact", "https://evil.com/steal", "/brochure.pdf", "/about#team"]),
      "/about": page("About us.", ["/"]),
      "/contact": page("Contact us on 04 123 4567."),
    });
    const pages = await crawlSite("https://shop.ae", { maxPages: 50, fetcher });

    expect(pages.map((p) => new URL(p.url).pathname).sort()).toEqual(["/", "/about", "/contact"]);
    expect(requested.some((u) => u.includes("evil.com"))).toBe(false);
    expect(requested.some((u) => u.endsWith(".pdf"))).toBe(false);
    // /about and /about#team are the same page: fetched once.
    expect(requested.filter((u) => new URL(u).pathname === "/about")).toHaveLength(1);
  });

  it("respects robots.txt", async () => {
    const { fetcher, requested } = fakeSite(
      { "/": page("Home.", ["/public", "/private/prices"]), "/public": page("Public info."), "/private/prices": page("Secret prices.") },
      "User-agent: *\nDisallow: /private/",
    );
    const pages = await crawlSite("https://shop.ae", { maxPages: 50, fetcher });

    expect(pages.map((p) => new URL(p.url).pathname).sort()).toEqual(["/", "/public"]);
    expect(requested.some((u) => u.includes("/private/"))).toBe(false);
  });

  it("stops at the page limit", async () => {
    const site: Record<string, string> = { "/": page("Home.", Array.from({ length: 30 }, (_, i) => `/p${i}`)) };
    for (let i = 0; i < 30; i++) site[`/p${i}`] = page(`Product ${i}.`);
    const { fetcher } = fakeSite(site);

    expect(await crawlSite("https://shop.ae", { maxPages: 5, fetcher })).toHaveLength(5);
  });

  it("keeps repeated menu/footer lines on the first page only", async () => {
    const footer = "<footer><p>Call us: 04 123 4567 — Sheikh Zayed Road, Dubai</p></footer>";
    const site: Record<string, string> = { "/": page("Home.", ["/a", "/b", "/c"]) + footer };
    for (const p of ["a", "b", "c"]) site[`/${p}`] = page(`Page ${p} unique content.`) + footer;
    const { fetcher } = fakeSite(site);

    const pages = await crawlSite("https://shop.ae", { maxPages: 50, fetcher });
    expect(pages).toHaveLength(4);
    expect(pages.filter((p) => p.text.includes("Sheikh Zayed Road"))).toHaveLength(1);
  });

  it("reports an unreachable site as an error", async () => {
    const fetcher: Fetcher = async () => {
      throw new TypeError("fetch failed");
    };
    await expect(crawlSite("https://shop.ae", { maxPages: 5, fetcher })).rejects.toThrow("fetch failed");
  });
});

describe("file parsing", () => {
  it("reads TXT files and rejects unsupported or empty ones", async () => {
    const text = await extractFileText("prices.txt", new TextEncoder().encode("Cleaning: AED 250\n\n\nWhitening: AED 900"));
    expect(text).toBe("Cleaning: AED 250\nWhitening: AED 900");

    await expect(extractFileText("virus.exe", new Uint8Array([1, 2, 3]))).rejects.toMatchObject({ code: "unsupported" });
    await expect(extractFileText("empty.txt", new TextEncoder().encode("   "))).rejects.toMatchObject({ code: "noText" });
    await expect(extractFileText("broken.pdf", new TextEncoder().encode("this is not a pdf at all"))).rejects.toBeInstanceOf(FileParseError);
  });
});

describe("ingestion", () => {
  const scopeFor = (workspaceId: string, maxPages = 25) => ({ workspaceId, db: tenantDb(workspaceId), maxPages });

  it("embeds a FAQ and stores its chunks in the right workspace only", async () => {
    const a = await createTenant("Ingest A");
    const b = await createTenant("Ingest B");
    await addFaqSource(scopeFor(a.workspace.id), "Do you accept insurance?", "Yes, Daman and AXA.");

    const source = await tenantDb(a.workspace.id).knowledgeSource.findFirstOrThrow();
    expect(source.status).toBe("processing");
    expect(enqueueIngest).toHaveBeenCalledWith(a.workspace.id, source.id);

    await processSource(a.workspace.id, source.id);

    const done = await tenantDb(a.workspace.id).knowledgeSource.findFirstOrThrow();
    expect(done).toMatchObject({ status: "ready", error: null, pageCount: 1 });
    expect(done.lastSyncedAt).not.toBeNull();

    const chunks = await tenantDb(a.workspace.id).chunk.findMany();
    expect(chunks).toHaveLength(1);
    expect(chunks[0].content).toBe("Question: Do you accept insurance?\nAnswer: Yes, Daman and AXA.");
    expect(await tenantDb(b.workspace.id).chunk.count()).toBe(0);

    const [{ dims }] = await prisma.$queryRaw<{ dims: number }[]>`
      SELECT vector_dims("embedding") AS dims FROM "Chunk" WHERE "id" = ${chunks[0].id}`;
    expect(dims).toBe(1536);
  });

  it("crawls a website source and records the page count", async () => {
    const { workspace } = await createTenant("Ingest Crawl");
    await addUrlSource(scopeFor(workspace.id), "https://shop.ae");
    const source = await tenantDb(workspace.id).knowledgeSource.findFirstOrThrow();

    const { fetcher } = fakeSite({ "/": page("Home.", ["/about"]), "/about": page("About us.") });
    await processSource(workspace.id, source.id, { fetcher });

    const done = await tenantDb(workspace.id).knowledgeSource.findFirstOrThrow();
    expect(done).toMatchObject({ status: "ready", pageCount: 2 });
    const chunks = await tenantDb(workspace.id).chunk.findMany();
    expect(chunks.map((c) => c.url).sort()).toEqual(["https://shop.ae/", "https://shop.ae/about"]);
  });

  it("replaces chunks on re-sync instead of duplicating them", async () => {
    const { workspace } = await createTenant("Ingest Resync");
    const scope = scopeFor(workspace.id);
    await saveNotes(scope, "We have free parking.");
    const source = await scope.db.knowledgeSource.findFirstOrThrow();
    await processSource(workspace.id, source.id);

    await saveNotes(scope, "Parking is AED 10 per hour.");
    expect(await scope.db.knowledgeSource.count()).toBe(1); // still one notes source
    await processSource(workspace.id, source.id);

    const chunks = await scope.db.chunk.findMany();
    expect(chunks.map((c) => c.content)).toEqual(["Parking is AED 10 per hour."]);

    // Re-sync only queues sources that are not already processing.
    enqueueIngest.mockClear();
    await resyncSource(scope, source.id);
    await resyncSource(scope, source.id);
    expect(enqueueIngest).toHaveBeenCalledTimes(1);

    await saveNotes(scope, "");
    expect(await scope.db.knowledgeSource.count()).toBe(0);
    expect(await scope.db.chunk.count()).toBe(0); // cascade
  });

  it("marks the source failed with a readable reason", async () => {
    const { workspace } = await createTenant("Ingest Fail");
    const scope = scopeFor(workspace.id);

    await addFaqSource(scope, "Opening hours?", "9 to 6.");
    const faq = await scope.db.knowledgeSource.findFirstOrThrow();
    embedTexts.mockRejectedValueOnce(new MissingOpenAIKeyError());
    await processSource(workspace.id, faq.id);
    expect(await scope.db.knowledgeSource.findUnique({ where: { id: faq.id } })).toMatchObject({ status: "failed", error: "openaiKey" });

    await addUrlSource(scope, "https://shop.ae");
    const url = await scope.db.knowledgeSource.findFirstOrThrow({ where: { type: "url" } });
    await processSource(workspace.id, url.id, {
      fetcher: async () => {
        throw new TypeError("fetch failed");
      },
    });
    expect(await scope.db.knowledgeSource.findUnique({ where: { id: url.id } })).toMatchObject({ status: "failed", error: "fetchFailed" });
    expect(await scope.db.chunk.count()).toBe(0);
  });

  it("refuses to process or write chunks for another workspace's source", async () => {
    const a = await createTenant("Ingest Owner");
    const b = await createTenant("Ingest Intruder");
    await addFaqSource(scopeFor(a.workspace.id), "Secret?", "Secret answer.");
    const source = await tenantDb(a.workspace.id).knowledgeSource.findFirstOrThrow();

    // Wrong workspace: the job finds nothing and does nothing.
    await processSource(b.workspace.id, source.id);
    expect(embedTexts).not.toHaveBeenCalled();
    expect((await tenantDb(a.workspace.id).knowledgeSource.findFirstOrThrow()).status).toBe("processing");

    await expect(
      replaceSourceChunks(b.workspace.id, source.id, [{ content: "x", tokenCount: 1, url: null, embedding: Array(1536).fill(0) }]),
    ).rejects.toThrow();
    expect(await prisma.chunk.count({ where: { sourceId: source.id } })).toBe(0);
  });

  it("enforces the plan's knowledge page limit", async () => {
    const { workspace } = await createTenant("Ingest Limit");
    const scope = scopeFor(workspace.id, 2);
    await addFaqSource(scope, "Question one?", "One.");
    await addFaqSource(scope, "Question two?", "Two.");
    await expect(addFaqSource(scope, "Question three?", "Three.")).rejects.toBeInstanceOf(KnowledgeLimitError);
    await expect(addUrlSource(scope, "https://shop.ae")).rejects.toBeInstanceOf(KnowledgeLimitError);
    expect(await scope.db.knowledgeSource.count()).toBe(2);
  });
});

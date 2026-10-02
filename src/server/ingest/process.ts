import { embedTexts, MissingOpenAIKeyError } from "@/server/ai/openai";
import { replaceSourceChunks, type NewChunk } from "@/server/db/chunks";
import { tenantDb } from "@/server/db/tenant";
import { knowledgePagesUsed, MAX_CRAWL_PAGES } from "@/server/knowledge";
import { chunkText } from "./chunker";
import { crawlSite } from "./crawler";
import { BlockedUrlError, type Fetcher } from "./safe-fetch";

/** Codes stored in KnowledgeSource.error; the dashboard translates them. */
export type IngestErrorCode = "noContent" | "fetchFailed" | "blockedUrl" | "limit" | "openaiKey" | "generic";

class IngestError extends Error {
  constructor(public code: IngestErrorCode) {
    super(code);
  }
}

function toErrorCode(err: unknown): IngestErrorCode {
  if (err instanceof IngestError) return err.code;
  // undici wraps connection errors, so the real reason may be in `cause`.
  if (err instanceof BlockedUrlError || (err instanceof Error && err.cause instanceof BlockedUrlError)) return "blockedUrl";
  if (err instanceof MissingOpenAIKeyError) return "openaiKey";
  // undici reports network failures as TypeError("fetch failed"); timeouts as TimeoutError.
  if (err instanceof Error && (err.name === "TimeoutError" || /fetch failed/i.test(err.message))) return "fetchFailed";
  return "generic";
}

type Document = { url: string | null; text: string };

/**
 * Turn one knowledge source into embedded chunks. Runs in the background worker.
 * Never throws: the outcome is recorded on the source as `ready` or `failed`.
 */
export async function processSource(workspaceId: string, sourceId: string, deps: { fetcher?: Fetcher } = {}) {
  const db = tenantDb(workspaceId);
  const source = await db.knowledgeSource.findUnique({ where: { id: sourceId } });
  if (!source) return; // deleted before the job ran

  try {
    let documents: Document[];

    if (source.type === "url") {
      const workspace = await db.workspace.findFirstOrThrow({ include: { plan: true } });
      const usedElsewhere = (await knowledgePagesUsed(db)) - source.pageCount;
      const maxPages = Math.min(MAX_CRAWL_PAGES, workspace.plan.maxKnowledgePages - usedElsewhere);
      if (maxPages <= 0) throw new IngestError("limit");

      const pages = await crawlSite(source.url!, { maxPages, fetcher: deps.fetcher });
      // Sources added while the crawl was running also count: keep only what still fits.
      const room = workspace.plan.maxKnowledgePages - ((await knowledgePagesUsed(db)) - source.pageCount);
      if (room <= 0) throw new IngestError("limit");
      documents = pages.slice(0, room).map((p) => ({ url: p.url, text: p.text }));
    } else if (source.type === "faq") {
      documents = [{ url: null, text: `Question: ${source.title}\nAnswer: ${source.content ?? ""}` }];
    } else {
      // file (text was extracted at upload time) and notes
      documents = [{ url: null, text: source.content ?? "" }];
    }

    const pieces = documents.flatMap((doc) => chunkText(doc.text).map((chunk) => ({ ...chunk, url: doc.url })));
    if (pieces.length === 0) throw new IngestError("noContent");

    const embeddings = await embedTexts(pieces.map((p) => p.content));
    const chunks: NewChunk[] = pieces.map((p, i) => ({ ...p, embedding: embeddings[i] }));
    await replaceSourceChunks(workspaceId, sourceId, chunks);

    await db.knowledgeSource.update({
      where: { id: sourceId },
      data: {
        status: "ready",
        error: null,
        pageCount: source.type === "url" ? documents.length : 1,
        lastSyncedAt: new Date(),
      },
    });
  } catch (err) {
    const code = toErrorCode(err);
    console.error(`[ingest] source ${sourceId} failed (${code})`, err);
    // updateMany: no error if the source was deleted while we were working.
    await db.knowledgeSource
      .updateMany({ where: { id: sourceId }, data: { status: "failed", error: code } })
      .catch((e) => console.error("[ingest] could not record failure", e));
  }
}

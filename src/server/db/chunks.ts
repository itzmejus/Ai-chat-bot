import { randomUUID } from "node:crypto";
import { prisma } from "./prisma";
import { tenantDb } from "./tenant";

/**
 * Raw SQL for the pgvector column, which Prisma cannot read or write itself.
 *
 * Raw queries bypass `tenantDb`, so every function here takes `workspaceId`
 * explicitly and puts it in the SQL. These functions are covered by the
 * isolation tests.
 */

export type NewChunk = { content: string; tokenCount: number; url: string | null; embedding: number[] };

/**
 * Replace all chunks of a knowledge source. New chunks are inserted before the
 * old ones are removed, so the assistant never sees an empty source mid re-sync.
 */
export async function replaceSourceChunks(workspaceId: string, sourceId: string, chunks: NewChunk[]) {
  const db = tenantDb(workspaceId);
  // The source must belong to this workspace; otherwise refuse to write anything.
  const source = await db.knowledgeSource.findUnique({ where: { id: sourceId }, select: { id: true } });
  if (!source) throw new Error("Knowledge source not found in this workspace");

  const rows = chunks.map((c) => ({
    id: randomUUID(),
    content: c.content,
    tokens: c.tokenCount,
    url: c.url,
    embedding: `[${c.embedding.join(",")}]`,
  }));

  const BATCH = 50;
  for (let i = 0; i < rows.length; i += BATCH) {
    const json = JSON.stringify(rows.slice(i, i + BATCH));
    await prisma.$executeRaw`
      INSERT INTO "Chunk" ("id", "workspaceId", "sourceId", "content", "tokenCount", "url", "embedding")
      SELECT t.id, ${workspaceId}, ${sourceId}, t.content, t.tokens, t.url, t.embedding::vector
      FROM jsonb_to_recordset(${json}::jsonb) AS t(id text, content text, tokens int, url text, embedding text)`;
  }

  await db.chunk.deleteMany({ where: { sourceId, id: { notIn: rows.map((r) => r.id) } } });
  return rows.length;
}

export type ChunkMatch = {
  id: string;
  content: string;
  url: string | null;
  sourceTitle: string;
  /** Cosine similarity, 0..1 (higher is closer). */
  similarity: number;
};

/**
 * Nearest chunks to a query embedding, for ONE workspace only.
 *
 * The HNSW index is shared by all workspaces, so a plain index scan could
 * return mostly other tenants' rows and then filter them away, leaving too few.
 * Iterative scan (pgvector 0.8+) keeps scanning until enough rows of this
 * workspace are found. SET LOCAL needs a transaction, hence $transaction.
 */
export async function searchChunks(workspaceId: string, embedding: number[], limit = 6): Promise<ChunkMatch[]> {
  if (!workspaceId) throw new Error("searchChunks requires a workspaceId");
  const vec = `[${embedding.join(",")}]`;

  const [, rows] = await prisma.$transaction([
    prisma.$executeRaw`SET LOCAL hnsw.iterative_scan = 'relaxed_order'`,
    prisma.$queryRaw<ChunkMatch[]>`
      SELECT c."id", c."content", c."url", s."title" AS "sourceTitle",
             (1 - (c."embedding" <=> ${vec}::vector))::float8 AS "similarity"
      FROM "Chunk" c
      JOIN "KnowledgeSource" s ON s."id" = c."sourceId" AND s."workspaceId" = ${workspaceId}
      WHERE c."workspaceId" = ${workspaceId} AND c."embedding" IS NOT NULL
      ORDER BY c."embedding" <=> ${vec}::vector
      LIMIT ${limit}`,
  ]);
  return rows;
}

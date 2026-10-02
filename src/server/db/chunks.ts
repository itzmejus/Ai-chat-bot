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

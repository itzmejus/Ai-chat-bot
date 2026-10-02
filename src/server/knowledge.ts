import type { TenantDb } from "@/server/db/tenant";
import { enqueueIngest } from "@/server/jobs/queue";

/**
 * Knowledge base operations. Every function takes the workspace-scoped `db`
 * from `requireWorkspace()`, so it can only touch that workspace's sources.
 */

/** Hard cap per website crawl, regardless of plan. */
export const MAX_CRAWL_PAGES = 50;

export class KnowledgeLimitError extends Error {
  constructor() {
    super("Knowledge page limit reached");
    this.name = "KnowledgeLimitError";
  }
}

type Scope = { workspaceId: string; db: TenantDb; maxPages: number };

/** Pages counted against the plan: crawled pages for websites, 1 for everything else. */
export async function knowledgePagesUsed(db: TenantDb): Promise<number> {
  const result = await db.knowledgeSource.aggregate({ _sum: { pageCount: true } });
  return result._sum.pageCount ?? 0;
}

async function assertRoom({ db, maxPages }: Scope) {
  if ((await knowledgePagesUsed(db)) >= maxPages) throw new KnowledgeLimitError();
}

export function listSources(db: TenantDb) {
  return db.knowledgeSource.findMany({
    orderBy: { createdAt: "desc" },
    select: { id: true, type: true, title: true, url: true, status: true, error: true, pageCount: true, lastSyncedAt: true, createdAt: true },
  });
}

export async function addUrlSource(scope: Scope, url: string) {
  await assertRoom(scope);
  const source = await scope.db.knowledgeSource.create({
    data: { workspaceId: scope.workspaceId, type: "url", title: url, url },
  });
  await enqueueIngest(scope.workspaceId, source.id);
}

export async function addFaqSource(scope: Scope, question: string, answer: string) {
  await assertRoom(scope);
  const source = await scope.db.knowledgeSource.create({
    data: { workspaceId: scope.workspaceId, type: "faq", title: question, content: answer, pageCount: 1 },
  });
  await enqueueIngest(scope.workspaceId, source.id);
}

export async function addFileSource(scope: Scope, fileName: string, text: string) {
  await assertRoom(scope);
  const source = await scope.db.knowledgeSource.create({
    data: { workspaceId: scope.workspaceId, type: "file", title: fileName, content: text, pageCount: 1 },
  });
  await enqueueIngest(scope.workspaceId, source.id);
}

/** Business notes are a single free-text source per workspace. Empty text removes it. */
export async function saveNotes(scope: Scope, text: string) {
  const { db, workspaceId } = scope;
  const existing = await db.knowledgeSource.findFirst({ where: { type: "notes" }, select: { id: true } });

  if (!text) {
    if (existing) await db.knowledgeSource.delete({ where: { id: existing.id } });
    return;
  }

  let id = existing?.id;
  if (id) {
    await db.knowledgeSource.update({ where: { id }, data: { content: text, status: "processing", error: null } });
  } else {
    await assertRoom(scope);
    id = (
      await db.knowledgeSource.create({
        data: { workspaceId, type: "notes", title: "Business notes", content: text, pageCount: 1 },
      })
    ).id;
  }
  await enqueueIngest(workspaceId, id);
}

export async function getNotes(db: TenantDb): Promise<string> {
  const notes = await db.knowledgeSource.findFirst({ where: { type: "notes" }, select: { content: true } });
  return notes?.content ?? "";
}

/** Re-run ingestion (re-crawls websites; re-embeds everything else). */
export async function resyncSource({ db, workspaceId }: Scope, sourceId: string) {
  const { count } = await db.knowledgeSource.updateMany({
    where: { id: sourceId, status: { not: "processing" } },
    data: { status: "processing", error: null },
  });
  if (count > 0) await enqueueIngest(workspaceId, sourceId);
}

/** Deleting a source also deletes its chunks (database cascade). */
export async function deleteSource({ db }: Scope, sourceId: string) {
  await db.knowledgeSource.deleteMany({ where: { id: sourceId } });
}

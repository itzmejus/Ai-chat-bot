import { PgBoss } from "pg-boss";

/**
 * Background jobs: reading a knowledge source (crawl, chunk, embed). WORKER_MODE picks where:
 *
 *   ""          a worker inside the Next.js server process (see src/instrumentation.ts); jobs are
 *               queued in Postgres by pg-boss. The default on a server that keeps running (Render).
 *   "external"  queued the same way, processed by `npm run worker` running as its own service.
 *   "request"   no queue: the source is processed straight after the response of the request that
 *               added it, within that function's time limit (Next.js `after`). The default on Vercel,
 *               where nothing keeps running between requests to poll a queue, and where each
 *               instance holding pg-boss connections would quickly use up the database pooler.
 */
export function jobMode(): "worker" | "external" | "request" {
  const mode = process.env.WORKER_MODE;
  if (mode === "external" || mode === "request") return mode;
  return process.env.VERCEL ? "request" : "worker";
}

const INGEST_QUEUE = "ingest-source";
type IngestJob = { workspaceId: string; sourceId: string };

// One pg-boss instance per process, surviving dev hot reloads.
const globalForBoss = globalThis as unknown as { pgBoss?: Promise<PgBoss> };

function getBoss(): Promise<PgBoss> {
  globalForBoss.pgBoss ??= (async () => {
    // pg-boss wants a session-capable connection; prefer DIRECT_URL (Supabase session pooler).
    const connectionString = process.env.DIRECT_URL || process.env.DATABASE_URL;
    if (!connectionString) throw new Error("DATABASE_URL is not set");

    const boss = new PgBoss({ connectionString, max: 4 });
    boss.on("error", (err) => console.error("[jobs]", err));
    await boss.start();
    // A crawl can take minutes. If the process dies mid-job, retry once after it expires.
    await boss.createQueue(INGEST_QUEUE, { retryLimit: 1, expireInSeconds: 15 * 60 });
    return boss;
  })();
  // Do not cache a failed start: the next call should try again.
  globalForBoss.pgBoss.catch(() => (globalForBoss.pgBoss = undefined));
  return globalForBoss.pgBoss;
}

/** Queue a knowledge source for crawling/chunking/embedding. */
export async function enqueueIngest(workspaceId: string, sourceId: string) {
  if (jobMode() === "request") {
    const { after } = await import("next/server");
    after(async () => {
      const { processSource } = await import("@/server/ingest/process");
      // processSource records its own failures on the source; this only catches the unexpected.
      await processSource(workspaceId, sourceId).catch((err) => console.error("[jobs] processing failed", sourceId, err));
    });
    return;
  }
  const boss = await getBoss();
  await boss.send(INGEST_QUEUE, { workspaceId, sourceId } satisfies IngestJob);
}

const globalForWorker = globalThis as unknown as { ingestWorkerStarted?: boolean };

export async function startIngestWorker() {
  if (globalForWorker.ingestWorkerStarted) return;
  globalForWorker.ingestWorkerStarted = true;

  const boss = await getBoss();
  // Imported lazily so the web process does not load the crawler until needed.
  const { processSource } = await import("@/server/ingest/process");
  await boss.work<IngestJob>(INGEST_QUEUE, { pollingIntervalSeconds: 2 }, async (jobs) => {
    for (const job of jobs) await processSource(job.data.workspaceId, job.data.sourceId);
  });
  console.log("[jobs] ingestion worker started");
}

/** Backlog and recent failures of the ingestion queue, and whether this process runs the worker. */
export async function ingestQueueStatus() {
  if (jobMode() === "request") return { ready: 0, active: 0, failed: 0, workerInProcess: false };
  const boss = await getBoss();
  const queue = await boss.getQueue(INGEST_QUEUE);
  return {
    ready: queue?.readyCount ?? 0,
    active: queue?.activeCount ?? 0,
    failed: queue?.failedCount ?? 0,
    workerInProcess: Boolean(globalForWorker.ingestWorkerStarted),
  };
}

export async function stopJobs() {
  const boss = await globalForBoss.pgBoss?.catch(() => undefined);
  await boss?.stop();
}

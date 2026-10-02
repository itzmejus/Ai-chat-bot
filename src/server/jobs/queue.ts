import { PgBoss } from "pg-boss";

/**
 * Background jobs, stored in Postgres by pg-boss (no Redis needed).
 *
 * The web app enqueues; a worker processes. By default the worker runs inside
 * the Next.js server process (see src/instrumentation.ts). Set
 * WORKER_MODE=external and run `npm run worker` to move it to its own process.
 */

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

export async function stopJobs() {
  const boss = await globalForBoss.pgBoss?.catch(() => undefined);
  await boss?.stop();
}

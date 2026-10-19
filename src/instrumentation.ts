/**
 * Runs once when the Next.js server starts. Starts the background ingestion
 * worker inside the server process, so a single service is enough to deploy.
 * Not started when sources are read in the request instead (the default on Vercel)
 * or by a separate `npm run worker`: see jobMode() in src/server/jobs/queue.ts.
 */
export async function register() {
  if (process.env.NEXT_RUNTIME !== "nodejs") return;
  if (!process.env.DATABASE_URL) return;

  const { jobMode, startIngestWorker } = await import("@/server/jobs/queue");
  if (jobMode() !== "worker") return;
  startIngestWorker().catch((err) => console.error("[jobs] worker failed to start", err));
}

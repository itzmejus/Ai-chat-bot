/**
 * Runs once when the Next.js server starts. Starts the background ingestion
 * worker inside the server process, so a single service is enough to deploy.
 * Set WORKER_MODE=external to disable this and run `npm run worker` separately.
 */
export async function register() {
  if (process.env.NEXT_RUNTIME !== "nodejs") return;
  if (process.env.WORKER_MODE === "external" || !process.env.DATABASE_URL) return;

  const { startIngestWorker } = await import("@/server/jobs/queue");
  startIngestWorker().catch((err) => console.error("[jobs] worker failed to start", err));
}

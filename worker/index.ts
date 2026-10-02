/**
 * Standalone background worker: `npm run worker`.
 * Only needed when the web service runs with WORKER_MODE=external.
 */
import "dotenv/config";
import { startIngestWorker, stopJobs } from "@/server/jobs/queue";

startIngestWorker().catch((err) => {
  console.error("[worker] failed to start", err);
  process.exit(1);
});

for (const signal of ["SIGINT", "SIGTERM"] as const) {
  process.on(signal, async () => {
    await stopJobs();
    process.exit(0);
  });
}

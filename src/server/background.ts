import { after } from "next/server";

/**
 * Work that must not delay or break the response (notification emails, WhatsApp alerts), but
 * must still finish. A bare `void promise` is not enough on Vercel: the function is frozen as
 * soon as the response is sent, cutting the work off. `after` keeps it running until done.
 *
 * Outside a request (scripts, tests) `after` is unavailable, so the work simply starts.
 * Failures are logged, never thrown.
 */
export function inBackground(label: string, work: () => Promise<unknown>) {
  const run = () =>
    work().catch((err) => {
      console.error(`[${label}] failed`, err);
    });
  try {
    after(run);
  } catch {
    void run();
  }
}

import { prisma } from "@/server/db/prisma";
import { chatModel, getOpenAI } from "@/server/ai/openai";
import { freePlanChangeAllowed, paymentsConfigured, paymentsMode, pingPayments } from "@/server/billing";
import { emailConfigured, verifyEmailServer } from "@/server/email/mailer";
import { ingestQueueStatus, jobMode } from "@/server/jobs/queue";
import { pingStorage, storageConfigured } from "@/server/storage";
import { whatsappConfigured } from "@/server/whatsapp/client";

/**
 * Live checks of everything the service depends on, for the admin health page. Each check makes
 * one cheap request (no AI tokens, no email sent) and gives up after a few seconds.
 *
 *   ok    working
 *   warn  working, but something needs attention
 *   down  broken: part of the service is not working
 *   off   not configured (optional feature)
 */
export type HealthStatus = "ok" | "warn" | "down" | "off";
export type HealthCheck = { name: string; status: HealthStatus; detail: string; ms?: number };

const TIMEOUT_MS = 8000;
const STUCK_AFTER_MS = 30 * 60 * 1000;

function withTimeout<T>(promise: Promise<T>): Promise<T> {
  return Promise.race([promise, new Promise<never>((_, reject) => setTimeout(() => reject(new Error(`no answer after ${TIMEOUT_MS / 1000}s`)), TIMEOUT_MS))]);
}

const message = (err: unknown) => (err instanceof Error ? err.message : String(err)).slice(0, 200);

/** Run `probe`, timing it; a throw becomes a "down" result with the error as detail. */
async function timed(name: string, probe: () => Promise<Omit<HealthCheck, "name" | "ms">>): Promise<HealthCheck> {
  const start = performance.now();
  try {
    const result = await withTimeout(probe());
    return { name, ...result, ms: Math.round(performance.now() - start) };
  } catch (err) {
    return { name, status: "down", detail: message(err), ms: Math.round(performance.now() - start) };
  }
}

const checkDatabase = () =>
  timed("Database", async () => {
    await prisma.$queryRaw`SELECT 1`;
    return { status: "ok", detail: "PostgreSQL answers" };
  });

const checkOpenAI = () =>
  timed("OpenAI", async () => {
    if (!process.env.OPENAI_API_KEY) return { status: "down", detail: "OPENAI_API_KEY is not set: the assistant cannot answer" };
    await getOpenAI().models.retrieve(chatModel());
    return { status: "ok", detail: `API key works, model ${chatModel()} available` };
  });

const checkPayments = () =>
  timed("Payments (Dodo)", async () => {
    if (!paymentsConfigured()) {
      return { status: "off", detail: freePlanChangeAllowed() ? "Not configured; demo mode lets owners switch plan for free" : "Not configured: paid plans cannot be bought" };
    }
    await pingPayments();
    const lastEvent = await prisma.workspace.aggregate({ _max: { billingEventAt: true } });
    const last = lastEvent._max.billingEventAt;
    const problems = [
      !process.env.DODO_PAYMENTS_WEBHOOK_KEY && "DODO_PAYMENTS_WEBHOOK_KEY is not set, so webhooks are refused",
      paymentsMode() === "test_mode" && "test mode: no real money is taken",
      freePlanChangeAllowed() && "ALLOW_FREE_PLAN_CHANGE is on (ignored while payments are configured; unset it)",
    ].filter(Boolean);
    const lastText = last ? `last webhook ${last.toISOString().slice(0, 16).replace("T", " ")} UTC` : "no webhook received yet";
    return {
      status: problems.length ? "warn" : "ok",
      detail: [`API key works (${paymentsMode()})`, lastText, ...problems].join(" · "),
    };
  });

const checkEmail = () =>
  timed("Email (SMTP)", async () => {
    if (!emailConfigured()) return { status: "warn", detail: "EMAIL_SERVER_HOST is not set: emails are only written to the log" };
    await verifyEmailServer();
    return { status: "ok", detail: `Logged in to ${process.env.EMAIL_SERVER_HOST}` };
  });

const checkStorage = () =>
  timed("Product photos (Supabase Storage)", async () => {
    if (!storageConfigured()) return { status: "off", detail: "Not configured: products are added without photos" };
    const result = await pingStorage();
    return result === "ok" ? { status: "ok", detail: "Bucket reachable" } : { status: "ok", detail: "Credentials work; the bucket is created on the first upload" };
  });

const checkWhatsApp = () =>
  timed("WhatsApp alerts", async () =>
    whatsappConfigured()
      ? { status: "ok", detail: "Configured (checked when an alert is sent)" }
      : { status: "off", detail: "Not configured: alerts are written to the log" },
  );

const checkJobs = () =>
  timed("Background jobs", async () => {
    const [queue, stuck, failed] = await Promise.all([
      ingestQueueStatus(),
      prisma.knowledgeSource.count({ where: { status: "processing", createdAt: { lt: new Date(Date.now() - STUCK_AFTER_MS) } } }),
      prisma.knowledgeSource.count({ where: { status: "failed" } }),
    ]);
    const mode = jobMode();
    if (mode === "request") {
      const facts = [`${failed} source(s) failed to read`, "sources are read in the request that adds them"];
      return { status: stuck > 0 ? "warn" : "ok", detail: [...facts, stuck > 0 && `${stuck} source(s) processing for over 30 min: re-read them from the Knowledge page`].filter(Boolean).join(" · ") };
    }
    const external = mode === "external";
    const problems = [
      !external && !queue.workerInProcess && "the worker is not running in this process",
      queue.ready > 20 && `${queue.ready} jobs waiting`,
      stuck > 0 && `${stuck} source(s) processing for over 30 min`,
    ].filter(Boolean);
    const facts = [`${queue.ready} waiting, ${queue.active} running`, `${failed} source(s) failed to read`, external ? "worker runs separately" : "worker in this process"];
    return { status: problems.length ? "warn" : "ok", detail: [...facts, ...problems].join(" · ") };
  });

export const runHealthChecks = () => Promise.all([checkDatabase(), checkOpenAI(), checkPayments(), checkEmail(), checkJobs(), checkStorage(), checkWhatsApp()]);

/** Facts about the running server, shown under the checks. */
export function serverInfo() {
  const mb = (bytes: number) => `${Math.round(bytes / 1024 / 1024)} MB`;
  const uptime = process.uptime();
  return {
    node: process.version,
    uptime: uptime > 86400 ? `${Math.floor(uptime / 86400)} d ${Math.floor((uptime % 86400) / 3600)} h` : `${Math.floor(uptime / 3600)} h ${Math.floor((uptime % 3600) / 60)} min`,
    memory: mb(process.memoryUsage().rss),
    commit: (process.env.VERCEL_GIT_COMMIT_SHA ?? process.env.RENDER_GIT_COMMIT ?? "").slice(0, 7) || null,
    environment: process.env.NODE_ENV ?? "development",
  };
}

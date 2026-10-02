import { randomUUID } from "node:crypto";
import pg from "pg";
import { prisma } from "@/server/db/prisma";

/**
 * Realtime event bus.
 *
 * Whenever a conversation changes (new message, takeover, status change) the
 * code calls `publish()`. Open browser connections (the dashboard inbox and the
 * customer's widget) are subscribed through `subscribe()` and forward the event
 * over Server-Sent Events.
 *
 * Events travel two ways at once:
 *   1. straight to subscribers in this process, so it works with no extra setup;
 *   2. through Postgres NOTIFY, so subscribers connected to OTHER server
 *      instances get them too once the app is scaled out.
 * A subscriber may therefore see the same event from both routes; each event
 * carries an id and is delivered only once.
 *
 * Events contain ids only, never message text. Each subscriber loads what it
 * needs through its own workspace-scoped database client, so the bus cannot
 * leak content between workspaces.
 */

export type ChatEvent = {
  id: string;
  workspaceId: string;
  conversationId: string;
  /** "message": a message was added. "conversation": status, assignment or unread flag changed. */
  type: "message" | "conversation";
  messageId?: string;
};

type Listener = (event: ChatEvent) => void;

const CHANNEL = "chat_events";

// Kept on globalThis so dev hot reloads reuse one connection and one listener set.
const state = ((globalThis as { __chatBus?: BusState }).__chatBus ??= {
  listeners: new Set<Listener>(),
  seen: [] as string[],
  client: undefined as pg.Client | undefined,
  connecting: false,
});
type BusState = { listeners: Set<Listener>; seen: string[]; client: pg.Client | undefined; connecting: boolean };

function dispatch(event: ChatEvent) {
  if (state.seen.includes(event.id)) return;
  state.seen.push(event.id);
  if (state.seen.length > 500) state.seen.splice(0, 250);
  for (const listener of state.listeners) {
    try {
      listener(event);
    } catch (err) {
      console.error("[realtime] listener failed", err);
    }
  }
}

/** Open (or reopen) the dedicated LISTEN connection. Needs a session-capable connection. */
async function ensureListening() {
  const connectionString = process.env.DIRECT_URL || process.env.DATABASE_URL;
  if (state.client || state.connecting || !connectionString || state.listeners.size === 0) return;
  state.connecting = true;

  const client = new pg.Client({ connectionString, keepAlive: true });
  const retry = () => {
    if (state.client === client) state.client = undefined;
    client.removeAllListeners();
    client.end().catch(() => {});
    setTimeout(() => void ensureListening(), 3000);
  };
  try {
    await client.connect();
    client.on("notification", (msg) => {
      if (msg.channel !== CHANNEL || !msg.payload) return;
      try {
        dispatch(JSON.parse(msg.payload) as ChatEvent);
      } catch {
        // ignore malformed payloads
      }
    });
    client.on("error", (err) => {
      console.error("[realtime] listen connection error", err.message);
      retry();
    });
    client.on("end", retry);
    await client.query(`LISTEN ${CHANNEL}`);
    state.client = client;
  } catch (err) {
    // Cross-instance delivery is unavailable; same-instance delivery still works.
    console.error("[realtime] could not start LISTEN", (err as Error).message);
    retry();
  } finally {
    state.connecting = false;
  }
}

export function subscribe(listener: Listener): () => void {
  state.listeners.add(listener);
  void ensureListening();
  return () => state.listeners.delete(listener);
}

export async function publish(event: Omit<ChatEvent, "id">) {
  const full: ChatEvent = { ...event, id: randomUUID() };
  dispatch(full);
  try {
    // pg_notify returns void, which Prisma cannot read back; cast it to text.
    await prisma.$queryRaw`SELECT pg_notify(${CHANNEL}, ${JSON.stringify(full)})::text AS sent`;
  } catch (err) {
    console.error("[realtime] NOTIFY failed", (err as Error).message);
  }
}

/**
 * Hold a Server-Sent Events response open, forwarding matching events until
 * the client disconnects. A ping every 25 seconds keeps proxies from closing
 * an idle connection.
 */
export function streamEvents(
  send: (event: string, data: unknown) => void,
  signal: AbortSignal,
  matches: (event: ChatEvent) => boolean,
  onEvent: (event: ChatEvent) => Promise<void> | void,
): Promise<void> {
  return new Promise((resolve) => {
    const unsubscribe = subscribe((event) => {
      if (!matches(event)) return;
      Promise.resolve(onEvent(event)).catch((err) => console.error("[realtime] forwarding failed", err));
    });
    const ping = setInterval(() => send("ping", {}), 25_000);
    const stop = () => {
      clearInterval(ping);
      unsubscribe();
      resolve();
    };
    if (signal.aborted) stop();
    else signal.addEventListener("abort", stop, { once: true });
  });
}

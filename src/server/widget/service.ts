import { z } from "zod";
import { APP_NAME, SITE_URL } from "@/lib/config";
import { prisma } from "@/server/db/prisma";
import { tenantDb, type TenantDb } from "@/server/db/tenant";
import { rateLimit } from "@/server/limits/rate-limit";
import { clientIpFrom } from "@/server/limits/client-ip";
import { verifyWidgetToken } from "./token";

/** Settings the chat iframe needs to draw itself. Everything here is public. */
export type WidgetConfig = {
  key: string;
  businessName: string;
  assistantName: string;
  greeting: string;
  brandColor: string;
  logoUrl: string | null;
  position: "left" | "right";
  preChatForm: boolean;
  /** Show a few products under the greeting when the chat opens. */
  showProducts: boolean;
  /** Language the business serves customers in: decides the widget's starting language. */
  language: "en" | "ar" | "both";
  /** Shown as a small "Powered by" line under the chat. */
  poweredBy: { name: string; url: string };
};

/**
 * Look a workspace up by its public widget key. This is one of the few places the
 * unscoped Prisma client is used: the key is how an anonymous visitor identifies
 * the workspace in the first place.
 */
export async function getWidgetWorkspace(publicKey: string) {
  if (!/^pk_[0-9a-f]{32}$/.test(publicKey)) return null;
  const workspace = await prisma.workspace.findUnique({
    where: { publicKey },
    include: { widgetSettings: true, assistantSettings: true },
  });
  if (!workspace) return null;

  const config: WidgetConfig = {
    key: workspace.publicKey,
    businessName: workspace.name,
    assistantName: workspace.assistantSettings?.assistantName ?? "Assistant",
    greeting: workspace.assistantSettings?.greeting ?? "",
    brandColor: workspace.widgetSettings?.brandColor ?? "#2563eb",
    logoUrl: workspace.widgetSettings?.logoUrl ?? null,
    position: workspace.widgetSettings?.position ?? "right",
    preChatForm: workspace.widgetSettings?.preChatForm ?? false,
    showProducts: workspace.widgetSettings?.showProducts ?? true,
    language: workspace.defaultLanguage,
    poweredBy: { name: APP_NAME, url: SITE_URL },
  };
  return { workspaceId: workspace.id, allowedDomains: workspace.widgetSettings?.allowedDomains ?? [], config };
}

/** The visitor id is a random value the widget keeps for the browser session. It acts as the visitor's secret. */
export const visitorIdSchema = z.string().regex(/^[A-Za-z0-9_-]{16,64}$/);
/** Record ids are cuids; anything else (a null character, say) is refused before it reaches the database. */
export const conversationIdSchema = z.string().regex(/^[A-Za-z0-9_-]{1,64}$/);

/**
 * Free text from a visitor. Null characters are removed first: PostgreSQL refuses to store
 * them, so one hidden in a message would otherwise turn the request into a server error.
 */
export const visitorText = (max: number) =>
  z
    .string()
    .transform((value) => value.replaceAll("\u0000", ""))
    .pipe(z.string().trim().min(1).max(max));

export type WidgetRequest = { workspaceId: string; preview: boolean; db: TenantDb };

/** Authenticate a public widget API call by its bearer token. */
export function authenticateWidget(request: Request): WidgetRequest | null {
  const header = request.headers.get("authorization") ?? "";
  const payload = verifyWidgetToken(header.startsWith("Bearer ") ? header.slice(7) : null);
  if (!payload) return null;
  return { workspaceId: payload.w, preview: payload.preview, db: tenantDb(payload.w) };
}

export function clientIp(request: Request): string {
  return clientIpFrom(request.headers);
}

/**
 * Rate limits for sending chat messages: per visitor (a person typing), per IP
 * address (one machine pretending to be many visitors) and per workspace (a cap
 * on how fast any one business's OpenAI spend can grow).
 */
export async function chatRateLimitOk(workspaceId: string, visitorId: string, ip: string): Promise<boolean> {
  const results = await Promise.all([
    rateLimit(`chat:visitor:${workspaceId}:${visitorId}`, 12, 60),
    rateLimit(`chat:ip:${ip}`, 40, 60),
    rateLimit(`chat:workspace:${workspaceId}`, 300, 60),
  ]);
  return results.every(Boolean);
}

/** The visitor's conversation, if the id really is theirs and it is still open. */
export async function findVisitorConversation(db: TenantDb, visitorId: string, conversationId: string | undefined) {
  if (!conversationId) return null;
  return db.conversation.findFirst({
    where: { id: conversationId, visitorId, channel: "web", status: { not: "closed" } },
  });
}

export const errorJson = (error: string, status: number) => Response.json({ error }, { status });

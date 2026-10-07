import { z } from "zod";
import { answerMessage } from "@/server/ai/answer";
import { getWorkspaceContext } from "@/server/auth/session";
import { rateLimit } from "@/server/limits/rate-limit";
import { sseResponse } from "@/server/realtime/sse";

const bodySchema = z.object({
  message: z.string().trim().min(1).max(2000),
  conversationId: z.string().min(1).max(64).optional(),
});

/**
 * POST /api/assistant/test — the dashboard's "Test your assistant" chat.
 * Streams the reply as Server-Sent Events:
 *   conversation {id}  →  token {text} …  →  done {confidence, answered, needsHuman, sources}
 * Test chats are stored as conversations flagged `isTest`, so they stay out of
 * the inbox, leads and statistics.
 */
export async function POST(request: Request) {
  const ctx = await getWorkspaceContext();
  if (!ctx) return Response.json({ error: "errors.unauthorized" }, { status: 401 });

  const parsed = bodySchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return Response.json({ error: "errors.generic" }, { status: 400 });

  if (!(await rateLimit(`test-chat:${ctx.user.id}`, 20, 60))) {
    return Response.json({ error: "errors.rateLimited" }, { status: 429 });
  }

  const { db, workspace, user } = ctx;
  // Continue the given test conversation if it is ours; otherwise start a new one.
  const existing = parsed.data.conversationId
    ? await db.conversation.findFirst({ where: { id: parsed.data.conversationId, isTest: true }, select: { id: true } })
    : null;
  const conversation =
    existing ??
    (await db.conversation.create({
      data: { workspaceId: workspace.id, visitorId: `test:${user.id}`, isTest: true, unread: false },
      select: { id: true },
    }));

  return sseResponse(async (send) => {
    send("conversation", { id: conversation.id });
    for await (const event of answerMessage({ workspaceId: workspace.id, conversationId: conversation.id, text: parsed.data.message })) {
      if (event.type === "token") send("token", { text: event.text });
      else {
        const { confidence, answered, needsHuman, skipped, sources, products } = event.result;
        send("done", { confidence, answered, needsHuman, skipped, sources, products: products.map((p) => p.name) });
      }
    }
  }, request);
}

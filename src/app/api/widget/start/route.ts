import { z } from "zod";
import { authenticateWidget, clientIp, errorJson, visitorIdSchema } from "@/server/widget/service";
import { rateLimit } from "@/server/limits/rate-limit";

const bodySchema = z.object({
  visitorId: visitorIdSchema,
  name: z.string().trim().min(1).max(80),
  phone: z
    .string()
    .trim()
    .regex(/^\+?[0-9][0-9\s-]{6,20}$/),
});

/**
 * POST /api/widget/start — the optional pre-chat form (name and phone).
 * Starts the conversation and records the visitor as a lead straight away.
 */
export async function POST(request: Request) {
  const widget = authenticateWidget(request);
  if (!widget) return errorJson("unauthorized", 401);

  const parsed = bodySchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return errorJson("invalid", 400);
  const { visitorId, name, phone } = parsed.data;

  if (!(await rateLimit(`start:${widget.workspaceId}:${clientIp(request)}`, 10, 600))) return errorJson("rate_limited", 429);

  const { db, workspaceId, preview } = widget;
  const conversation = await db.conversation.create({
    data: { workspaceId, visitorId, visitorName: name, visitorPhone: phone, isTest: preview, unread: false },
    select: { id: true },
  });
  // Preview chats from the dashboard are not real leads.
  if (!preview) await db.lead.create({ data: { workspaceId, conversationId: conversation.id, name, phone } });

  return Response.json({ conversationId: conversation.id });
}

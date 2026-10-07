import { z } from "zod";
import { getProducts, toCard } from "@/server/products";
import { authenticateWidget, conversationIdSchema, errorJson, findVisitorConversation, visitorIdSchema } from "@/server/widget/service";

const bodySchema = z.object({ visitorId: visitorIdSchema, conversationId: conversationIdSchema.optional() });

/**
 * POST /api/widget/session — restore the visitor's conversation when the widget
 * loads (same browser session). Returns the messages so far, or nothing if the
 * conversation is unknown, closed, or belongs to another visitor.
 */
export async function POST(request: Request) {
  const widget = authenticateWidget(request);
  if (!widget) return errorJson("unauthorized", 401);

  const parsed = bodySchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return errorJson("invalid", 400);

  const conversation = await findVisitorConversation(widget.db, parsed.data.visitorId, parsed.data.conversationId);
  if (!conversation) return Response.json({ conversationId: null, status: null, messages: [] });

  const messages = await widget.db.message.findMany({
    where: { conversationId: conversation.id, role: { not: "system" } },
    orderBy: { createdAt: "asc" },
    take: 200,
    select: { id: true, role: true, content: true, productIds: true },
  });

  // Product cards shown under earlier replies. Products deleted since then are left out.
  const cards = new Map((await getProducts(widget.db, [...new Set(messages.flatMap((m) => m.productIds))])).map((p) => [p.id, toCard(p)]));
  return Response.json({
    conversationId: conversation.id,
    status: conversation.status,
    messages: messages.map(({ productIds, ...m }) => ({ ...m, products: productIds.flatMap((id) => cards.get(id) ?? []) })),
  });
}

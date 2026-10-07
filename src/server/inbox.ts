import { encodeSystemEvent, type SystemEventCode } from "@/lib/system-events";
import type { TenantDb } from "@/server/db/tenant";
import { publish } from "@/server/realtime/bus";

/**
 * Inbox operations. Every function takes the workspace-scoped `db`, so it can
 * only see and change conversations of that workspace. Test chats from the
 * dashboard (`isTest`) never appear in the inbox.
 */

export const INBOX_FILTERS = ["all", "needs_human", "ai", "closed"] as const;
export type InboxFilter = (typeof INBOX_FILTERS)[number];

type Scope = { db: TenantDb; workspaceId: string };
type Agent = { id: string; name: string | null; email: string };

export class InboxError extends Error {
  constructor(public code: "not_found" | "not_taken_over" | "closed") {
    super(code);
    this.name = "InboxError";
  }
}

const FILTER_STATUS = {
  all: undefined,
  // "Needs human" covers both waiting for an agent and currently handled by one.
  needs_human: { in: ["needs_human", "human"] as ("needs_human" | "human")[] },
  ai: "ai" as const,
  closed: "closed" as const,
};

export async function listConversations({ db }: Scope, opts: { filter: InboxFilter; search?: string }) {
  const search = opts.search?.trim();
  const conversations = await db.conversation.findMany({
    where: {
      isTest: false,
      status: FILTER_STATUS[opts.filter],
      ...(search
        ? {
            OR: [
              { visitorName: { contains: search, mode: "insensitive" as const } },
              { visitorPhone: { contains: search } },
              { messages: { some: { role: { not: "system" as const }, content: { contains: search, mode: "insensitive" as const } } } },
            ],
          }
        : {}),
    },
    orderBy: { lastMessageAt: "desc" },
    take: 60,
    select: {
      id: true,
      channel: true,
      visitorId: true,
      visitorName: true,
      visitorPhone: true,
      status: true,
      unread: true,
      lastMessageAt: true,
      // Latest real message, for the preview line.
      messages: { where: { role: { not: "system" } }, orderBy: { createdAt: "desc" }, take: 1, select: { role: true, content: true } },
    },
  });

  return conversations.map(({ messages, ...c }) => ({ ...c, preview: messages[0] ?? null }));
}

/** How many conversations each filter tab holds, plus the unread total. */
export async function inboxCounts({ db }: Scope) {
  const [byStatus, unread] = await Promise.all([
    db.conversation.groupBy({ by: ["status"], where: { isTest: false }, _count: { _all: true } }),
    db.conversation.count({ where: { isTest: false, unread: true, status: { not: "closed" } } }),
  ]);
  const n = (status: string) => byStatus.find((row) => row.status === status)?._count._all ?? 0;
  return {
    all: byStatus.reduce((sum, row) => sum + row._count._all, 0),
    needs_human: n("needs_human") + n("human"),
    ai: n("ai"),
    closed: n("closed"),
    unread,
  };
}

/** One conversation with its messages. Opening it marks it as read. */
export async function getConversation(scope: Scope, id: string) {
  const { db, workspaceId } = scope;
  const conversation = await db.conversation.findFirst({
    where: { id, isTest: false },
    select: {
      id: true,
      channel: true,
      visitorId: true,
      visitorName: true,
      visitorPhone: true,
      status: true,
      unread: true,
      assignedAgentId: true,
      createdAt: true,
      lastMessageAt: true,
      leads: { take: 1, select: { name: true, phone: true, email: true, status: true } },
      messages: {
        orderBy: { createdAt: "asc" },
        take: 500,
        select: { id: true, role: true, content: true, confidence: true, answered: true, productIds: true, createdAt: true, author: { select: { name: true, email: true } } },
      },
    },
  });
  if (!conversation) return null;

  if (conversation.unread) {
    await db.conversation.update({ where: { id }, data: { unread: false } });
    await publish({ workspaceId, conversationId: id, type: "conversation" });
  }

  const assignedAgent = conversation.assignedAgentId
    ? await db.membership.findFirst({ where: { userId: conversation.assignedAgentId }, select: { user: { select: { name: true, email: true } } } })
    : null;
  // Names of the products shown as cards under each reply (deleted products are left out).
  const shownIds = [...new Set(conversation.messages.flatMap((m) => m.productIds))];
  const names = new Map(shownIds.length ? (await db.product.findMany({ where: { id: { in: shownIds } }, select: { id: true, name: true } })).map((p) => [p.id, p.name]) : []);

  const { leads, messages, ...rest } = conversation;
  return {
    ...rest,
    messages: messages.map(({ productIds, ...m }) => ({ ...m, products: productIds.flatMap((id) => names.get(id) ?? []) })),
    unread: false,
    lead: leads[0] ?? null,
    assignedAgent: assignedAgent?.user ?? null,
  };
}

async function requireConversation({ db }: Scope, id: string) {
  const conversation = await db.conversation.findFirst({ where: { id, isTest: false }, select: { id: true, status: true } });
  if (!conversation) throw new InboxError("not_found");
  return conversation;
}

/** Add a timeline marker and tell everyone watching. */
async function addSystemEvent({ db, workspaceId }: Scope, conversationId: string, code: SystemEventCode, detail?: string) {
  const message = await db.message.create({
    data: { workspaceId, conversationId, role: "system", content: encodeSystemEvent(code, detail) },
    select: { id: true },
  });
  await publish({ workspaceId, conversationId, type: "message", messageId: message.id });
  await publish({ workspaceId, conversationId, type: "conversation" });
}

const displayName = (agent: Agent) => agent.name?.trim() || agent.email.split("@")[0];

/** An agent takes the conversation: the AI stops replying until it is handed back. */
export async function takeOver(scope: Scope, id: string, agent: Agent) {
  const conversation = await requireConversation(scope, id);
  if (conversation.status === "closed") throw new InboxError("closed");
  await scope.db.conversation.update({ where: { id }, data: { status: "human", assignedAgentId: agent.id, unread: false } });
  await addSystemEvent(scope, id, "agent_joined", displayName(agent));
}

/** Hand the conversation back to the AI. */
export async function returnToAi(scope: Scope, id: string) {
  const conversation = await requireConversation(scope, id);
  if (conversation.status === "closed") throw new InboxError("closed");
  await scope.db.conversation.update({ where: { id }, data: { status: "ai", assignedAgentId: null } });
  await addSystemEvent(scope, id, "returned_to_ai");
}

export async function closeConversation(scope: Scope, id: string) {
  await requireConversation(scope, id);
  await scope.db.conversation.update({ where: { id }, data: { status: "closed", assignedAgentId: null, unread: false } });
  await addSystemEvent(scope, id, "closed");
}

/** Reopening puts the conversation back with the AI. */
export async function reopenConversation(scope: Scope, id: string) {
  await requireConversation(scope, id);
  await scope.db.conversation.update({ where: { id }, data: { status: "ai" } });
  await addSystemEvent(scope, id, "reopened");
}

/** A reply typed by an agent. Only allowed while the conversation is taken over. */
export async function sendAgentMessage(scope: Scope, id: string, agent: Agent, text: string) {
  const { db, workspaceId } = scope;
  const conversation = await requireConversation(scope, id);
  if (conversation.status !== "human") throw new InboxError("not_taken_over");

  const message = await db.message.create({
    data: { workspaceId, conversationId: id, role: "agent", content: text, authorId: agent.id },
    select: { id: true },
  });
  await db.conversation.update({ where: { id }, data: { lastMessageAt: new Date(), unread: false } });
  await publish({ workspaceId, conversationId: id, type: "message", messageId: message.id });
  return message.id;
}

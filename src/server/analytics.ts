import { prisma } from "@/server/db/prisma";
import type { TenantDb } from "@/server/db/tenant";

/**
 * Overview analytics.
 *
 * Counts go through the workspace-scoped client. The few queries that need raw
 * SQL (grouping by day, reading the pgvector column) take `workspaceId`
 * explicitly and filter on it in the SQL; they are covered by isolation tests.
 * Dashboard test chats (`isTest`) are excluded everywhere.
 */

/** Days are counted in UAE time, so "today" matches the business's day. */
export const ANALYTICS_TIME_ZONE = "Asia/Dubai";

const QUESTION_DIMENSIONS = 256;

/**
 * Shrink a text-embedding-3 vector for storage. These models are trained so that
 * the first N dimensions are a usable embedding on their own; after cutting, the
 * vector is re-normalised so a dot product is the cosine similarity.
 */
export function compactEmbedding(embedding: number[]): number[] {
  const head = embedding.slice(0, QUESTION_DIMENSIONS);
  const norm = Math.sqrt(head.reduce((sum, x) => sum + x * x, 0)) || 1;
  return head.map((x) => x / norm);
}

/** Store the question embedding of a customer message (raw SQL: Prisma cannot write vector columns). */
export async function saveQuestionEmbedding(workspaceId: string, messageId: string, embedding: number[]) {
  const vector = `[${compactEmbedding(embedding).join(",")}]`;
  await prisma.$executeRaw`
    UPDATE "Message" SET "questionEmbedding" = ${vector}::vector
    WHERE "id" = ${messageId} AND "workspaceId" = ${workspaceId} AND "role" = 'customer'`;
}

// ---------------------------------------------------------------- headline numbers

/** The instant today began in the UAE (UTC+4 all year; the UAE has no daylight saving). */
export function startOfTodayInUae(now = new Date()): Date {
  const offsetMs = 4 * 60 * 60 * 1000;
  const local = new Date(now.getTime() + offsetMs);
  return new Date(Date.UTC(local.getUTCFullYear(), local.getUTCMonth(), local.getUTCDate()) - offsetMs);
}

export async function overviewCounts(db: TenantDb) {
  const todayStart = startOfTodayInUae();

  const [byStatus, today, leads, newLeads] = await Promise.all([
    db.conversation.groupBy({ by: ["status"], where: { isTest: false }, _count: { _all: true } }),
    db.conversation.count({ where: { isTest: false, createdAt: { gte: todayStart } } }),
    db.lead.count(),
    db.lead.count({ where: { status: "new" } }),
  ]);
  const n = (status: string) => byStatus.find((row) => row.status === status)?._count._all ?? 0;

  return {
    total: byStatus.reduce((sum, row) => sum + row._count._all, 0),
    today,
    leads,
    newLeads,
    needsHuman: n("needs_human"),
    byStatus: { ai: n("ai"), needs_human: n("needs_human"), human: n("human"), closed: n("closed") },
  };
}

// ---------------------------------------------------------------- conversations per day

export type DailyCount = { day: string; conversations: number };

/** New conversations per day for the last `days` days (UAE time), including days with none. */
export async function conversationsPerDay(workspaceId: string, days = 14): Promise<DailyCount[]> {
  const rows = await prisma.$queryRaw<{ day: string; n: number }[]>`
    SELECT to_char(("createdAt" AT TIME ZONE 'UTC' AT TIME ZONE ${ANALYTICS_TIME_ZONE})::date, 'YYYY-MM-DD') AS day, count(*)::int AS n
    FROM "Conversation"
    WHERE "workspaceId" = ${workspaceId} AND "isTest" = false
      AND "createdAt" > now() - make_interval(days => ${days + 1})
    GROUP BY 1`;
  const counts = new Map(rows.map((r) => [r.day, r.n]));

  // Build the full range so quiet days show as zero instead of disappearing.
  const dayFormat = new Intl.DateTimeFormat("en-CA", { timeZone: ANALYTICS_TIME_ZONE }); // en-CA formats as YYYY-MM-DD
  const out: DailyCount[] = [];
  for (let i = days - 1; i >= 0; i--) {
    const day = dayFormat.format(new Date(Date.now() - i * 86_400_000));
    out.push({ day, conversations: counts.get(day) ?? 0 });
  }
  return out;
}

// ---------------------------------------------------------------- question groups

export type QuestionGroup = {
  /** The most recent wording of the question. */
  text: string;
  count: number;
  lastAsked: Date;
  /** Conversation of the most recent time it was asked. */
  conversationId: string;
};

type QuestionRow = { id: string; content: string; conversationId: string; createdAt: Date; answered: boolean | null; embedding: string };

/**
 * Above this similarity two messages count as the same question.
 * Measured on real 256-dimension text-embedding-3-small vectors: rewordings of one question
 * score about 0.62 to 0.82, unrelated questions 0.53 or less. Two limits to know about:
 * the same question in English and in Arabic scores about 0.55 and stays in separate groups,
 * and near-identical wording about different services ("how much is cleaning" / "how much
 * is whitening") can score above rewordings and be grouped together.
 */
const SAME_QUESTION = 0.6;

const dot = (a: number[], b: number[]) => {
  let sum = 0;
  for (let i = 0; i < a.length; i++) sum += a[i] * b[i];
  return sum;
};

/**
 * Group messages that ask the same thing. Greedy single pass, newest first:
 * each message joins the first group whose first member it resembles,
 * otherwise it starts a new group. Plenty for a few hundred messages.
 */
export function groupQuestions(rows: { content: string; conversationId: string; createdAt: Date; vector: number[] }[]): QuestionGroup[] {
  const groups: (QuestionGroup & { vector: number[] })[] = [];
  for (const row of rows) {
    const match = groups.find((g) => dot(g.vector, row.vector) >= SAME_QUESTION);
    if (match) match.count++;
    else groups.push({ text: row.content, count: 1, lastAsked: row.createdAt, conversationId: row.conversationId, vector: row.vector });
  }
  return groups
    .sort((a, b) => b.count - a.count || b.lastAsked.getTime() - a.lastAsked.getTime())
    .map((g) => ({ text: g.text, count: g.count, lastAsked: g.lastAsked, conversationId: g.conversationId }));
}

/**
 * Messages that should not appear in the question lists: a bare "hi", and anything
 * containing a phone number or email address. Those are customers giving their contact
 * details, and their personal data does not belong on a summary screen.
 */
export function looksLikeQuestion(text: string): boolean {
  const trimmed = text.trim();
  if (trimmed.length < 8) return false;
  if (/\d[\d\s-]{6,}\d/.test(trimmed) || /\S+@\S+\.\S+/.test(trimmed)) return false;
  const letters = trimmed.replace(/[^\p{L}]/gu, "").length;
  return letters >= trimmed.length * 0.5;
}

/**
 * The most-asked questions and the questions the knowledge base could not answer,
 * from the last 30 days of real customer messages.
 */
export async function questionInsights(workspaceId: string): Promise<{ top: QuestionGroup[]; unanswered: QuestionGroup[] }> {
  const rows = await prisma.$queryRaw<QuestionRow[]>`
    SELECT m."id", m."content", m."conversationId", m."createdAt", m."answered", m."questionEmbedding"::text AS "embedding"
    FROM "Message" m
    JOIN "Conversation" c ON c."id" = m."conversationId" AND c."workspaceId" = ${workspaceId}
    WHERE m."workspaceId" = ${workspaceId} AND c."isTest" = false
      AND m."role" = 'customer' AND m."questionEmbedding" IS NOT NULL
      AND m."createdAt" > now() - interval '30 days'
    ORDER BY m."createdAt" DESC
    LIMIT 400`;

  const questions = rows
    .filter((r) => looksLikeQuestion(r.content))
    .map((r) => ({ ...r, vector: JSON.parse(r.embedding) as number[] }));

  return {
    top: groupQuestions(questions).slice(0, 10),
    unanswered: groupQuestions(questions.filter((q) => q.answered === false)).slice(0, 10),
  };
}

import { searchChunks, type ChunkMatch } from "@/server/db/chunks";
import { saveQuestionEmbedding } from "@/server/analytics";
import { tenantDb } from "@/server/db/tenant";
import { getAiMessagesUsed, recordAiMessage } from "@/server/limits/usage";
import { publish } from "@/server/realtime/bus";
import { embedTexts, streamChat } from "./openai";
import { buildMessages, buildSystemPrompt, parseHeader, type ReplyHeader } from "./prompt";

/**
 * The AI answering service.
 *
 * This is the single entry point for every channel. The web widget, the
 * dashboard's "Test your assistant" box and (later) WhatsApp or Instagram all
 * call `answerMessage` with a conversation and the customer's text; none of
 * them contain any AI logic of their own.
 */

export type AnswerResult = {
  /** The reply saved to the conversation; null when the AI is paused for human takeover. */
  reply: string | null;
  messageId: string | null;
  /** 0..1. Low when the knowledge base did not cover the question. */
  confidence: number;
  answered: boolean;
  needsHuman: boolean;
  /** Why no model call was made, if none was. */
  skipped: null | "human_takeover" | "usage_limit" | "error";
  leadCaptured: boolean;
  sources: { title: string; url: string | null; similarity: number }[];
};

export type AnswerEvent = { type: "token"; text: string } | { type: "done"; result: AnswerResult };

const HISTORY_MESSAGES = 12;
const MAX_MESSAGE_CHARS = 2000;

const hasArabic = (text: string) => /[؀-ۿ]/.test(text);

/** Replies that do not come from the model. Shown in the customer's language. */
function fallbackReply(kind: "usage_limit" | "error", customerText: string, w: { phone: string | null; whatsapp: string | null }) {
  const contact = [w.phone, w.whatsapp && w.whatsapp !== w.phone ? `WhatsApp ${w.whatsapp}` : null].filter(Boolean).join(" / ");
  if (hasArabic(customerText)) {
    const lead = kind === "usage_limit" ? "المساعد الآلي غير متاح حالياً." : "عذراً، حدثت مشكلة مؤقتة.";
    return contact
      ? `${lead} يمكنك التواصل مع فريقنا مباشرة على ${contact}، أو اترك اسمك ورقم هاتفك وسنعاود الاتصال بك.`
      : `${lead} يرجى ترك اسمك ورقم هاتفك وسيتواصل معك فريقنا في أقرب وقت.`;
  }
  const lead = kind === "usage_limit" ? "Our assistant is unavailable at the moment." : "Sorry, something went wrong on our side.";
  return contact
    ? `${lead} You can reach our team directly on ${contact}, or leave your name and phone number and we will get back to you.`
    : `${lead} Please leave your name and phone number and our team will get back to you shortly.`;
}

/**
 * Confidence signal: the model's own report of whether the knowledge covered
 * the question, tempered by how close the best retrieved chunk actually was.
 * (With text-embedding-3-small, on-topic matches score roughly 0.35–0.75.)
 */
function confidenceScore(header: ReplyHeader, chunks: ChunkMatch[]): number {
  if (!header.answered) return 0.15;
  const top = chunks[0]?.similarity ?? 0;
  return Math.round(Math.min(0.95, Math.max(0.4, 0.5 + (top - 0.25) * 1.25)) * 100) / 100;
}

export async function* answerMessage(input: {
  workspaceId: string;
  conversationId: string;
  text: string;
}): AsyncGenerator<AnswerEvent> {
  const { workspaceId, conversationId } = input;
  const text = input.text.trim().slice(0, MAX_MESSAGE_CHARS);
  const db = tenantDb(workspaceId);
  /** Tell the inbox (and the customer's widget) that the conversation changed. */
  const announce = async (messageId: string) => {
    await publish({ workspaceId, conversationId, type: "message", messageId });
    await publish({ workspaceId, conversationId, type: "conversation" });
  };

  // tenantDb guarantees the conversation belongs to this workspace.
  const conversation = await db.conversation.findUnique({ where: { id: conversationId } });
  if (!conversation) throw new Error("Conversation not found in this workspace");

  const history = await db.message.findMany({
    where: { conversationId },
    orderBy: { createdAt: "desc" },
    take: HISTORY_MESSAGES,
    select: { role: true, content: true, answered: true },
  });
  history.reverse();

  const customerMessage = await db.message.create({ data: { workspaceId, conversationId, role: "customer", content: text } });
  await db.conversation.update({ where: { id: conversationId }, data: { lastMessageAt: new Date(), unread: true } });
  await announce(customerMessage.id);

  const base: AnswerResult = {
    reply: null, messageId: null, confidence: 0, answered: false, needsHuman: false, skipped: null, leadCaptured: false, sources: [],
  };

  // Human takeover: an agent is handling this conversation, so the AI stays silent.
  if (conversation.status === "human") {
    yield { type: "done", result: { ...base, skipped: "human_takeover", needsHuman: true } };
    return;
  }

  const workspace = await db.workspace.findFirstOrThrow({ include: { plan: true, assistantSettings: true } });

  /** Save a non-model reply and finish. */
  const finishWithFallback = async function* (kind: "usage_limit" | "error"): AsyncGenerator<AnswerEvent> {
    const reply = fallbackReply(kind, text, workspace);
    const message = await db.message.create({
      data: { workspaceId, conversationId, role: "assistant", content: reply, confidence: 0, answered: false },
    });
    await db.conversation.update({ where: { id: conversationId }, data: { status: "needs_human", lastMessageAt: new Date() } });
    await announce(message.id);
    yield { type: "token", text: reply };
    yield { type: "done", result: { ...base, reply, messageId: message.id, needsHuman: true, skipped: kind } };
  };

  // Plan limit reached: do not call the model; point the customer to the team instead.
  if ((await getAiMessagesUsed(db)) >= workspace.plan.monthlyMessages) {
    yield* finishWithFallback("usage_limit");
    return;
  }

  let chunks: ChunkMatch[] = [];
  let header: ReplyHeader | null = null;
  let reply = "";

  try {
    // Include the previous customer message so follow-ups like "how much is it?" still retrieve well.
    const previous = [...history].reverse().find((m) => m.role === "customer")?.content;
    // One API call embeds both the retrieval query and the bare question.
    const embeddings = await embedTexts(previous ? [`${previous}\n${text}`, text] : [text]);
    const [found] = await Promise.all([
      searchChunks(workspaceId, embeddings[0]),
      // Keep the question's own embedding so the overview can group similar questions. It runs
      // alongside the search (no added wait) and, being analytics only, a failure here must
      // never stop the customer getting an answer.
      saveQuestionEmbedding(workspaceId, customerMessage.id, embeddings.at(-1)!).catch((err) =>
        console.error("[ai] could not store question embedding", err),
      ),
    ]);
    chunks = found.sort((a, b) => b.similarity - a.similarity);

    const assistant = workspace.assistantSettings ?? { assistantName: "Assistant", tone: "friendly" as const, extraInstructions: "" };
    const messages = buildMessages(buildSystemPrompt(workspace, assistant, chunks, text), history, text);

    // The model's output starts with the JSON header; everything after it is the reply.
    let pending = "";
    let headerDone = false;
    for await (const piece of streamChat(messages)) {
      let out = piece;
      if (!headerDone) {
        pending += piece;
        out = pending;
        if (pending.trimStart().startsWith("{")) {
          // The header is a flat JSON object, so it ends at the first "}". Models sometimes
          // forget the newline after it, so the brace (not the newline) marks the end.
          // A line that starts like a header but never closes is dropped at the newline,
          // so raw JSON never reaches the customer.
          const brace = pending.indexOf("}");
          const end = brace !== -1 ? brace : pending.indexOf("\n");
          if (end === -1 && pending.length < 600) continue; // header still arriving
          if (end !== -1) {
            if (brace !== -1) header = parseHeader(pending.slice(0, brace + 1));
            out = pending.slice(end + 1);
          }
        }
        headerDone = true;
      }
      // Skip blank space between the header and the first word.
      if (!reply) out = out.replace(/^\s+/, "");
      if (out) {
        reply += out;
        yield { type: "token", text: out };
      }
    }
    // The stream ended while we were still waiting for a header to finish: nothing usable arrived
    // (reply stays empty and is reported as an error below).
    if (!headerDone) header = parseHeader(pending);
    reply = reply.trim();
    if (!reply) throw new Error("Model returned an empty reply");
  } catch (err) {
    console.error(`[ai] answering failed for conversation ${conversationId}`, err);
    if (reply) {
      // Part of the answer was already shown to the customer: keep it rather than contradicting it.
      const message = await db.message.create({
        data: { workspaceId, conversationId, role: "assistant", content: reply.trim(), confidence: 0, answered: false },
      });
      await db.conversation.update({ where: { id: conversationId }, data: { status: "needs_human", lastMessageAt: new Date() } });
      await announce(message.id);
      yield { type: "done", result: { ...base, reply: reply.trim(), messageId: message.id, needsHuman: true, skipped: "error" } };
    } else {
      yield* finishWithFallback("error");
    }
    return;
  }

  // No valid header: fall back to retrieval strength alone.
  header ??= { answered: (chunks[0]?.similarity ?? 0) >= 0.3, wants_human: false, name: null, phone: null, email: null };
  const confidence = confidenceScore(header, chunks);
  const needsHuman = header.wants_human || !header.answered;

  const message = await db.message.create({
    data: { workspaceId, conversationId, role: "assistant", content: reply, confidence, answered: header.answered },
  });
  // Mark the question itself too, so "unanswered questions" can be listed without pairing rows.
  await db.message.update({ where: { id: customerMessage.id }, data: { answered: header.answered } });

  // Lead capture: contact details the customer has shared. One lead per conversation, updated as more arrives.
  let leadCaptured = false;
  if (!conversation.isTest && (header.phone || header.email)) {
    const details = { name: header.name ?? undefined, phone: header.phone ?? undefined, email: header.email ?? undefined };
    const existing = await db.lead.findFirst({ where: { conversationId }, select: { id: true } });
    if (existing) await db.lead.update({ where: { id: existing.id }, data: details });
    else await db.lead.create({ data: { workspaceId, conversationId, ...details } });
    leadCaptured = !existing;
  }

  await db.conversation.update({
    where: { id: conversationId },
    data: {
      lastMessageAt: new Date(),
      ...(needsHuman ? { status: "needs_human" as const } : {}),
      ...(header.name ? { visitorName: header.name } : {}),
      ...(header.phone ? { visitorPhone: header.phone } : {}),
    },
  });
  await recordAiMessage(db, workspaceId);
  await announce(message.id);

  yield {
    type: "done",
    result: {
      reply, messageId: message.id, confidence, answered: header.answered, needsHuman, skipped: null, leadCaptured,
      sources: chunks.slice(0, 3).map((c) => ({ title: c.sourceTitle, url: c.url, similarity: Math.round(c.similarity * 100) / 100 })),
    },
  };
}

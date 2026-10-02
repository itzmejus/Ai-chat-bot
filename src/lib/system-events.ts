/**
 * System messages mark events in a conversation's timeline ("an agent joined").
 * They are stored as short codes rather than sentences, so the inbox and the
 * widget can each show them in the reader's language.
 *
 * Stored form: "event:<code>" or "event:<code>|<detail>", e.g. "event:agent_joined|Sara".
 */

export const SYSTEM_EVENT_CODES = ["human_requested", "agent_joined", "returned_to_ai", "closed", "reopened"] as const;
export type SystemEventCode = (typeof SYSTEM_EVENT_CODES)[number];

export function encodeSystemEvent(code: SystemEventCode, detail?: string): string {
  return detail ? `event:${code}|${detail.replace(/\|/g, " ")}` : `event:${code}`;
}

export function decodeSystemEvent(content: string): { code: SystemEventCode; detail: string | null } | null {
  const match = /^event:([a-z_]+)(?:\|([\s\S]*))?$/.exec(content);
  if (!match || !(SYSTEM_EVENT_CODES as readonly string[]).includes(match[1])) return null;
  return { code: match[1] as SystemEventCode, detail: match[2] ?? null };
}

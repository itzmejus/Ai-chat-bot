/**
 * Languages the chat widget's own text (buttons, hints, notices) is available in.
 * The assistant itself replies in whatever language the customer writes; this list only
 * covers the widget's fixed wording. No imports: the widget bundles this file.
 */
export const CHAT_LOCALES = ["en", "ar", "fr", "hi", "ur", "ru"] as const;
export type ChatLocale = (typeof CHAT_LOCALES)[number];

/** Written right to left. */
export const isRtlLocale = (locale: ChatLocale) => locale === "ar" || locale === "ur";

/** A browser language tag such as "fr-CA" to one of ours, or null when we do not have it. */
export function chatLocaleFromTag(tag: string | undefined | null): ChatLocale | null {
  const base = (tag ?? "").toLowerCase().split("-")[0];
  return (CHAT_LOCALES as readonly string[]).includes(base) ? (base as ChatLocale) : null;
}

const ARABIC_SCRIPT = /[؀-ۿ]/;
/** Letters Urdu uses that Arabic does not. */
const URDU_LETTERS = /[ٹڈڑںھہے]/;
const DEVANAGARI = /[ऀ-ॿ]/;
const CYRILLIC = /[Ѐ-ӿ]/;
const FRENCH_LETTERS = /[àâçèéêëîïôùûœ]/i;
const LATIN_WORD = /[A-Za-z]{2,}/;

/**
 * The widget follows the customer: guess the language of what they typed from its script.
 * `current` is kept when the text gives no clear signal (an emoji, a number).
 */
export function detectChatLocale(text: string, current: ChatLocale): ChatLocale {
  if (DEVANAGARI.test(text)) return "hi";
  if (CYRILLIC.test(text)) return "ru";
  if (ARABIC_SCRIPT.test(text)) return URDU_LETTERS.test(text) || current === "ur" ? "ur" : "ar";
  if (FRENCH_LETTERS.test(text)) return "fr";
  // Plain Latin letters could be English or French: stay in French if that is where we are.
  if (LATIN_WORD.test(text)) return current === "fr" ? "fr" : "en";
  return current;
}

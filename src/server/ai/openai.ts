import OpenAI from "openai";

export const EMBEDDING_MODEL = "text-embedding-3-small";
export const EMBEDDING_DIMENSIONS = 1536;
/** Chat model for answers; configurable via OPENAI_MODEL. */
export const chatModel = () => process.env.OPENAI_MODEL || "gpt-4o-mini";

export class MissingOpenAIKeyError extends Error {
  constructor() {
    super("OPENAI_API_KEY is not set");
    this.name = "MissingOpenAIKeyError";
  }
}

let client: OpenAI | undefined;

export function getOpenAI(): OpenAI {
  if (!process.env.OPENAI_API_KEY) throw new MissingOpenAIKeyError();
  client ??= new OpenAI({ apiKey: process.env.OPENAI_API_KEY, maxRetries: 3, timeout: 60_000 });
  return client;
}

/** Embed texts in batches. The result is in the same order as the input. */
export async function embedTexts(texts: string[]): Promise<number[][]> {
  const BATCH = 96;
  const out: number[][] = [];
  for (let i = 0; i < texts.length; i += BATCH) {
    const res = await getOpenAI().embeddings.create({
      model: EMBEDDING_MODEL,
      input: texts.slice(i, i + BATCH),
    });
    // The API documents `index` rather than guaranteeing order.
    for (const item of [...res.data].sort((a, b) => a.index - b.index)) out.push(item.embedding);
  }
  return out;
}

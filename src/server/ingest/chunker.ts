import { getEncoding, type Tiktoken } from "js-tiktoken";

export type TextChunk = { content: string; tokenCount: number };

let encoder: Tiktoken | undefined;

/** Token count as OpenAI's embedding and chat models see it. */
export function countTokens(text: string): number {
  encoder ??= getEncoding("cl100k_base");
  return encoder.encode(text).length;
}

// Sentence ends in English and Arabic.
const SENTENCE_BREAK = /(?<=[.!?؟。])\s+/;

/** Break text into pieces no larger than `maxTokens`, preferring natural boundaries. */
function toSegments(text: string, maxTokens: number): TextChunk[] {
  const segments: TextChunk[] = [];

  const add = (piece: string, splitter?: (s: string) => string[]) => {
    const content = piece.trim();
    if (!content) return;
    const tokenCount = countTokens(content);
    if (tokenCount <= maxTokens) {
      segments.push({ content, tokenCount });
    } else if (splitter) {
      for (const part of splitter(content)) add(part, part === content ? undefined : splitter);
    } else {
      // No natural boundary left: cut by length.
      const parts = Math.ceil(tokenCount / maxTokens) + 1;
      const size = Math.ceil(content.length / parts);
      for (let i = 0; i < content.length; i += size) add(content.slice(i, i + size));
    }
  };

  for (const line of text.split(/\n+/)) {
    add(line, (s) => {
      const sentences = s.split(SENTENCE_BREAK);
      return sentences.length > 1 ? sentences : [s]; // single "sentence" falls through to the length cut
    });
  }
  return segments;
}

/**
 * Split text into overlapping chunks for embedding.
 *
 * Chunks are closed once they reach `targetTokens` and never exceed `maxTokens`.
 * Each chunk starts with the tail of the previous one (`overlapTokens`), so a
 * fact that straddles a boundary is still retrievable.
 */
export function chunkText(
  text: string,
  { targetTokens = 600, maxTokens = 800, overlapTokens = 80 } = {},
): TextChunk[] {
  // Leave room for the overlap that is prepended to each chunk.
  const segments = toSegments(text, maxTokens - overlapTokens);
  const chunks: TextChunk[] = [];

  let current: TextChunk[] = [];
  let tokens = 0;
  let fresh = 0; // segments in `current` that are not overlap

  const emit = () => {
    if (fresh === 0) return;
    chunks.push({ content: current.map((s) => s.content).join("\n"), tokenCount: tokens });

    const overlap: TextChunk[] = [];
    let overlapSize = 0;
    for (let i = current.length - 1; i >= 0 && overlapSize + current[i].tokenCount <= overlapTokens; i--) {
      overlap.unshift(current[i]);
      overlapSize += current[i].tokenCount;
    }
    current = overlap;
    tokens = overlapSize;
    fresh = 0;
  };

  for (const segment of segments) {
    if (tokens + segment.tokenCount > maxTokens) emit();
    current.push(segment);
    tokens += segment.tokenCount;
    fresh++;
    if (tokens >= targetTokens) emit();
  }
  emit();

  return chunks;
}

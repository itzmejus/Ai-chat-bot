import { cleanText } from "./html";

export const MAX_UPLOAD_BYTES = 10 * 1024 * 1024;
export const UPLOAD_EXTENSIONS = ["pdf", "docx", "txt"] as const;
const MAX_TEXT_CHARS = 600_000;

/** Thrown with a code the dashboard can translate. */
export class FileParseError extends Error {
  constructor(public code: "unsupported" | "tooLarge" | "noText" | "unreadable") {
    super(code);
    this.name = "FileParseError";
  }
}

/**
 * Extract plain text from an uploaded PDF, DOCX or TXT file. The file itself is
 * not stored anywhere: only the returned text is kept.
 */
export async function extractFileText(fileName: string, bytes: Uint8Array): Promise<string> {
  if (bytes.byteLength > MAX_UPLOAD_BYTES) throw new FileParseError("tooLarge");
  const ext = fileName.toLowerCase().split(".").pop();

  let text: string;
  try {
    if (ext === "pdf") {
      const { extractText } = await import("unpdf");
      // unpdf takes ownership of the buffer, so hand it a copy.
      text = (await extractText(new Uint8Array(bytes), { mergePages: true })).text;
    } else if (ext === "docx") {
      const mammoth = await import("mammoth");
      text = (await mammoth.extractRawText({ buffer: Buffer.from(bytes) })).value;
    } else if (ext === "txt") {
      text = new TextDecoder("utf-8").decode(bytes);
    } else {
      throw new FileParseError("unsupported");
    }
  } catch (err) {
    if (err instanceof FileParseError) throw err;
    console.error(`[ingest] could not parse ${ext} upload`, err);
    throw new FileParseError("unreadable");
  }

  // Postgres text columns cannot hold NUL bytes.
  text = cleanText(text.replaceAll("\u0000", "")).slice(0, MAX_TEXT_CHARS);
  // Scanned PDFs are images with no text layer.
  if (text.length < 20) throw new FileParseError("noText");
  return text;
}

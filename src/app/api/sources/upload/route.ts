import { revalidatePath } from "next/cache";
import { getWorkspaceContext } from "@/server/auth/session";
import { extractFileText, FileParseError, MAX_UPLOAD_BYTES } from "@/server/ingest/parsers";
import { addFileSource, KnowledgeLimitError } from "@/server/knowledge";

/**
 * POST /api/sources/upload — multipart upload of a PDF, DOCX or TXT file.
 * Text is extracted here; chunking and embedding happen in the background job.
 * Errors are returned as translation keys.
 */
export async function POST(request: Request) {
  const ctx = await getWorkspaceContext();
  if (!ctx) return Response.json({ error: "errors.unauthorized" }, { status: 401 });

  // Reject oversized bodies before reading them into memory.
  if (Number(request.headers.get("content-length") ?? 0) > MAX_UPLOAD_BYTES + 100_000) {
    return Response.json({ error: "knowledge.errors.tooLarge" }, { status: 413 });
  }

  let file: FormDataEntryValue | null;
  try {
    file = (await request.formData()).get("file");
  } catch {
    return Response.json({ error: "knowledge.errors.noFile" }, { status: 400 });
  }
  if (!(file instanceof File) || file.size === 0) {
    return Response.json({ error: "knowledge.errors.noFile" }, { status: 400 });
  }

  try {
    const name = file.name.slice(0, 200);
    const text = await extractFileText(name, new Uint8Array(await file.arrayBuffer()));
    await addFileSource(
      { workspaceId: ctx.workspace.id, db: ctx.db, maxPages: ctx.workspace.plan.maxKnowledgePages },
      name,
      text,
    );
  } catch (err) {
    if (err instanceof FileParseError) return Response.json({ error: `knowledge.errors.${err.code}` }, { status: 400 });
    if (err instanceof KnowledgeLimitError) return Response.json({ error: "errors.knowledgeLimit" }, { status: 403 });
    console.error("[knowledge] upload failed", err);
    return Response.json({ error: "errors.generic" }, { status: 500 });
  }

  revalidatePath("/dashboard/knowledge");
  return Response.json({ ok: true });
}

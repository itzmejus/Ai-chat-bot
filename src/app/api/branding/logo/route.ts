import { revalidatePath } from "next/cache";
import { getWorkspaceContext } from "@/server/auth/session";
import { StorageError } from "@/server/storage";
import { LogoError, MAX_LOGO_BYTES, removeWidgetLogo, saveWidgetLogo } from "@/server/widget/logo";

const error = (key: string, status: number) => Response.json({ error: key }, { status });

async function owner() {
  const ctx = await getWorkspaceContext();
  if (!ctx) return error("errors.unauthorized", 401);
  if (ctx.role !== "owner") return error("errors.ownerOnly", 403);
  return ctx;
}

/** POST /api/branding/logo — upload the widget logo (multipart, field `file`). Answers { url }. */
export async function POST(request: Request) {
  const ctx = await owner();
  if (ctx instanceof Response) return ctx;
  // Reject oversized bodies before reading them into memory.
  if (Number(request.headers.get("content-length") ?? 0) > MAX_LOGO_BYTES + 100_000) return error("errors.logoTooLarge", 413);

  let file: FormDataEntryValue | null;
  try {
    file = (await request.formData()).get("file");
  } catch {
    return error("errors.generic", 400);
  }
  if (!(file instanceof File) || file.size === 0) return error("errors.logoUnsupported", 400);

  try {
    const url = await saveWidgetLogo(ctx.workspace.id, ctx.db, new Uint8Array(await file.arrayBuffer()));
    revalidatePath("/dashboard/widget");
    return Response.json({ ok: true, url });
  } catch (err) {
    if (err instanceof LogoError) return error(`errors.${err.code}`, 400);
    if (err instanceof StorageError) return error("errors.logoStorage", err.code === "notConfigured" ? 400 : 502);
    console.error("[logo] upload failed", err);
    return error("errors.generic", 500);
  }
}

/** DELETE /api/branding/logo — remove the logo and go back to the default icon. */
export async function DELETE() {
  const ctx = await owner();
  if (ctx instanceof Response) return ctx;
  await removeWidgetLogo(ctx.workspace.id, ctx.db);
  revalidatePath("/dashboard/widget");
  return Response.json({ ok: true });
}

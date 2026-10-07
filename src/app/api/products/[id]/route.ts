import { revalidatePath } from "next/cache";
import { getWorkspaceContext } from "@/server/auth/session";
import { deleteProduct, setProductAvailable, updateProduct } from "@/server/products";
import { productError, productFailure, readProductForm } from "@/server/products-http";

/**
 * PATCH /api/products/[id]
 *   - multipart form: change the product (same fields as creating one; `image` replaces
 *     the photo, `removeImage=true` clears it)
 *   - JSON {available}: switch it on or off from the list
 */
export async function PATCH(request: Request, ctx: RouteContext<"/api/products/[id]">) {
  const workspace = await getWorkspaceContext();
  if (!workspace) return productError("errors.unauthorized", 401);
  const { id } = await ctx.params;
  const scope = { workspaceId: workspace.workspace.id, db: workspace.db };

  try {
    if (request.headers.get("content-type")?.includes("application/json")) {
      const body = (await request.json().catch(() => null)) as { available?: unknown } | null;
      if (typeof body?.available !== "boolean") return productError("errors.generic", 400);
      await setProductAvailable(scope, id, body.available);
    } else {
      const form = await readProductForm(request);
      if (form instanceof Response) return form;
      await updateProduct(scope, id, form.input, { image: form.image, removeImage: form.removeImage });
    }
    revalidatePath("/dashboard/products");
    return Response.json({ ok: true });
  } catch (err) {
    return productFailure(err);
  }
}

/** DELETE /api/products/[id] */
export async function DELETE(_request: Request, ctx: RouteContext<"/api/products/[id]">) {
  const workspace = await getWorkspaceContext();
  if (!workspace) return productError("errors.unauthorized", 401);
  const { id } = await ctx.params;
  await deleteProduct({ workspaceId: workspace.workspace.id, db: workspace.db }, id);
  revalidatePath("/dashboard/products");
  return Response.json({ ok: true });
}

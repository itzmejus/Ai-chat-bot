import { revalidatePath } from "next/cache";
import { getWorkspaceContext } from "@/server/auth/session";
import { createProduct } from "@/server/products";
import { productError, productFailure, readProductForm } from "@/server/products-http";

/** POST /api/products — add a product (multipart form, optional `image` file). */
export async function POST(request: Request) {
  const ctx = await getWorkspaceContext();
  if (!ctx) return productError("errors.unauthorized", 401);

  const form = await readProductForm(request);
  if (form instanceof Response) return form;

  try {
    const product = await createProduct({ workspaceId: ctx.workspace.id, db: ctx.db }, form.input, form.image);
    revalidatePath("/dashboard/products");
    return Response.json({ ok: true, id: product.id });
  } catch (err) {
    return productFailure(err);
  }
}

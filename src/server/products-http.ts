import { MissingOpenAIKeyError } from "@/server/ai/openai";
import { MAX_IMAGE_BYTES, ProductError, productSchema, type ProductInput } from "@/server/products";
import { StorageError } from "@/server/storage";

/**
 * Shared by the product API routes: reading the multipart form and turning
 * failures into responses. Errors are returned as translation keys.
 */

export type ProductForm = { input: ProductInput; image?: Uint8Array; removeImage: boolean };

export const productError = (error: string, status: number, fieldErrors?: Record<string, string>) => Response.json({ error, fieldErrors }, { status });

/** Read and validate the product form. Returns a Response when something is wrong with it. */
export async function readProductForm(request: Request): Promise<ProductForm | Response> {
  // Reject oversized bodies before reading them into memory.
  if (Number(request.headers.get("content-length") ?? 0) > MAX_IMAGE_BYTES + 200_000) return productError("products.errors.imageTooLarge", 413);

  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return productError("errors.generic", 400);
  }
  const text = (name: string) => {
    const value = form.get(name);
    return typeof value === "string" ? value : "";
  };

  const parsed = productSchema.safeParse({
    name: text("name"),
    description: text("description"),
    category: text("category"),
    price: text("price"),
    url: text("url"),
    available: text("available") !== "false",
  });
  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) fieldErrors[issue.path.join(".")] ??= issue.message;
    return productError("products.errors.check", 400, fieldErrors);
  }

  const file = form.get("image");
  const image = file instanceof File && file.size > 0 ? new Uint8Array(await file.arrayBuffer()) : undefined;
  return { input: parsed.data, image, removeImage: text("removeImage") === "true" };
}

/** Map a failure from the product service to a response. */
export function productFailure(err: unknown): Response {
  if (err instanceof ProductError) {
    if (err.code === "notFound") return productError("products.errors.notFound", 404);
    if (err.code === "limit") return productError("products.errors.limit", 403);
    return productError(`products.errors.${err.code}`, 400);
  }
  if (err instanceof StorageError) return productError(err.code === "notConfigured" ? "products.errors.storageNotConfigured" : "products.errors.storageFailed", err.code === "notConfigured" ? 400 : 502);
  if (err instanceof MissingOpenAIKeyError) return productError("knowledge.errors.openaiKey", 500);
  console.error("[products] request failed", err);
  return productError("errors.generic", 500);
}

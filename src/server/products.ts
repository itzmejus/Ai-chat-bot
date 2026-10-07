import { randomUUID } from "node:crypto";
import { z } from "zod";
import { embedTexts } from "@/server/ai/openai";
import { prisma } from "@/server/db/prisma";
import type { TenantDb } from "@/server/db/tenant";
import { deleteImages, uploadImage } from "@/server/storage";

/**
 * Products: what a business sells (products, services or menu items).
 *
 * Each product is embedded when it is saved, so the assistant can find the ones a
 * customer is asking about. Functions take the workspace-scoped `db`; the two that
 * need raw SQL for the vector column take `workspaceId` and filter on it in the SQL.
 */

/** A generous ceiling per workspace; plan-based limits come with AI import. */
export const MAX_PRODUCTS = 500;
export const MAX_IMAGE_BYTES = 8 * 1024 * 1024;

export class ProductError extends Error {
  constructor(public code: "notFound" | "limit" | "imageUnsupported" | "imageTooLarge") {
    super(code);
    this.name = "ProductError";
  }
}

type Scope = { workspaceId: string; db: TenantDb };

const optionalText = (max: number) =>
  z
    .string()
    .trim()
    .max(max, "errors.tooLong")
    .transform((v) => v || null);

/** Form input. Error messages are translation keys. */
export const productSchema = z.object({
  name: z.string().trim().min(1, "errors.required").max(120, "errors.tooLong"),
  description: z.string().trim().max(2000, "errors.tooLong"),
  category: optionalText(60),
  /** Typed as "900" or "49.50"; stored in the smallest unit. Empty means no price is shown. */
  price: z
    .string()
    .trim()
    .refine((v) => v === "" || /^\d{1,7}([.,]\d{1,2})?$/.test(v), "products.errors.price")
    .transform((v) => (v === "" ? null : Math.round(Number(v.replace(",", ".")) * 100))),
  url: z
    .string()
    .trim()
    .max(500, "errors.tooLong")
    .transform((v) => (v && !/^https?:\/\//i.test(v) ? `https://${v}` : v))
    .refine((v) => {
      if (v === "") return true;
      try {
        return new URL(v).hostname.includes(".");
      } catch {
        return false;
      }
    }, "errors.url")
    .transform((v) => v || null),
  available: z.boolean(),
});
export type ProductInput = z.output<typeof productSchema>;

const SELECT = {
  id: true,
  name: true,
  description: true,
  category: true,
  priceMinor: true,
  currency: true,
  imageUrl: true,
  url: true,
  available: true,
  createdAt: true,
} as const;

export type ProductRow = {
  id: string;
  name: string;
  description: string;
  category: string | null;
  priceMinor: number | null;
  currency: string;
  imageUrl: string | null;
  url: string | null;
  available: boolean;
};

/** What the chat widget receives for a product card. Everything here is public. */
export type ProductCard = {
  id: string;
  name: string;
  description: string;
  category: string | null;
  /** In the currency's main unit (900 or 49.5), or null when no price is shown. */
  price: number | null;
  currency: string;
  imageUrl: string | null;
  url: string | null;
  available: boolean;
};

export const toCard = (p: ProductRow): ProductCard => ({
  id: p.id,
  name: p.name,
  description: p.description,
  category: p.category,
  price: p.priceMinor === null ? null : p.priceMinor / 100,
  currency: p.currency,
  imageUrl: p.imageUrl,
  url: p.url,
  available: p.available,
});

/** "AED 900" or "AED 49.50". Used in the prompt and in emails; the widget formats prices itself. */
export function formatPrice(priceMinor: number | null, currency: string): string | null {
  if (priceMinor === null) return null;
  const value = priceMinor / 100;
  return `${currency} ${Number.isInteger(value) ? value : value.toFixed(2)}`;
}

/** The text a product is found by: what a customer might ask for. */
export function productText(p: Pick<ProductRow, "name" | "description" | "category" | "priceMinor" | "currency">): string {
  return [`Product: ${p.name}`, p.category && `Category: ${p.category}`, formatPrice(p.priceMinor, p.currency) && `Price: ${formatPrice(p.priceMinor, p.currency)}`, p.description]
    .filter(Boolean)
    .join("\n");
}

/** Embed a product and store the vector (raw SQL: Prisma cannot write vector columns). */
async function indexProduct(workspaceId: string, product: ProductRow) {
  const [embedding] = await embedTexts([productText(product)]);
  await prisma.$executeRaw`
    UPDATE "Product" SET "embedding" = ${`[${embedding.join(",")}]`}::vector
    WHERE "id" = ${product.id} AND "workspaceId" = ${workspaceId}`;
}

/**
 * Check an uploaded photo and turn it into a web-sized WebP: phone photos are
 * several megabytes and often rotated, and visitors load these inside a small chat window.
 */
export async function prepareImage(bytes: Uint8Array): Promise<Uint8Array> {
  if (bytes.byteLength > MAX_IMAGE_BYTES) throw new ProductError("imageTooLarge");
  try {
    const { default: sharp } = await import("sharp");
    // `rotate()` applies the camera's orientation; sharp refuses files that are not real images.
    return await sharp(bytes).rotate().resize(1200, 1200, { fit: "inside", withoutEnlargement: true }).webp({ quality: 82 }).toBuffer();
  } catch {
    throw new ProductError("imageUnsupported");
  }
}

async function storeImage(workspaceId: string, bytes: Uint8Array) {
  const path = `${workspaceId}/${randomUUID()}.webp`;
  const imageUrl = await uploadImage(path, await prepareImage(bytes), "image/webp");
  return { imageUrl, imagePath: path };
}

export function listProducts(db: TenantDb) {
  return db.product.findMany({ orderBy: [{ category: "asc" }, { createdAt: "asc" }], select: SELECT });
}

export async function createProduct({ workspaceId, db }: Scope, input: ProductInput, image?: Uint8Array): Promise<ProductRow> {
  if ((await db.product.count()) >= MAX_PRODUCTS) throw new ProductError("limit");
  const { price, ...fields } = input;
  const stored: { imageUrl?: string; imagePath?: string } = image ? await storeImage(workspaceId, image) : {};

  const product = await db.product.create({ data: { workspaceId, ...fields, priceMinor: price, ...stored }, select: SELECT });
  try {
    await indexProduct(workspaceId, product);
  } catch (err) {
    // A product the assistant cannot find would be confusing: undo and report the failure.
    await db.product.deleteMany({ where: { id: product.id } });
    if (stored.imagePath) await deleteImages([stored.imagePath]);
    throw err;
  }
  return product;
}

/** `image` replaces the photo; `removeImage` clears it. Neither leaves the photo as it is. */
export async function updateProduct(
  { workspaceId, db }: Scope,
  id: string,
  input: ProductInput,
  opts: { image?: Uint8Array; removeImage?: boolean } = {},
): Promise<ProductRow> {
  const existing = await db.product.findFirst({ where: { id }, select: { imagePath: true } });
  if (!existing) throw new ProductError("notFound");

  const { price, ...fields } = input;
  const stored = opts.image ? await storeImage(workspaceId, opts.image) : opts.removeImage ? { imageUrl: null, imagePath: null } : {};

  const product = await db.product.update({ where: { id }, data: { ...fields, priceMinor: price, ...stored }, select: SELECT });
  if ("imagePath" in stored && existing.imagePath) await deleteImages([existing.imagePath]);
  await indexProduct(workspaceId, product);
  return product;
}

/** Switch a product on or off without touching anything else. */
export async function setProductAvailable({ db }: Scope, id: string, available: boolean) {
  const { count } = await db.product.updateMany({ where: { id }, data: { available } });
  if (count === 0) throw new ProductError("notFound");
}

export async function deleteProduct({ db }: Scope, id: string) {
  const existing = await db.product.findFirst({ where: { id }, select: { imagePath: true } });
  if (!existing) return;
  await db.product.deleteMany({ where: { id } });
  if (existing.imagePath) await deleteImages([existing.imagePath]);
}

/** Products by id, in the order asked for. Ids from another workspace are simply not found. */
export async function getProducts(db: TenantDb, ids: string[]): Promise<ProductRow[]> {
  if (ids.length === 0) return [];
  const rows = await db.product.findMany({ where: { id: { in: ids } }, select: SELECT });
  return ids.flatMap((id) => rows.find((r) => r.id === id) ?? []);
}

export type ProductMatch = ProductRow & { similarity: number };

/**
 * The products closest to a query embedding, for ONE workspace. Unavailable products
 * are included, so the assistant can say that something is not available right now.
 */
export async function searchProducts(workspaceId: string, embedding: number[], limit = 6): Promise<ProductMatch[]> {
  if (!workspaceId) throw new Error("searchProducts requires a workspaceId");
  const vec = `[${embedding.join(",")}]`;
  return prisma.$queryRaw<ProductMatch[]>`
    SELECT "id", "name", "description", "category", "priceMinor", "currency", "imageUrl", "url", "available",
           (1 - ("embedding" <=> ${vec}::vector))::float8 AS "similarity"
    FROM "Product"
    WHERE "workspaceId" = ${workspaceId} AND "embedding" IS NOT NULL
    ORDER BY "embedding" <=> ${vec}::vector
    LIMIT ${limit}`;
}

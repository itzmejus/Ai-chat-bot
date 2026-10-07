/**
 * Image storage on Supabase Storage (the same Supabase project as the database).
 *
 * Configured with SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY. The service-role key
 * can read and write everything in the project's storage, so it is used only here,
 * on the server, and never sent to a browser. Uploaded images go into one public
 * bucket (they are shown to anonymous website visitors), under a folder per workspace.
 *
 * The REST API is called directly, which avoids adding the Supabase SDK for four requests.
 */

const BUCKET = "product-images";

export class StorageError extends Error {
  constructor(public code: "notConfigured" | "failed") {
    super(`storage: ${code}`);
    this.name = "StorageError";
  }
}

const baseUrl = () => (process.env.SUPABASE_URL ?? "").replace(/\/$/, "");

export const storageConfigured = () => Boolean(process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY);

function call(path: string, init: RequestInit & { headers?: Record<string, string> } = {}) {
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  return fetch(`${baseUrl()}/storage/v1${path}`, {
    ...init,
    headers: { Authorization: `Bearer ${key}`, apikey: key, ...init.headers },
    signal: AbortSignal.timeout(20_000),
  });
}

let bucketReady = false;

/** Create the bucket the first time it is needed. Safe to call when it already exists. */
async function ensureBucket() {
  if (bucketReady) return;
  const res = await call("/bucket", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ id: BUCKET, name: BUCKET, public: true, file_size_limit: 5 * 1024 * 1024, allowed_mime_types: ["image/webp"] }),
  });
  // "Already exists" comes back as 400 or 409 depending on the Supabase version.
  if (!res.ok && !/exist/i.test(await res.text())) throw new StorageError("failed");
  bucketReady = true;
}

/** Address anyone can load the image from. */
export const publicImageUrl = (path: string) => `${baseUrl()}/storage/v1/object/public/${BUCKET}/${path}`;

/** Store an image and return its public address. `path` is "<workspaceId>/<file>.webp". */
export async function uploadImage(path: string, bytes: Uint8Array, contentType: string): Promise<string> {
  if (!storageConfigured()) throw new StorageError("notConfigured");
  try {
    await ensureBucket();
    const res = await call(`/object/${BUCKET}/${path}`, {
      method: "POST",
      // Files never change once written (each upload gets a new name), so browsers may cache them for a year.
      headers: { "Content-Type": contentType, "Cache-Control": "max-age=31536000" },
      body: Buffer.from(bytes),
    });
    if (!res.ok) {
      console.error("[storage] upload refused", res.status, (await res.text()).slice(0, 300));
      throw new StorageError("failed");
    }
  } catch (err) {
    if (err instanceof StorageError) throw err;
    console.error("[storage] upload failed", err);
    throw new StorageError("failed");
  }
  return publicImageUrl(path);
}

/** Remove stored images. Never throws: a leftover file is harmless, a failed delete of its product is not. */
export async function deleteImages(paths: string[]) {
  if (!storageConfigured() || paths.length === 0) return;
  try {
    const res = await call(`/object/${BUCKET}`, { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ prefixes: paths }) });
    if (!res.ok) console.error("[storage] delete refused", res.status);
  } catch (err) {
    console.error("[storage] delete failed", err);
  }
}

import { randomUUID } from "node:crypto";
import type { TenantDb } from "@/server/db/tenant";
import { deleteImages, storedImagePath, uploadImage } from "@/server/storage";

/**
 * The widget logo can be an address of an image hosted anywhere, or a file uploaded here. Uploads
 * are cropped to a square (the logo shows in a circle), made small, and stored next to the product
 * photos. An uploaded logo that is replaced or removed is deleted from storage.
 */

export const MAX_LOGO_BYTES = 2 * 1024 * 1024;
const LOGO_SIZE = 256;

export class LogoError extends Error {
  constructor(public code: "logoTooLarge" | "logoUnsupported") {
    super(code);
    this.name = "LogoError";
  }
}

async function prepareLogo(bytes: Uint8Array): Promise<Uint8Array> {
  if (bytes.byteLength > MAX_LOGO_BYTES) throw new LogoError("logoTooLarge");
  try {
    const { default: sharp } = await import("sharp");
    // An SVG is drawn at a high resolution first, so the small result stays sharp.
    return await sharp(bytes, { density: 300 }).rotate().resize(LOGO_SIZE, LOGO_SIZE, { fit: "cover" }).webp({ quality: 90 }).toBuffer();
  } catch {
    throw new LogoError("logoUnsupported");
  }
}

/** Delete the previous logo file if it was an upload and is no longer the logo. */
export async function forgetOldLogo(previousUrl: string | null | undefined, currentUrl: string | null | undefined) {
  const path = storedImagePath(previousUrl);
  if (path && previousUrl !== currentUrl) await deleteImages([path]);
}

/** Upload a new logo, make it the widget's logo, and return its address. */
export async function saveWidgetLogo(workspaceId: string, db: TenantDb, bytes: Uint8Array): Promise<string> {
  const logoUrl = await uploadImage(`${workspaceId}/logo-${randomUUID()}.webp`, await prepareLogo(bytes), "image/webp");
  const previous = await db.widgetSettings.findFirst({ select: { logoUrl: true } });
  await db.widgetSettings.upsert({ where: { workspaceId }, update: { logoUrl }, create: { workspaceId, logoUrl } });
  await forgetOldLogo(previous?.logoUrl, logoUrl);
  return logoUrl;
}

/** Go back to the default icon. */
export async function removeWidgetLogo(workspaceId: string, db: TenantDb) {
  const previous = await db.widgetSettings.findFirst({ select: { logoUrl: true } });
  await db.widgetSettings.upsert({ where: { workspaceId }, update: { logoUrl: null }, create: { workspaceId, logoUrl: null } });
  await forgetOldLogo(previous?.logoUrl, null);
}

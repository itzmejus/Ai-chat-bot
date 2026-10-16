import sharp from "sharp";
import { beforeEach, describe, expect, it, vi } from "vitest";

const storage = vi.hoisted(() => ({ uploaded: [] as { path: string; bytes: Uint8Array }[], deleted: [] as string[] }));
vi.mock("@/server/storage", async (original) => {
  const real = await original<typeof import("@/server/storage")>();
  return {
    ...real,
    uploadImage: vi.fn(async (path: string, bytes: Uint8Array) => {
      storage.uploaded.push({ path, bytes });
      return real.publicImageUrl(path);
    }),
    deleteImages: vi.fn(async (paths: string[]) => void storage.deleted.push(...paths)),
  };
});
const session = vi.hoisted(() => ({ ctx: null as unknown }));
vi.mock("@/server/auth/session", () => ({ getWorkspaceContext: async () => session.ctx }));
vi.mock("next/cache", () => ({ revalidatePath: () => {} }));

import { DELETE, POST } from "@/app/api/branding/logo/route";
import { tenantDb } from "@/server/db/tenant";
import { storedImagePath } from "@/server/storage";
import { LogoError, removeWidgetLogo, saveWidgetLogo } from "@/server/widget/logo";
import { createTenant } from "./helpers";

const SUPABASE = "https://proj.supabase.co";
const png = (width: number, height: number) => sharp({ create: { width, height, channels: 4, background: "#dc2626" } }).png().toBuffer();

beforeEach(() => {
  vi.stubEnv("SUPABASE_URL", SUPABASE);
  vi.stubEnv("SUPABASE_SERVICE_ROLE_KEY", "service-key");
  storage.uploaded = [];
  storage.deleted = [];
  session.ctx = null;
});

describe("widget logo", () => {
  it("knows its own uploads from images hosted elsewhere", () => {
    expect(storedImagePath(`${SUPABASE}/storage/v1/object/public/product-images/ws1/logo-a.webp`)).toBe("ws1/logo-a.webp");
    expect(storedImagePath("https://cdn.example.com/logo.png")).toBeNull();
    expect(storedImagePath(null)).toBeNull();
  });

  it("stores a small square WebP, and deletes the upload it replaces", async () => {
    const { workspace } = await createTenant("Logo Clinic");
    const db = tenantDb(workspace.id);

    const first = await saveWidgetLogo(workspace.id, db, new Uint8Array(await png(800, 400)));
    const meta = await sharp(storage.uploaded[0].bytes).metadata();
    expect(meta).toMatchObject({ format: "webp", width: 256, height: 256 });
    expect(storage.uploaded[0].path).toMatch(new RegExp(`^${workspace.id}/logo-.+\\.webp$`));
    expect((await db.widgetSettings.findFirst())?.logoUrl).toBe(first);

    const second = await saveWidgetLogo(workspace.id, db, new Uint8Array(await png(300, 300)));
    expect(storage.deleted).toEqual([storedImagePath(first)]);

    await removeWidgetLogo(workspace.id, db);
    expect(storage.deleted).toEqual([storedImagePath(first), storedImagePath(second)]);
    expect((await db.widgetSettings.findFirst())?.logoUrl).toBeNull();
  });

  it("never deletes a logo hosted elsewhere", async () => {
    const { workspace } = await createTenant("Linked Logo");
    const db = tenantDb(workspace.id);
    await db.widgetSettings.update({ where: { workspaceId: workspace.id }, data: { logoUrl: "https://cdn.example.com/logo.png" } });
    await saveWidgetLogo(workspace.id, db, new Uint8Array(await png(64, 64)));
    expect(storage.deleted).toEqual([]);
  });

  it("refuses files that are not images", async () => {
    const { workspace } = await createTenant("Bad Logo");
    await expect(saveWidgetLogo(workspace.id, tenantDb(workspace.id), new TextEncoder().encode("not an image"))).rejects.toBeInstanceOf(LogoError);
    expect(storage.uploaded).toEqual([]);
  });
});

describe("logo upload route", () => {
  const upload = async (bytes: Uint8Array | Buffer) => {
    const form = new FormData();
    form.append("file", new File([new Uint8Array(bytes)], "logo.png", { type: "image/png" }));
    return POST(new Request("https://app.example.com/api/branding/logo", { method: "POST", body: form }));
  };

  it("lets only the workspace owner change the logo", async () => {
    const { workspace } = await createTenant("Route Logo");
    const ctx = { workspace, db: tenantDb(workspace.id), role: "agent" };

    expect((await upload(await png(64, 64))).status).toBe(401);
    session.ctx = ctx;
    expect((await upload(await png(64, 64))).status).toBe(403);
    expect((await DELETE()).status).toBe(403);

    session.ctx = { ...ctx, role: "owner" };
    const res = await upload(await png(64, 64));
    expect(res.status).toBe(200);
    expect((await res.json()).url).toMatch(/\/logo-.+\.webp$/);
    expect((await DELETE()).status).toBe(200);
  });

  it("explains a file it cannot use", async () => {
    const { workspace } = await createTenant("Route Bad Logo");
    session.ctx = { workspace, db: tenantDb(workspace.id), role: "owner" };
    const res = await upload(Buffer.from("plain text"));
    expect(res.status).toBe(400);
    expect(await res.json()).toEqual({ error: "errors.logoUnsupported" });
  });
});

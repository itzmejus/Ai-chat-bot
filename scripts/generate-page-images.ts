/**
 * Generates the pictures for the site's industry, integration, use-case and blog pages.
 *
 *   npm run images:pages            only pages without a picture yet
 *   npm run images:pages -- --force  every page again
 *   npm run images:pages -- /blog/chat-on-mobile   just the pages named
 *
 * In Git Bash on Windows, prefix MSYS_NO_PATHCONV=1 when naming pages: otherwise Git Bash turns
 * "/blog/..." into a Windows path, no page matches, and every page without a picture is made.
 *
 * Each picture is a photorealistic image made by OpenAI's image API (PAGE_IMAGE_MODEL, default the one ChatGPT
 * uses) from the page's scene in src/content/site/page-images.ts plus the shared STYLE below,
 * so every picture shows that page's subject in the same look. The full-size original is kept
 * in .cache/page-images (not committed) so the web sizes can be rebuilt without paying again;
 * public/images/pages gets 480, 960 and 1440 px WebP files and a 1200x630 JPEG for link previews.
 * Needs OPENAI_API_KEY (read from .env).
 */
import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";
import { PAGE_IMAGES } from "../src/content/site/page-images";

if (fs.existsSync(".env")) process.loadEnvFile(".env");
const KEY = process.env.OPENAI_API_KEY;
const MODEL = process.env.PAGE_IMAGE_MODEL || "chatgpt-image-latest";
const OUT = path.join("public", "images", "pages");
const CACHE = path.join(".cache", "page-images");
const WIDTHS = [480, 960, 1440];
const PARALLEL = 4;

const STYLE =
  "Photorealistic editorial photograph, as if taken by a professional photographer with a full-frame camera and a 35mm lens: " +
  "natural daylight or warm indoor light, true-to-life colours, realistic skin, hands and materials, shallow depth of field, an authentic candid moment. " +
  "People, where they appear, are ordinary customers and staff of mixed Middle Eastern, South Asian, African, East Asian and European backgrounds, dressed for a modern city such as Dubai. " +
  "A few subtle touches of red (#dc2626) in the decor or clothing. " +
  "Any phone, tablet or laptop screen shows a simple chat app with plain message bubbles, slightly out of focus. " +
  "One single real photograph: no split screens or collages, no floating icons, speech bubbles, glowing graphics or overlays in the air, no cartoon or 3D characters. " +
  "No readable text, letters, numbers, invented scripts, logos, brand marks or watermarks anywhere. Wide 3:2 frame, main subject clearly in the centre.";

const fileBase = (page: string) => page.replace(/^\//, "").replace(/\//g, "-");

async function generate(page: string, scene: string): Promise<Buffer> {
  for (let attempt = 1; ; attempt++) {
    const res = await fetch("https://api.openai.com/v1/images/generations", {
      method: "POST",
      headers: { Authorization: `Bearer ${KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({ model: MODEL, prompt: `${STYLE}\n\nScene: ${scene}`, size: "1536x1024", quality: "medium", n: 1 }),
    });
    const json = (await res.json()) as { data?: { b64_json: string }[]; error?: { message: string } };
    if (res.ok && json.data?.[0]) return Buffer.from(json.data[0].b64_json, "base64");
    if (attempt >= 3) throw new Error(`${page}: ${res.status} ${json.error?.message}`);
    await new Promise((r) => setTimeout(r, 5000 * attempt));
  }
}

async function build(page: string, original: Buffer) {
  const base = path.join(OUT, fileBase(page));
  for (const width of WIDTHS) {
    await sharp(original).resize({ width }).webp({ quality: 80 }).toFile(`${base}-${width}.webp`);
  }
  await sharp(original).resize(1200, 630, { fit: "cover", position: "centre" }).jpeg({ quality: 82, mozjpeg: true }).toFile(`${base}-og.jpg`);
}

async function main() {
  if (!KEY) throw new Error("OPENAI_API_KEY is not set");
  fs.mkdirSync(OUT, { recursive: true });
  fs.mkdirSync(CACHE, { recursive: true });

  const args = process.argv.slice(2);
  const force = args.includes("--force");
  const named = args.filter((a) => !a.startsWith("--"));
  // Never fall back to "every page" because a name was mistyped or mangled by the shell.
  const unknown = named.filter((page) => !PAGE_IMAGES[page]);
  if (unknown.length) throw new Error(`Not pages with a picture: ${unknown.join(", ")}`);
  const pages = Object.keys(PAGE_IMAGES).filter((page) => {
    if (named.length) return named.includes(page);
    return force || !fs.existsSync(path.join(OUT, `${fileBase(page)}-og.jpg`));
  });
  console.log(`${pages.length} page(s) to do with ${MODEL}`);

  let done = 0;
  const failed: string[] = [];
  const queue = [...pages];
  await Promise.all(
    Array.from({ length: PARALLEL }, async () => {
      for (let page = queue.shift(); page; page = queue.shift()) {
        try {
          const cached = path.join(CACHE, `${fileBase(page)}.png`);
          const regenerate = force || named.length > 0 || !fs.existsSync(cached);
          const original = regenerate ? await generate(page, PAGE_IMAGES[page].scene) : fs.readFileSync(cached);
          if (regenerate) fs.writeFileSync(cached, original);
          await build(page, original);
          console.log(`[${++done}/${pages.length}] ${page}`);
        } catch (err) {
          failed.push(page);
          console.error(`failed ${page}:`, (err as Error).message);
        }
      }
    }),
  );
  if (failed.length) {
    console.error(`\n${failed.length} failed; run again to retry them:\n${failed.join("\n")}`);
    process.exitCode = 1;
  }
}

main();

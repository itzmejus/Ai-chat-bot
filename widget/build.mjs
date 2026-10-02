/**
 * Builds the two standalone widget bundles into /public:
 *   widget.js      the embed loader businesses paste on their site
 *   widget-app.js  the chat application that runs inside the iframe
 * Run by `npm run build:widget` (and automatically before `dev` and `build`).
 */
import { build } from "esbuild";
import { gzipSync } from "node:zlib";
import { readFileSync } from "node:fs";

const shared = { bundle: true, minify: true, format: "iife", target: "es2020", legalComments: "none", logLevel: "warning" };

await build({ ...shared, entryPoints: ["widget/loader.ts"], outfile: "public/widget.js" });
await build({ ...shared, entryPoints: ["widget/app.ts"], outfile: "public/widget-app.js" });

for (const file of ["public/widget.js", "public/widget-app.js"]) {
  const bytes = readFileSync(file);
  console.log(`${file}: ${(bytes.length / 1024).toFixed(1)} kB (${(gzipSync(bytes).length / 1024).toFixed(1)} kB gzipped)`);
}

/**
 * `npm run db:seed`: fills the database in .env with the demo dental clinic (see prisma/demo.ts).
 *
 * Set SEED_PASSWORD to choose the demo account's password; otherwise a random one is
 * generated and printed. Running it again replaces the demo workspace.
 */
import "dotenv/config";
import { randomBytes } from "node:crypto";
import { APP_URL, WIDGET_URL } from "@/lib/config";
import { prisma } from "@/server/db/prisma";
import { DEMO_PUBLIC_KEY, seedDemo } from "./demo";

async function main() {
  if (!process.env.DATABASE_URL) throw new Error("DATABASE_URL is not set. Copy .env.example to .env and fill it in first.");

  const password = process.env.SEED_PASSWORD || randomBytes(9).toString("base64url");
  if (password.length < 8) throw new Error("SEED_PASSWORD must be at least 8 characters.");

  const embed = Boolean(process.env.OPENAI_API_KEY);
  console.log("Seeding the demo workspace (this can take a minute)...");
  const result = await seedDemo({ password, embed });

  console.log(`
Demo workspace ready: Bright Smile Dental Clinic

  Log in at   ${APP_URL}/login
  Email       ${result.email}
  Password    ${password}

  Knowledge   ${result.sources.ready} sources ready, ${result.sources.failed} failed
  Services    ${result.products} shown as cards in the chat
  Chats       ${result.conversations} conversations, ${result.leads} leads

  Embed code  <script src="${WIDGET_URL}/widget.js" data-workspace="${DEMO_PUBLIC_KEY}" async></script>
  Test page   npx serve examples -l 5500   then open http://localhost:5500/test-page.html
`);
  if (!embed) {
    console.log("OPENAI_API_KEY is not set, so the knowledge base was not processed.\nAdd the key, then run this again or press Re-sync on each source.\n");
  } else if (result.sources.failed > 0) {
    console.log("Some sources failed to process (see the errors above). Press Re-sync on the Knowledge base page to retry.\n");
  }
}

main()
  .catch((err) => {
    console.error(err);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());

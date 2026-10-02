import "dotenv/config";
import { defineConfig } from "prisma/config";

// The Prisma CLI (migrations) needs a session-capable connection. On Supabase the
// app uses the transaction pooler (DATABASE_URL) and the CLI uses DIRECT_URL.
export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: { path: "prisma/migrations" },
  datasource: {
    url: process.env.DIRECT_URL || process.env.DATABASE_URL || "",
  },
});

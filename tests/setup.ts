/**
 * Test database: every test file gets its own in-memory Postgres (PGlite with
 * pgvector), with all migrations applied, swapped in for the real Prisma client.
 * No Docker or network access is needed to run the suite.
 */
import fs from "node:fs";
import path from "node:path";
import { vi } from "vitest";

vi.mock("@/server/db/prisma", async () => {
  const { PGlite } = await import("@electric-sql/pglite");
  const { vector } = await import("@electric-sql/pglite-pgvector");
  const { PrismaPGlite } = await import("pglite-prisma-adapter");
  const { PrismaClient } = await import("@/generated/prisma/client");

  const pglite = await PGlite.create({ extensions: { vector } });

  const migrationsDir = path.join(process.cwd(), "prisma", "migrations");
  const migrations = fs
    .readdirSync(migrationsDir, { withFileTypes: true })
    .filter((d) => d.isDirectory())
    .map((d) => d.name)
    .sort();
  for (const name of migrations) {
    await pglite.exec(fs.readFileSync(path.join(migrationsDir, name, "migration.sql"), "utf8"));
  }

  return { prisma: new PrismaClient({ adapter: new PrismaPGlite(pglite) }) };
});

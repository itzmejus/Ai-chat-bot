import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@/generated/prisma/client";

/**
 * The raw, UNSCOPED Prisma client.
 *
 * Only use this for global tables (User, Plan, Workspace lookup by public key,
 * a user's own memberships). Anything that belongs to a workspace must go
 * through `tenantDb(workspaceId)` in ./tenant.ts.
 */
function createClient() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) throw new Error("DATABASE_URL is not set");
  return new PrismaClient({ adapter: new PrismaPg({ connectionString }) });
}

// One client per process, reused across hot reloads in development.
const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

/**
 * The client is created on first use, not on import. `next build` imports every
 * route to collect its configuration, and build environments (a Docker build on
 * Render, CI) have no DATABASE_URL; connecting lazily lets the build succeed and
 * still fails loudly if the variable is missing when a query actually runs.
 */
export const prisma = new Proxy({} as PrismaClient, {
  get(_target, property) {
    const client = (globalForPrisma.prisma ??= createClient());
    const value = Reflect.get(client, property);
    return typeof value === "function" ? value.bind(client) : value;
  },
});

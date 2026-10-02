import { prisma } from "@/server/db/prisma";

/**
 * Fixed-window rate limiter backed by Postgres, so it works across several app
 * instances without Redis. Swap the body of `rateLimit` for Redis later if
 * traffic grows; callers will not need to change.
 *
 * Returns true if the call is allowed.
 */
export async function rateLimit(key: string, limit: number, windowSeconds: number): Promise<boolean> {
  const windowMs = windowSeconds * 1000;
  const windowStart = new Date(Math.floor(Date.now() / windowMs) * windowMs);

  // Atomic increment: concurrent requests cannot both read the old count.
  const rows = await prisma.$queryRaw<{ count: number }[]>`
    INSERT INTO "RateLimitHit" ("key", "windowStart", "count")
    VALUES (${key}, ${windowStart}, 1)
    ON CONFLICT ("key", "windowStart") DO UPDATE SET "count" = "RateLimitHit"."count" + 1
    RETURNING "count"`;

  // Occasionally clear out old windows so the table stays small.
  if (Math.random() < 0.02) {
    const cutoff = new Date(Date.now() - 24 * 60 * 60 * 1000);
    prisma.rateLimitHit.deleteMany({ where: { windowStart: { lt: cutoff } } }).catch(() => {});
  }

  return rows[0].count <= limit;
}

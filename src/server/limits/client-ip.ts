/**
 * The visitor's IP address, for rate limits.
 *
 * `X-Forwarded-For` cannot be trusted as a whole: visitors can send it themselves, and proxies
 * (Render's included) add to it rather than replace it, so its first value is whatever the
 * visitor wrote. Only the values added by the proxies in front of the app are real.
 *
 * In order:
 *  1. CLIENT_IP_HEADER, when set: a header the hosting provider sets and overwrites itself.
 *     Render serves custom domains through Cloudflare, which sets `CF-Connecting-IP` and
 *     replaces any value a visitor sends, so that is the default.
 *  2. The last value of `X-Forwarded-For`, which the nearest proxy added. A visitor cannot
 *     forge it; at worst it is the address of a proxy, which makes a limit stricter, not looser.
 *  3. "unknown" (local development without a proxy).
 */

const DEFAULT_HEADER = "cf-connecting-ip";

const usable = (value: string | null | undefined) => {
  const ip = value?.trim();
  // An address is short and has no spaces or commas; anything else is not one.
  return ip && ip.length <= 64 && /^[0-9a-fA-F:.]+$/.test(ip) ? ip : null;
};

export function clientIpFrom(headers: Pick<Headers, "get">): string {
  const header = (process.env.CLIENT_IP_HEADER || DEFAULT_HEADER).toLowerCase();
  const direct = usable(headers.get(header));
  if (direct) return direct;
  const forwarded = headers.get("x-forwarded-for")?.split(",");
  return usable(forwarded?.at(-1)) ?? "unknown";
}

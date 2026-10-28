/**
 * The visitor's IP address, for rate limits.
 *
 * `X-Forwarded-For` cannot be trusted as a whole: visitors can send it themselves, and proxies
 * (Render's included) add to it rather than replace it, so its first value is whatever the
 * visitor wrote. Only the values added by the proxies in front of the app are real.
 *
 * In order:
 *  1. CLIENT_IP_HEADER, when set: a header the hosting provider sets and overwrites itself.
 *     Without it: Vercel's `X-Real-IP` on Vercel, otherwise Cloudflare's `CF-Connecting-IP`,
 *     which Cloudflare sets and replaces any value a visitor sends.
 *  2. The last value of `X-Forwarded-For`, which the nearest proxy added. A visitor cannot
 *     forge it; at worst it is the address of a proxy, which makes a limit stricter, not looser.
 *  3. "unknown" (local development without a proxy).
 */

// On Vercel, a CF-Connecting-IP header can only have been written by the visitor (there is no
// Cloudflare in front), so Vercel's own X-Real-IP, which it always overwrites, is the default there.
const defaultHeader = () => (process.env.VERCEL ? "x-real-ip" : "cf-connecting-ip");

const usable = (value: string | null | undefined) => {
  const ip = value?.trim();
  // An address is short and has no spaces or commas; anything else is not one.
  return ip && ip.length <= 64 && /^[0-9a-fA-F:.]+$/.test(ip) ? ip : null;
};

export function clientIpFrom(headers: Pick<Headers, "get">): string {
  const header = (process.env.CLIENT_IP_HEADER || defaultHeader()).toLowerCase();
  const direct = usable(headers.get(header));
  if (direct) return direct;
  const forwarded = headers.get("x-forwarded-for")?.split(",");
  return usable(forwarded?.at(-1)) ?? "unknown";
}

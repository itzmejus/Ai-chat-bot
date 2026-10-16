import dns from "node:dns";
import net from "node:net";
import { Agent, fetch as undiciFetch } from "undici";

/**
 * Fetching URLs that customers type in is a server-side request forgery risk:
 * without checks, someone could point the crawler at internal services
 * (localhost, cloud metadata, private networks). Everything the crawler
 * downloads goes through `safeFetch`, which:
 *   - allows only http/https
 *   - refuses hosts that resolve to private, loopback or link-local addresses
 *     (checked at connection time, so DNS tricks cannot swap the address later)
 *   - re-checks every redirect hop
 *   - caps response size and time
 */

export const CRAWLER_USER_AGENT = "SeloAssistBot/1.0 (+knowledge-base crawler)";

const blocked = new net.BlockList();
for (const [prefix, bits] of [
  ["0.0.0.0", 8],
  ["10.0.0.0", 8],
  ["100.64.0.0", 10], // carrier-grade NAT
  ["127.0.0.0", 8],
  ["169.254.0.0", 16], // link-local, includes cloud metadata 169.254.169.254
  ["172.16.0.0", 12],
  ["192.0.0.0", 24],
  ["192.168.0.0", 16],
  ["198.18.0.0", 15],
  ["224.0.0.0", 3], // multicast + reserved
] as const) {
  blocked.addSubnet(prefix, bits, "ipv4");
}
for (const [prefix, bits] of [
  ["::", 127], // :: and ::1
  ["64:ff9b:1::", 48], // local-use NAT64
  ["100::", 64], // discard
  ["2001::", 32], // Teredo tunnels
  ["2001:db8::", 32], // documentation
  ["fc00::", 7], // unique local
  ["fe80::", 10], // link-local
  ["fec0::", 10], // site-local (deprecated, still routed on some networks)
  ["ff00::", 8], // multicast
] as const) {
  blocked.addSubnet(prefix, bits, "ipv6");
}

/** The eight 16-bit groups of an IPv6 address, or null if it is not one. Handles "::" and a dotted IPv4 ending. */
function ipv6Groups(ip: string): number[] | null {
  let text = ip.toLowerCase().split("%")[0]; // drop a zone id such as %eth0
  const dotted = /(\d+\.\d+\.\d+\.\d+)$/.exec(text);
  if (dotted) {
    if (!net.isIPv4(dotted[1])) return null;
    const [a, b, c, d] = dotted[1].split(".").map(Number);
    text = text.slice(0, -dotted[1].length) + ((a << 8) | b).toString(16) + ":" + ((c << 8) | d).toString(16);
  }
  const halves = text.split("::");
  if (halves.length > 2) return null;
  const head = halves[0] ? halves[0].split(":") : [];
  const tail = halves.length === 2 && halves[1] ? halves[1].split(":") : [];
  const missing = 8 - head.length - tail.length;
  if (halves.length === 1 ? missing !== 0 : missing < 1) return null;
  const groups = [...head, ...Array<string>(halves.length === 2 ? missing : 0).fill("0"), ...tail].map((group) =>
    /^[0-9a-f]{1,4}$/.test(group) ? parseInt(group, 16) : NaN,
  );
  return groups.some(Number.isNaN) ? null : groups;
}

const ipv4From = (high: number, low: number) => `${high >> 8}.${high & 255}.${low >> 8}.${low & 255}`;

/**
 * True for any address the crawler must not reach. IPv6 forms that carry an IPv4 address
 * inside them are judged by that IPv4 address, whichever way they are written:
 * "::ffff:127.0.0.1" and "::ffff:7f00:1" (mapped), "::127.0.0.1" (the old "compatible" form),
 * "64:ff9b::7f00:1" (NAT64) and "2002:7f00:1::" (6to4).
 */
export function isPrivateAddress(ip: string): boolean {
  if (net.isIPv4(ip)) return blocked.check(ip, "ipv4");
  if (!net.isIPv6(ip)) return true; // not an IP at all
  const g = ipv6Groups(ip);
  if (!g) return true;
  const zerosUpTo = (n: number) => g.slice(0, n).every((x) => x === 0);
  const mapped = zerosUpTo(5) && g[5] === 0xffff;
  const nat64 = g[0] === 0x64 && g[1] === 0xff9b && g.slice(2, 6).every((x) => x === 0);
  if (mapped || zerosUpTo(6) || nat64) return isPrivateAddress(ipv4From(g[6], g[7]));
  if (g[0] === 0x2002) return isPrivateAddress(ipv4From(g[1], g[2]));
  return blocked.check(ip, "ipv6");
}

export class BlockedUrlError extends Error {
  constructor(url: string) {
    super(`Refusing to fetch non-public URL: ${url}`);
    this.name = "BlockedUrlError";
  }
}

/** Cheap up-front check on the URL itself. DNS results are checked again when connecting. */
export function assertPublicUrl(raw: string): URL {
  let url: URL;
  try {
    url = new URL(raw);
  } catch {
    throw new BlockedUrlError(raw);
  }
  const host = url.hostname.replace(/^\[|\]$/g, "").toLowerCase();
  if (url.protocol !== "http:" && url.protocol !== "https:") throw new BlockedUrlError(raw);
  if (url.username || url.password) throw new BlockedUrlError(raw);
  if (host === "localhost" || host.endsWith(".localhost") || host.endsWith(".local") || host.endsWith(".internal")) {
    throw new BlockedUrlError(raw);
  }
  if (net.isIP(host) && isPrivateAddress(host)) throw new BlockedUrlError(raw);
  return url;
}

// All connections resolve DNS through this lookup, which rejects private addresses.
const agent = new Agent({
  connect: {
    lookup(hostname, options, callback) {
      dns.lookup(hostname, { ...options, all: true }, (err, addresses) => {
        if (err) return callback(err, []);
        if (addresses.length === 0 || addresses.some((a) => isPrivateAddress(a.address))) {
          return callback(new BlockedUrlError(hostname), []);
        }
        callback(null, addresses);
      });
    },
  },
});

export type FetchResult = {
  /** Final URL after redirects. */
  url: string;
  status: number;
  contentType: string;
  body: string;
};

export type Fetcher = (url: string) => Promise<FetchResult>;

export const safeFetch: Fetcher = async (startUrl) => {
  const MAX_REDIRECTS = 5;
  const MAX_BYTES = 2 * 1024 * 1024;
  let current = startUrl;

  for (let hop = 0; hop <= MAX_REDIRECTS; hop++) {
    const url = assertPublicUrl(current);
    const res = await undiciFetch(url, {
      dispatcher: agent,
      redirect: "manual",
      signal: AbortSignal.timeout(15_000),
      headers: { "user-agent": CRAWLER_USER_AGENT, accept: "text/html,text/plain;q=0.9,*/*;q=0.1" },
    });

    if (res.status >= 300 && res.status < 400 && res.headers.get("location")) {
      await res.body?.cancel();
      current = new URL(res.headers.get("location")!, url).toString();
      continue;
    }

    // Read at most MAX_BYTES so a huge response cannot exhaust memory.
    const chunks: Uint8Array[] = [];
    let size = 0;
    if (res.body) {
      const reader = res.body.getReader();
      while (size < MAX_BYTES) {
        const { done, value } = await reader.read();
        if (done) break;
        chunks.push(value);
        size += value.byteLength;
      }
      await reader.cancel().catch(() => {});
    }

    return {
      url: url.toString(),
      status: res.status,
      contentType: res.headers.get("content-type") ?? "",
      body: Buffer.concat(chunks).subarray(0, MAX_BYTES).toString("utf8"),
    };
  }
  throw new Error(`Too many redirects: ${startUrl}`);
};

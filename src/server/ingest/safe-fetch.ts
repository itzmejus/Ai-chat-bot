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

export const CRAWLER_USER_AGENT = "MosaedBot/1.0 (+knowledge-base crawler)";

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
  ["fc00::", 7], // unique local
  ["fe80::", 10], // link-local
  ["ff00::", 8], // multicast
] as const) {
  blocked.addSubnet(prefix, bits, "ipv6");
}

export function isPrivateAddress(ip: string): boolean {
  const mapped = /^::ffff:(\d+\.\d+\.\d+\.\d+)$/i.exec(ip);
  if (mapped) return isPrivateAddress(mapped[1]);
  if (net.isIPv4(ip)) return blocked.check(ip, "ipv4");
  if (net.isIPv6(ip)) return blocked.check(ip, "ipv6");
  return true; // not an IP at all
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

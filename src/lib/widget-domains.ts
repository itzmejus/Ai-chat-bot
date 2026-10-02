/**
 * Domain whitelist for the widget.
 *
 * A business lists the websites allowed to show its widget. Enforcement has two layers:
 *   1. `frame-ancestors` in the Content-Security-Policy of the chat iframe: the browser
 *      refuses to display the iframe on any other site.
 *   2. A server-side check of the embedding page (Referer) before a widget token is issued.
 * An empty list means the widget works nowhere.
 */

/** Hostname with optional port, e.g. "shop.ae", "localhost", "localhost:5500". */
const DOMAIN_PATTERN = /^(?=.{1,253}$)([a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?)(\.[a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?)*(:\d{1,5})?$/;

/**
 * Turn what a person types ("https://www.Shop.ae/contact") into a bare domain ("shop.ae").
 * Returns null if it is not a usable domain.
 */
export function normalizeDomain(input: string): string | null {
  let value = input.trim().toLowerCase();
  if (!value) return null;
  value = value.replace(/^[a-z][a-z0-9+.-]*:\/\//, ""); // protocol
  value = value.split(/[/?#]/)[0]; // path, query, fragment
  value = value.replace(/^www\./, "");
  if (!DOMAIN_PATTERN.test(value)) return null;
  const host = value.split(":")[0];
  // A real domain needs a dot; bare names are only accepted for local testing.
  if (!host.includes(".") && host !== "localhost") return null;
  return value;
}

/**
 * Is this page origin (or Referer URL) on the whitelist?
 * An entry matches its own host and any subdomain: "shop.ae" allows www.shop.ae and
 * blog.shop.ae, but not evilshop.ae or shop.ae.evil.com. An entry with a port matches
 * only that port; without one it matches any port.
 */
export function isOriginAllowed(originOrUrl: string, allowedDomains: string[]): boolean {
  let url: URL;
  try {
    url = new URL(originOrUrl);
  } catch {
    return false;
  }
  if (url.protocol !== "https:" && url.protocol !== "http:") return false;
  const host = url.hostname.toLowerCase();

  return allowedDomains.some((entry) => {
    const [domain, port] = entry.toLowerCase().split(":");
    if (port && url.port !== port) return false;
    return host === domain || host.endsWith(`.${domain}`);
  });
}

/** The `frame-ancestors` source list for a workspace's chat iframe. */
export function frameAncestors(allowedDomains: string[], extraOrigins: string[] = []): string {
  const sources = new Set<string>(extraOrigins);
  for (const entry of allowedDomains) {
    const [domain, port] = entry.split(":");
    const suffix = port ? `:${port}` : domain === "localhost" ? ":*" : "";
    for (const scheme of ["https", "http"]) {
      sources.add(`${scheme}://${domain}${suffix}`);
      if (domain !== "localhost") sources.add(`${scheme}://*.${domain}${suffix}`);
    }
  }
  return sources.size > 0 ? [...sources].join(" ") : "'none'";
}

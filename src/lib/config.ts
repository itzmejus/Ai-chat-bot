/** Platform-wide settings. Rename the product by changing APP_NAME in the environment. */
export const APP_NAME = process.env.APP_NAME || "Selo Assist";

/**
 * Read an address setting as a bare origin ("https://host", no trailing slash). Forgiving about
 * how it was pasted into a host's settings: surrounding spaces or quotes are dropped and a
 * missing "https://" is added. Anything still not an address stops the app with a message
 * that names the setting, rather than a bare "Invalid URL" somewhere later.
 */
export function urlSetting(name: string, raw: string | undefined, fallback: string): string {
  let value = (raw ?? "").trim().replace(/^["']+|["']+$/g, "").trim();
  if (!value) return fallback;
  if (!/^[a-z][a-z0-9+.-]*:\/\//i.test(value)) value = `https://${value}`;
  try {
    const url = new URL(value);
    if (url.protocol !== "https:" && url.protocol !== "http:") throw new Error("not http(s)");
    return url.origin;
  } catch {
    throw new Error(`${name} must be a web address such as https://www.example.com, but it is "${raw}"`);
  }
}

/** Where the dashboard lives, e.g. https://www.assist.siteselo.com */
export const APP_URL = urlSetting("APP_URL", process.env.APP_URL, "http://localhost:3000");

/**
 * Where the customer-facing widget is served from, e.g. https://chat.siteselo.com.
 * It is the same deployment answering on a second hostname. Keeping the widget on its own
 * hostname means dashboard login cookies are never sent with widget requests.
 * Defaults to APP_URL, which is what local development uses.
 */
export const WIDGET_URL = urlSetting("WIDGET_URL", process.env.WIDGET_URL, APP_URL);

/**
 * Where the public marketing site lives, e.g. https://siteselo.com. Same deployment again.
 * Defaults to APP_URL, in which case the site is simply the app's home page.
 */
export const SITE_URL = urlSetting("SITE_URL", process.env.SITE_URL, APP_URL);

/**
 * Hostnames the app used to live on, comma separated, e.g. "app.siteselo.com,www.app.siteselo.com".
 * Everything opened on them is redirected to the same path on the current address.
 */
export const REDIRECT_HOSTS = (process.env.REDIRECT_HOSTS || "")
  .split(",")
  .map((host) => host.trim().toLowerCase())
  .filter(Boolean);

/**
 * Public key (pk_...) of the workspace whose chat widget is shown on the public site itself,
 * so visitors can try the product. Empty leaves the site without a widget.
 */
export const SITE_WIDGET_KEY = process.env.SITE_WIDGET_KEY || "";

/** Shown on the public site (contact section, footer, legal pages, structured data) and in the dashboard billing note. */
export const CONTACT_EMAIL = process.env.CONTACT_EMAIL || "hello@siteselo.com";

export const googleAuthEnabled = Boolean(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET);

export const LOCALES = ["en", "ar"] as const;
export type Locale = (typeof LOCALES)[number];
export const DEFAULT_LOCALE: Locale = "en";

/** Cookie names. */
export const WORKSPACE_COOKIE = "ws";
export const LOCALE_COOKIE = "locale";

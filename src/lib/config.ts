/** Platform-wide settings. Rename the product by changing APP_NAME in the environment. */
export const APP_NAME = process.env.APP_NAME || "Selo Assist";

/** Where the dashboard lives, e.g. https://www.assist.siteselo.com */
export const APP_URL = (process.env.APP_URL || "http://localhost:3000").replace(/\/$/, "");

/**
 * Where the customer-facing widget is served from, e.g. https://chat.siteselo.com.
 * It is the same deployment answering on a second hostname. Keeping the widget on its own
 * hostname means dashboard login cookies are never sent with widget requests.
 * Defaults to APP_URL, which is what local development uses.
 */
export const WIDGET_URL = (process.env.WIDGET_URL || APP_URL).replace(/\/$/, "");

/**
 * Where the public marketing site lives, e.g. https://siteselo.com. Same deployment again.
 * Defaults to APP_URL, in which case the site is simply the app's home page.
 */
export const SITE_URL = (process.env.SITE_URL || APP_URL).replace(/\/$/, "");

/**
 * Hostnames the app used to live on, comma separated, e.g. "app.siteselo.com,www.app.siteselo.com".
 * Everything opened on them is redirected to the same path on the current address.
 */
export const REDIRECT_HOSTS = (process.env.REDIRECT_HOSTS || "")
  .split(",")
  .map((host) => host.trim().toLowerCase())
  .filter(Boolean);

/** Shown on the public site (footer, legal pages) when set. */
export const CONTACT_EMAIL = process.env.CONTACT_EMAIL || "";

export const googleAuthEnabled = Boolean(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET);

export const LOCALES = ["en", "ar"] as const;
export type Locale = (typeof LOCALES)[number];
export const DEFAULT_LOCALE: Locale = "en";

/** Cookie names. */
export const WORKSPACE_COOKIE = "ws";
export const LOCALE_COOKIE = "locale";

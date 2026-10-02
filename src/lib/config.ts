/** Platform-wide settings. Rename the product by changing APP_NAME in the environment. */
export const APP_NAME = process.env.APP_NAME || "Mosaed";

/** Where the dashboard lives, e.g. https://app.siteselo.com */
export const APP_URL = (process.env.APP_URL || "http://localhost:3000").replace(/\/$/, "");

/**
 * Where the customer-facing widget is served from, e.g. https://chat.siteselo.com.
 * It is the same deployment answering on a second hostname. Keeping the widget on its own
 * hostname means dashboard login cookies are never sent with widget requests.
 * Defaults to APP_URL, which is what local development uses.
 */
export const WIDGET_URL = (process.env.WIDGET_URL || APP_URL).replace(/\/$/, "");

export const googleAuthEnabled = Boolean(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET);

export const LOCALES = ["en", "ar"] as const;
export type Locale = (typeof LOCALES)[number];
export const DEFAULT_LOCALE: Locale = "en";

/** Cookie names. */
export const WORKSPACE_COOKIE = "ws";
export const LOCALE_COOKIE = "locale";

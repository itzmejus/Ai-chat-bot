/** Platform-wide settings. Rename the product by changing APP_NAME in the environment. */
export const APP_NAME = process.env.APP_NAME || "Mosaed";
export const APP_URL = (process.env.APP_URL || "http://localhost:3000").replace(/\/$/, "");

export const googleAuthEnabled = Boolean(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET);

export const LOCALES = ["en", "ar"] as const;
export type Locale = (typeof LOCALES)[number];
export const DEFAULT_LOCALE: Locale = "en";

/** Cookie names. */
export const WORKSPACE_COOKIE = "ws";
export const LOCALE_COOKIE = "locale";

import { APP_NAME } from "@/lib/config";
import type { SiteLang } from "@/lib/site-routes";
import { ar } from "./ar";
import { en } from "./en";
import type { PlanId, SiteContent } from "./types";

export type * from "./types";

/** Put the product name into every "{name}" placeholder. */
function withName(content: SiteContent): SiteContent {
  const name = JSON.stringify(APP_NAME).slice(1, -1);
  return JSON.parse(JSON.stringify(content).replaceAll("{name}", name)) as SiteContent;
}

const CONTENT: Record<SiteLang, SiteContent> = { en: withName(en), ar: withName(ar) };

export const getSiteContent = (lang: SiteLang): SiteContent => CONTENT[lang];

/**
 * Plans shown on the public site.
 *
 * The limits must match the `Plan` rows in the database (a test checks this).
 * Prices are monthly, in euros. `was` is the regular price shown crossed out beside
 * the current one. Online payment is not built yet, so nothing in the app charges these
 * amounts; they are what the site advertises.
 */
export const PLAN_CURRENCY = { code: "EUR", symbol: "€" } as const;

export const SITE_PLANS: { id: PlanId; price: number; was?: number; messages: number; pages: number; seats: number; popular?: boolean }[] = [
  { id: "free", price: 0, messages: 30, pages: 25, seats: 1 },
  { id: "starter", price: 49, was: 79, messages: 2000, pages: 200, seats: 3, popular: true },
  { id: "pro", price: 199, was: 289, messages: 10000, pages: 1000, seats: 10 },
];

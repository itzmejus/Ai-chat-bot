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
 * The limits must match the `Plan` rows created by the first database migration.
 * PRICES ARE PLACEHOLDERS: online payment is not built yet, so nothing in the app
 * charges these amounts. Set the real monthly prices (in AED) here before launch.
 */
export const SITE_PLANS: { id: PlanId; priceAed: number; messages: number; pages: number; seats: number; popular?: boolean }[] = [
  { id: "free", priceAed: 0, messages: 200, pages: 25, seats: 1 },
  { id: "starter", priceAed: 99, messages: 2000, pages: 200, seats: 3, popular: true },
  { id: "pro", priceAed: 299, messages: 10000, pages: 1000, seats: 10 },
];

"use client";

import { Analytics, type BeforeSendEvent } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";

/** Paths whose last part is a secret one-time code (invitations, password reset, email confirmation). */
const TOKEN_PATHS = /^\/(invite|reset-password|verify-email)\/[^/]+/;

/**
 * The address as it may be stored: without query string or fragment, and with one-time codes in
 * the path replaced, so links that grant access never end up in Vercel's dashboards.
 */
export function redactUrl(address: string): string {
  const url = new URL(address);
  url.search = "";
  url.hash = "";
  url.pathname = url.pathname.replace(TOKEN_PATHS, "/$1/[token]");
  return url.toString();
}

/** Before a page view leaves the browser (Web Analytics). Exported for the tests. */
export const redactPageView = (event: BeforeSendEvent): BeforeSendEvent => ({ ...event, url: redactUrl(event.url) });

/** Before a speed measurement leaves the browser (Speed Insights). Exported for the tests. */
export const redactVital = <T extends { url: string }>(event: T): T => ({ ...event, url: redactUrl(event.url) });

/**
 * Vercel Web Analytics (page views and visitors) and Speed Insights (how fast pages load for real
 * visitors), both without cookies. They only report when the app runs on Vercel (elsewhere their
 * scripts are simply not found). The chat widget is not measured: it is served as its own
 * document (src/app/embed), outside this layout.
 */
export function VercelAnalytics() {
  return (
    <>
      <Analytics beforeSend={redactPageView} />
      <SpeedInsights beforeSend={redactVital} />
    </>
  );
}

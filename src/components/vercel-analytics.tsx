"use client";

import { Analytics, type BeforeSendEvent } from "@vercel/analytics/next";

/** Paths whose last part is a secret one-time code (invitations, password reset, email confirmation). */
const TOKEN_PATHS = /^\/(invite|reset-password|verify-email)\/[^/]+/;

/**
 * Before a page view leaves the browser: drop the query string and replace one-time codes in the
 * path, so links that grant access are never stored in the analytics. Exported for the tests.
 */
export function redactPageView(event: BeforeSendEvent): BeforeSendEvent {
  const url = new URL(event.url);
  url.search = "";
  url.hash = "";
  url.pathname = url.pathname.replace(TOKEN_PATHS, "/$1/[token]");
  return { ...event, url: url.toString() };
}

/**
 * Vercel Web Analytics: page views and visitors, without cookies. Only reports when the app runs
 * on Vercel (elsewhere the script is simply not found). The chat widget is not counted: it is
 * served as its own document (src/app/embed), outside this layout.
 */
export function VercelAnalytics() {
  return <Analytics beforeSend={redactPageView} />;
}

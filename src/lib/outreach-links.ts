/**
 * Tracked links for the outreach email. Every link in the email goes through `/go` on the app
 * host, which counts the click, remembers for 30 days that the visitor came from outreach (so a
 * later sign-up is credited to it) and forwards them with UTM tags for web analytics.
 *
 * Pure string building: used by the email template (browser preview and server) and by `/go`.
 */

/** Where a tracked link may lead. Only these keys are accepted, so `/go` can never redirect elsewhere. */
export const TRACK_TARGETS = ["signup", "site"] as const;
export type TrackTarget = (typeof TRACK_TARGETS)[number];

/** Which link in the email was clicked. */
export const TRACK_BUTTONS = ["start", "site", "logo", "image", "text"] as const;
export type TrackButton = (typeof TRACK_BUTTONS)[number];

/** Business name as it appears in links and reports: "Bright Smile Dental" -> "bright-smile-dental". */
export function businessSlug(name: string): string {
  const slug = name
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "") // accents: "café" -> "cafe"
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60)
    .replace(/-+$/, "");
  return slug || "general";
}

/** `${trackUrl}?to=signup&b=bright-smile-dental&btn=start` */
export function trackedLink(trackUrl: string, to: TrackTarget, business: string, button: TrackButton): string {
  const params = new URLSearchParams({ to, b: businessSlug(business), btn: button });
  return `${trackUrl}?${params}`;
}

/** UTM tags added to the final address, so web analytics can show where visitors came from. */
export function utmParams(business: string, button: TrackButton): URLSearchParams {
  return new URLSearchParams({ utm_source: "outreach", utm_medium: "email", utm_campaign: businessSlug(business), utm_content: button });
}

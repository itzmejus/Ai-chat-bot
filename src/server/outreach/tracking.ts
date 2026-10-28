import { cookies } from "next/headers";
import { businessSlug, TRACK_BUTTONS, TRACK_TARGETS, type TrackButton, type TrackTarget } from "@/lib/outreach-links";
import { prisma } from "@/server/db/prisma";

/**
 * Outreach email tracking, free and without third parties:
 *
 *   1. Every link in the email goes to `/go` (src/app/go/route.ts), which calls `recordClick()`
 *      and sets REF_COOKIE on the app host, then forwards the visitor with UTM tags.
 *   2. When that visitor signs up within 30 days (password or Google), `signupSource()` reads the
 *      cookie and the new user is saved with `signupSource = "outreach:<business>"`.
 *   3. Admin -> Outreach shows `outreachReport()`: clicks and sign-ups per business.
 */

export const REF_COOKIE = "selo_ref";
export const REF_MAX_AGE = 30 * 24 * 60 * 60;
const SOURCE_PATTERN = /^outreach:[a-z0-9-]{1,60}$/;

/** Set after a counted click, so the same person tapping again within the window isn't counted twice (see `seenCookie`). */
export const SEEN_COOKIE = "selo_seen";
export const SEEN_MAX_AGE = 30 * 60;

/**
 * Link checkers run by mail servers (Outlook Safe Links, Proofpoint, Mimecast...) and link
 * previews (Instagram/Facebook/WhatsApp DMs and bios fetch a link several times to build the
 * card) open every link before the person does; they are not counted.
 */
const NOT_A_PERSON =
  /bot|crawl|spider|preview|scan|safe ?links|proofpoint|mimecast|barracuda|headless|python|curl|wget|go-http|java\/|okhttp|axios|node-fetch|facebookexternalhit|facebookcatalog|meta-external|whatsapp\/|embedly|iframely|vkshare|bitlybot|snap url/i;

export type TrackRequest = { target: TrackTarget; business: string; button: TrackButton };

/** The /go query, checked: only known targets and buttons, business as a slug. Null if invalid. */
export function parseTrackRequest(params: URLSearchParams): TrackRequest | null {
  const target = params.get("to");
  const button = params.get("btn") ?? "text";
  if (!TRACK_TARGETS.includes(target as TrackTarget)) return null;
  return {
    target: target as TrackTarget,
    business: businessSlug(params.get("b") ?? ""),
    button: (TRACK_BUTTONS.includes(button as TrackButton) ? button : "text") as TrackButton,
  };
}

export type ClickContext = {
  userAgent: string | null;
  /** Signed-in users (e.g. the admin testing the preview) are not counted. */
  signedIn: boolean;
  /** HEAD requests are link checkers; Next.js answers them with the GET handler. */
  method?: string;
  /** Sec-Fetch-Mode: modern browsers send "navigate" when a person opens a link; prefetches and fetchers don't. */
  fetchMode?: string | null;
  /** This browser already had a click counted for this business in the last SEEN_MAX_AGE. */
  seen?: boolean;
};

/** Whether a click should be counted: one per person per business, real page opens in real browsers only. */
export function isCountable({ userAgent, signedIn, method = "GET", fetchMode, seen = false }: ClickContext): boolean {
  if (signedIn || seen || method !== "GET" || !userAgent || NOT_A_PERSON.test(userAgent)) return false;
  // Older browsers don't send the header at all, so only a present, non-navigate value rules a click out.
  return !fetchMode || fetchMode === "navigate";
}

/** One short-lived cookie per business: "selo_seen_flowers-ae". */
export const seenCookie = (business: string) => `${SEEN_COOKIE}_${businessSlug(business)}`;

export async function recordClick({ target, business, button }: TrackRequest) {
  await prisma.outreachClick.create({ data: { target, business, button } });
}

export const sourceFor = (business: string) => `outreach:${businessSlug(business)}`;

/** Where the person signing up came from, if they arrived through an outreach link in the last 30 days. */
export async function signupSource(): Promise<string | null> {
  try {
    const value = (await cookies()).get(REF_COOKIE)?.value ?? "";
    return SOURCE_PATTERN.test(value) ? value : null;
  } catch {
    return null; // outside a request (tests, scripts)
  }
}

/** The latest individual clicks, newest first, to tell a person reading (spread out) from a link checker (all within seconds). */
export async function recentClicks(limit = 50) {
  return prisma.outreachClick.findMany({ orderBy: { createdAt: "desc" }, take: limit, select: { id: true, business: true, button: true, target: true, createdAt: true } });
}

export type OutreachRow ={ business: string; clicks: number; startClicks: number; lastClick: Date; signups: number };

/** Clicks and sign-ups per business over the last `days` days, most recent first. */
export async function outreachReport(days = 90, now = new Date()) {
  const since = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
  const [clicks, starts, signups] = await Promise.all([
    prisma.outreachClick.groupBy({ by: ["business"], where: { createdAt: { gte: since } }, _count: { _all: true }, _max: { createdAt: true } }),
    prisma.outreachClick.groupBy({ by: ["business"], where: { createdAt: { gte: since }, target: "signup" }, _count: { _all: true } }),
    prisma.user.groupBy({ by: ["signupSource"], where: { createdAt: { gte: since }, signupSource: { startsWith: "outreach:" } }, _count: { _all: true } }),
  ]);
  const startsBy = new Map(starts.map((row) => [row.business, row._count._all]));
  const signupsBy = new Map(signups.map((row) => [row.signupSource!.slice("outreach:".length), row._count._all]));

  const rows: OutreachRow[] = clicks.map((row) => ({
    business: row.business,
    clicks: row._count._all,
    startClicks: startsBy.get(row.business) ?? 0,
    lastClick: row._max.createdAt!,
    signups: signupsBy.get(row.business) ?? 0,
  }));
  rows.sort((a, b) => b.lastClick.getTime() - a.lastClick.getTime());
  return {
    days,
    rows,
    totalClicks: rows.reduce((sum, row) => sum + row.clicks, 0),
    totalSignups: signups.reduce((sum, row) => sum + row._count._all, 0),
  };
}

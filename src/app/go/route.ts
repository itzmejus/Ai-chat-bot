import { NextResponse, type NextRequest } from "next/server";
import { APP_URL, SITE_URL } from "@/lib/config";
import { utmParams } from "@/lib/outreach-links";
import { inBackground } from "@/server/background";
import { isCountable, parseTrackRequest, recordClick, REF_COOKIE, REF_MAX_AGE, sourceFor } from "@/server/outreach/tracking";

/**
 * Tracked link from an outreach email: /go?to=signup&b=bright-smile-dental&btn=start
 * Counts the click, remembers the source for a later sign-up and forwards to the page with UTM
 * tags. `to` is a fixed key, never an address, so this can't be used to redirect anywhere else.
 */
export function GET(request: NextRequest) {
  const track = parseTrackRequest(request.nextUrl.searchParams);
  if (!track) return NextResponse.redirect(SITE_URL);

  const signedIn = request.cookies.getAll().some((cookie) => cookie.name.includes("authjs.session-token"));
  if (isCountable(request.headers.get("user-agent"), signedIn)) {
    inBackground("outreach click", () => recordClick(track));
  }

  const base = track.target === "signup" ? `${APP_URL}/signup` : `${SITE_URL}/`;
  const response = NextResponse.redirect(`${base}?${utmParams(track.business, track.button)}`);
  response.cookies.set(REF_COOKIE, sourceFor(track.business), {
    maxAge: REF_MAX_AGE,
    httpOnly: true,
    sameSite: "lax",
    secure: APP_URL.startsWith("https://"),
    path: "/",
  });
  response.headers.set("Cache-Control", "no-store");
  return response;
}

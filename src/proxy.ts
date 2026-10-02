import { NextResponse, type NextRequest } from "next/server";
import { APP_URL, SITE_URL, WIDGET_URL } from "@/lib/config";
import { matchSitePath } from "@/lib/site-routes";

/**
 * Host separation and marketing-site routing. One deployment can answer on three hostnames:
 *   - the site host   (public marketing pages, sitemap, robots)
 *   - the app host    (dashboard, login, dashboard APIs)
 *   - the widget host (widget script, chat iframe, public chat API)
 * Each host only serves its own paths. Hosts that share a URL (local development uses one
 * for everything) simply serve both sets.
 *
 * Marketing pages are rewritten to src/app/(site)/[lang]/...: "/pricing" renders
 * "/en/pricing", "/ar/pricing" renders itself. The language is also passed on in a header
 * so the root layout can set <html lang dir> (see src/i18n/request.ts).
 */

const appHost = new URL(APP_URL).host;
const widgetHost = new URL(WIDGET_URL).host;
const siteHost = new URL(SITE_URL).host;

const SITE_LOCALE_HEADER = "x-site-locale";

const isWidgetPath = (path: string) =>
  path === "/widget.js" || path === "/widget-app.js" || path.startsWith("/embed/") || path.startsWith("/api/widget/");

/** Files search engines and link previews fetch from the site host. */
const isSiteFile = (path: string) => path === "/sitemap.xml" || path === "/robots.txt" || path.startsWith("/opengraph-image");

export function proxy(request: NextRequest) {
  const host = request.headers.get("x-forwarded-host") ?? request.headers.get("host") ?? "";
  const path = request.nextUrl.pathname;

  // ---- widget host: widget paths only
  if (widgetHost !== appHost && host === widgetHost) {
    if (isWidgetPath(path)) return NextResponse.next();
    if (path === "/") return NextResponse.redirect(SITE_URL);
    return new NextResponse("Not found", { status: 404 });
  }
  if (widgetHost !== appHost && host === appHost && (path.startsWith("/embed/") || path.startsWith("/api/widget/"))) {
    return new NextResponse("Not found", { status: 404 });
  }

  // "/en/pricing" is an internal address; the public one has no prefix.
  if (path === "/en" || path.startsWith("/en/")) {
    return NextResponse.redirect(new URL(path.slice(3) || "/", request.url), 308);
  }

  const sitePage = matchSitePath(path);
  const separateSite = siteHost !== appHost;

  if (separateSite && host === appHost) {
    // The app host has no home page of its own; marketing pages belong to the site host.
    if (path === "/") return NextResponse.redirect(new URL("/dashboard", request.url));
    if (sitePage) return NextResponse.redirect(SITE_URL + path, 308);
    return NextResponse.next();
  }

  // "www.example.com" and "example.com" are the same site. Send the other spelling to the
  // configured one, so search engines index a single address for each page.
  if (sitePage && (host === `www.${siteHost}` || `www.${host}` === siteHost)) {
    return NextResponse.redirect(SITE_URL + path + request.nextUrl.search, 308);
  }

  if (sitePage) {
    const headers = new Headers(request.headers);
    headers.set(SITE_LOCALE_HEADER, sitePage.lang);
    const url = request.nextUrl.clone();
    url.pathname = `/${sitePage.lang}${sitePage.page}`;
    return NextResponse.rewrite(url, { request: { headers } });
  }

  if (separateSite && host === siteHost && !isSiteFile(path) && !path.includes(".")) {
    // Login, signup, dashboard links and the like: send them to the app.
    if (isWidgetPath(path) || path.startsWith("/api/")) return new NextResponse("Not found", { status: 404 });
    return NextResponse.redirect(APP_URL + path + request.nextUrl.search);
  }

  return NextResponse.next();
}

export const config = {
  // Skip Next.js build assets.
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};

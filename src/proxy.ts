import { NextResponse, type NextRequest } from "next/server";
import { APP_URL, WIDGET_URL } from "@/lib/config";

/**
 * Host separation. In production the same deployment answers on two hostnames:
 *   - the app host (dashboard, login, dashboard APIs)
 *   - the widget host (widget script, chat iframe, public chat API)
 * Each host only serves its own paths. When both URLs are the same (local
 * development) this does nothing.
 */

const appHost = new URL(APP_URL).host;
const widgetHost = new URL(WIDGET_URL).host;

const isWidgetPath = (path: string) =>
  path === "/widget.js" || path === "/widget-app.js" || path.startsWith("/embed/") || path.startsWith("/api/widget/");

export function proxy(request: NextRequest) {
  if (appHost === widgetHost) return NextResponse.next();

  const host = request.headers.get("x-forwarded-host") ?? request.headers.get("host") ?? "";
  const path = request.nextUrl.pathname;

  if (host === widgetHost && !isWidgetPath(path)) {
    // Someone opened the widget host in a browser: send them to the product.
    if (path === "/") return NextResponse.redirect(APP_URL);
    return new NextResponse("Not found", { status: 404 });
  }
  if (host === appHost && (path.startsWith("/embed/") || path.startsWith("/api/widget/"))) {
    return new NextResponse("Not found", { status: 404 });
  }
  return NextResponse.next();
}

export const config = {
  // Skip Next.js build assets.
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};

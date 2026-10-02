import { APP_URL } from "@/lib/config";
import { frameAncestors, isOriginAllowed } from "@/lib/widget-domains";
import { getWidgetWorkspace } from "@/server/widget/service";
import { createWidgetToken, verifyWidgetToken } from "@/server/widget/token";

/**
 * GET /embed/[key] — the page loaded inside the chat iframe.
 *
 * It is a route handler (not a React page) so that the response can carry a
 * per-workspace Content-Security-Policy and stay tiny: a JSON config block and
 * one script (the standalone widget bundle built from /widget).
 *
 * Domain whitelist enforcement happens here:
 *   - `frame-ancestors` makes browsers refuse to show the iframe on other sites
 *   - a request that names a non-whitelisted embedding page is refused outright
 *   - opening the URL directly in a tab is refused (it is not an embedding at all)
 * Only then is a widget token issued for the chat API.
 */

const page = (body: string, lang = "en") =>
  `<!doctype html><html lang="${lang}"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover"><meta name="robots" content="noindex"><title>Chat</title><style>html,body{margin:0;padding:0;background:transparent}</style></head><body>${body}</body></html>`;

function refuse(status: number, message: string) {
  return new Response(page(`<p style="font:14px system-ui;color:#62616d;padding:16px">${message}</p>`), {
    status,
    headers: { "Content-Type": "text/html; charset=utf-8", "Cache-Control": "no-store", "Content-Security-Policy": "frame-ancestors 'none'" },
  });
}

export async function GET(request: Request, ctx: RouteContext<"/embed/[key]">) {
  const { key } = await ctx.params;
  const found = await getWidgetWorkspace(key);
  if (!found) return refuse(404, "This chat is not available.");

  const url = new URL(request.url);
  const appOrigin = new URL(APP_URL).origin;

  // Dashboard preview: the dashboard passes a short-lived signed token for this workspace.
  const previewToken = verifyWidgetToken(url.searchParams.get("preview"));
  const preview = previewToken?.preview === true && previewToken.w === found.workspaceId;

  // The preview may be framed by the dashboard page that requested it. That page's origin is
  // inside the signed token, so the preview works on whatever hostname the dashboard is opened
  // from (app., www.app., the hosting provider's own address) without widening anything else.
  const dashboardOrigin = previewToken?.origin ?? appOrigin;
  const ancestors = preview ? frameAncestors([], [dashboardOrigin]) : frameAncestors(found.allowedDomains);

  if (!preview) {
    // A top-level visit is not an embedding on an approved website.
    if (request.headers.get("sec-fetch-dest") === "document") {
      return refuse(403, "This chat can only be opened from the business's website.");
    }
    // Browsers send the embedding page's origin as the Referer of an iframe load.
    const referer = request.headers.get("referer");
    if (referer && !isOriginAllowed(referer, found.allowedDomains)) {
      return refuse(403, "This website is not approved to show this chat.");
    }
    if (found.allowedDomains.length === 0) return refuse(403, "This chat has no approved websites yet.");
  }

  const data = {
    ...found.config,
    token: createWidgetToken(found.workspaceId, { preview }),
    preview,
    // In preview, the dashboard may push unsaved settings to the iframe from this origin only.
    previewOrigin: preview ? dashboardOrigin : null,
  };
  // "<" is escaped so business-supplied text cannot close the JSON block.
  const json = JSON.stringify(data).replace(/</g, "\\u003c");
  const lang = found.config.language === "ar" ? "ar" : "en";

  return new Response(
    page(`<script type="application/json" id="widget-config">${json}</script><script src="/widget-app.js" defer></script>`, lang),
    {
      headers: {
        "Content-Type": "text/html; charset=utf-8",
        "Cache-Control": "no-store",
        "Referrer-Policy": "no-referrer",
        "X-Content-Type-Options": "nosniff",
        "Content-Security-Policy": [
          `frame-ancestors ${ancestors}`,
          "default-src 'none'",
          "script-src 'self'",
          "style-src 'unsafe-inline'",
          "img-src https: data:",
          "connect-src 'self'",
          "base-uri 'none'",
          "form-action 'none'",
        ].join("; "),
      },
    },
  );
}

import { headers } from "next/headers";
import { getTranslations } from "next-intl/server";
import { ChatScene, DotPattern } from "@/components/illustrations";
import { WidgetSettings } from "@/components/widget/widget-settings";
import { APP_URL, WIDGET_URL } from "@/lib/config";
import { requireWorkspace } from "@/server/auth/session";
import { createWidgetToken } from "@/server/widget/token";

export const metadata = { title: "Widget" };

/** Widget settings: appearance, allowed websites, embed code, and a live preview. */
export default async function WidgetPage() {
  const { workspace, db, role } = await requireWorkspace();
  const t = await getTranslations("widget");
  const [widget, assistant] = await Promise.all([db.widgetSettings.findFirst(), db.assistantSettings.findFirst()]);

  // The one line a business pastes on its website. The key is public by design.
  const embedCode = `<script src="${WIDGET_URL}/widget.js" data-workspace="${workspace.publicKey}" async></script>`;
  // The preview iframe is authorised by a short-lived signed token rather than the login
  // cookie, because the widget is served from a different hostname than the dashboard.
  // The token names the address this dashboard page is being viewed on; only that address may frame the preview.
  const requestHeaders = await headers();
  const host = requestHeaders.get("x-forwarded-host") ?? requestHeaders.get("host") ?? new URL(APP_URL).host;
  const protocol = requestHeaders.get("x-forwarded-proto")?.split(",")[0] ?? (host.startsWith("localhost") ? "http" : "https");
  const previewToken = createWidgetToken(workspace.id, { preview: true, origin: `${protocol}://${host}`, ttlSeconds: 2 * 60 * 60 });
  const previewUrl = `${WIDGET_URL}/embed/${workspace.publicKey}?preview=${encodeURIComponent(previewToken)}`;

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-6">
      <section className="hero-surface relative overflow-hidden rounded-3xl p-5 text-white shadow-xl sm:p-8">
        <DotPattern className="text-white/10" />
        <ChatScene className="pointer-events-none absolute -end-28 -top-6 w-60 opacity-25 sm:-end-2 sm:top-1/2 sm:w-72 sm:-translate-y-1/2 sm:opacity-100 lg:end-8" />
        <div className="relative max-w-[85%] sm:max-w-md lg:max-w-xl">
          <h1 className="text-[26px] leading-tight font-bold tracking-tight sm:text-4xl">{t("title")}</h1>
          <p className="mt-2 text-sm text-white/65 sm:text-base">{t("subtitle")}</p>
          <ol className="mt-5 flex flex-wrap gap-2 text-xs font-medium text-white/85">
            {(["stepKnowledge", "stepDomains", "stepEmbed"] as const).map((key, i) => (
              <li key={key} className="flex items-center gap-2 rounded-full bg-white/10 py-1 ps-1 pe-3 ring-1 ring-white/15">
                <span className="flex size-5 items-center justify-center rounded-full bg-white/20 text-[11px]">{i + 1}</span>
                {t(key)}
              </li>
            ))}
          </ol>
        </div>
      </section>

      <WidgetSettings
        initial={{
          brandColor: widget?.brandColor ?? "#2563eb",
          logoUrl: widget?.logoUrl ?? "",
          position: widget?.position ?? "right",
          preChatForm: widget?.preChatForm ?? false,
          showProducts: widget?.showProducts ?? true,
          assistantName: assistant?.assistantName ?? "Assistant",
          greeting: assistant?.greeting ?? "",
          allowedDomains: widget?.allowedDomains ?? [],
        }}
        canEdit={role === "owner"}
        embedCode={embedCode}
        previewUrl={previewUrl}
        widgetOrigin={new URL(WIDGET_URL).origin}
      />
    </div>
  );
}

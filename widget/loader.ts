/**
 * widget.js — the one-line embed script.
 *
 *   <script src="https://chat.example.com/widget.js" data-workspace="pk_..." async></script>
 *
 * It adds a single iframe to the host page and resizes it when the chat opens
 * or closes. On phones the open chat is a sheet over the lower part of the page
 * that stays above the on-screen keyboard; it never takes the whole screen. Everything visible (launcher bubble, chat window) is drawn inside
 * the iframe, so the host site's CSS cannot affect the widget and the widget
 * cannot affect the host site.
 */
(() => {
  const script = (document.currentScript as HTMLScriptElement | null) ?? document.querySelector<HTMLScriptElement>("script[data-workspace]");
  const key = script?.dataset.workspace;
  const flag = "__chatWidgetLoaded";
  const w = window as unknown as Record<string, unknown>;
  if (!script || !key || w[flag]) return;
  w[flag] = true;

  const origin = new URL(script.src, location.href).origin;
  const iframe = document.createElement("iframe");
  iframe.src = `${origin}/embed/${encodeURIComponent(key)}`;
  iframe.title = "Chat";
  iframe.setAttribute("allowtransparency", "true");
  // Hidden until the iframe reports it is ready. If this site is not on the
  // business's whitelist the browser blocks the iframe and nothing ever shows.
  iframe.style.cssText =
    "position:fixed;bottom:0;border:0;padding:0;margin:0;background:transparent;color-scheme:normal;z-index:2147483000;display:none;max-width:100vw;max-height:100dvh;";

  let open = false;
  let side: "left" | "right" = "right";

  /** The part of the page not covered by the on-screen keyboard or browser bars. */
  const viewport = window.visualViewport;

  function layout() {
    const mobile = window.innerWidth <= 520;
    const s = iframe.style;
    s.left = side === "left" ? "0" : "auto";
    s.right = side === "right" ? "0" : "auto";
    s.bottom = "0";
    if (!open) {
      s.width = "92px";
      s.height = "92px";
    } else if (mobile) {
      // A sheet across the bottom of the screen that leaves the page visible above it.
      // While the keyboard is up, sit on top of it and use the room that is left.
      const visible = viewport?.height ?? window.innerHeight;
      const keyboard = viewport ? Math.max(0, window.innerHeight - viewport.height - viewport.offsetTop) : 0;
      s.left = "0";
      s.right = "0";
      s.width = "100%";
      s.bottom = `${Math.round(keyboard)}px`;
      s.height = `${Math.round(Math.min(640, keyboard > 0 ? visible - 8 : visible * 0.82))}px`;
    } else {
      s.width = "420px";
      s.height = "min(740px, 100dvh)";
    }
    // The iframe cannot see the page's width, so tell it whether this is a phone-sized screen.
    iframe.contentWindow?.postMessage({ type: "chat-widget:host", mobile }, origin);
  }

  window.addEventListener("message", (event) => {
    if (event.origin !== origin || event.source !== iframe.contentWindow) return;
    const data = event.data as { type?: string; position?: "left" | "right"; open?: boolean };
    if (data?.type === "chat-widget:ready") {
      side = data.position === "left" ? "left" : "right";
      layout();
      iframe.style.display = "block";
    } else if (data?.type === "chat-widget:state") {
      open = Boolean(data.open);
      layout();
    }
  });
  window.addEventListener("resize", layout);
  viewport?.addEventListener("resize", layout);
  viewport?.addEventListener("scroll", layout);

  const mount = () => document.body.appendChild(iframe);
  if (document.body) mount();
  else document.addEventListener("DOMContentLoaded", mount);
})();

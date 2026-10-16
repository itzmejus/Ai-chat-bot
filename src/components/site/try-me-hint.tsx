"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

const SEEN_KEY = "try-me-seen";

/**
 * A hand-drawn "Try me!" arrow pointing at the site's own chat bubble. It only shows once the
 * widget has loaded (the widget script announces it with a "chat-widget" event), opens the chat
 * when clicked, and goes away for good once the visitor has opened the chat.
 */
export function TryMeHint({ label }: { label: string }) {
  const [side, setSide] = useState<"left" | "right" | null>(null);

  useEffect(() => {
    let seen = false;
    try {
      seen = sessionStorage.getItem(SEEN_KEY) === "1";
    } catch {}
    if (seen) return;

    let timer: ReturnType<typeof setTimeout> | undefined;
    const onWidget = (event: Event) => {
      const { ready, open, position } = (event as CustomEvent<{ ready: boolean; open: boolean; position: "left" | "right" }>).detail;
      if (open) {
        clearTimeout(timer);
        setSide(null);
        try {
          sessionStorage.setItem(SEEN_KEY, "1");
        } catch {}
        window.removeEventListener("chat-widget", onWidget);
      } else if (ready) {
        // A moment after the bubble appears, so the two do not pop in together.
        clearTimeout(timer);
        timer = setTimeout(() => setSide(position), 1500);
      }
    };
    window.addEventListener("chat-widget", onWidget);
    return () => {
      clearTimeout(timer);
      window.removeEventListener("chat-widget", onWidget);
    };
  }, []);

  if (!side) return null;
  const left = side === "left";

  return (
    // Sits just above the bubble, on the same side; the arrow ends at the bubble.
    <a
      href="#"
      data-chat-open
      dir="ltr"
      aria-label={label}
      className={cn(
        "site-pop fixed bottom-[88px] z-[2147482999] hidden flex-col items-end text-primary sm:flex",
        left ? "left-[64px] items-start" : "right-[64px]",
      )}
    >
      <span className="site-try-me flex flex-col items-end">
        <span className="-rotate-6 rounded-full bg-white px-3.5 py-1.5 text-[15px] font-bold whitespace-nowrap shadow-[0_8px_24px_-10px_rgb(220_38_38/0.6)] ring-1 ring-primary/15">
          {label}
        </span>
        <svg width="74" height="58" viewBox="0 0 74 58" fill="none" aria-hidden className={cn("-mt-1 me-1", left && "-scale-x-100 self-start")}>
          {/* A loose curve down and to the right, ending in an arrow head at the bubble. */}
          <path d="M8 4c4 22 22 38 54 46" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
          <path d="M50 54l13-3.5L54 41" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </span>
    </a>
  );
}

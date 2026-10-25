"use client";

import Script from "next/script";
import { useEffect, useRef } from "react";

/** Our Trustpilot profile (business unit) and its public review page. */
const BUSINESS_UNIT_ID = "6addb3d44716e8a5ad9e8839";
const REVIEW_URL = "https://www.trustpilot.com/review/assist.siteselo.com";

/** Trustpilot's "Review Collector" TrustBox: a "Review us on Trustpilot" button. */
const REVIEW_COLLECTOR = "56278e9abfbbba0bdcd568bc";

declare global {
  interface Window {
    Trustpilot?: { loadFromElement: (element: HTMLElement, forceReload?: boolean) => void };
  }
}

/**
 * The "Review us on Trustpilot" button. Trustpilot's script draws every widget it finds when it
 * first loads; pages reached later through client-side navigation mount a new element, so the
 * widget asks to be drawn itself once the script is there. Until then (and without JavaScript)
 * it is a plain link to the review page.
 */
export function TrustpilotReviewCollector({ className }: { className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const load = () => {
    if (ref.current && window.Trustpilot) window.Trustpilot.loadFromElement(ref.current, true);
  };

  useEffect(load, []);

  return (
    <>
      <Script src="https://widget.trustpilot.com/bootstrap/v5/tp.widget.bootstrap.min.js" strategy="lazyOnload" onReady={load} />
      <div
        ref={ref}
        className={`trustpilot-widget ${className ?? ""}`}
        data-locale="en-US"
        data-template-id={REVIEW_COLLECTOR}
        data-businessunit-id={BUSINESS_UNIT_ID}
        data-style-height="52px"
        data-style-width="100%"
      >
        <a href={REVIEW_URL} target="_blank" rel="noopener" className="text-sm font-medium text-white/85 underline-offset-4 hover:text-white hover:underline">
          Review us on Trustpilot
        </a>
      </div>
    </>
  );
}

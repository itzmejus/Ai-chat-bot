"use client";

import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { useRef, useState } from "react";
import type { ChatLine } from "@/content/site";
import type { IndustrySlug } from "@/lib/site-routes";
import { cn } from "@/lib/utils";
import { INDUSTRY_ART } from "./art";

type Item = { slug: IndustrySlug; name: string; short: string; title: string; questions: string[]; chat: ChatLine[]; href: string };

/**
 * Industries as tabs. Phones get a row of chips that scrolls sideways; wider screens a
 * column of tabs beside the panel. Arrow keys move between tabs, as in any tab list.
 * All panels are rendered (inactive ones hidden) so their text is in the page's HTML.
 */
export function IndustryTabs({ items, label, asks, more }: { items: Item[]; label: string; asks: string; more: string }) {
  const [active, setActive] = useState(0);
  const tabs = useRef<(HTMLButtonElement | null)[]>([]);

  function onKeyDown(event: React.KeyboardEvent) {
    const rtl = getComputedStyle(event.currentTarget).direction === "rtl";
    const step = { ArrowDown: 1, ArrowUp: -1, ArrowRight: rtl ? -1 : 1, ArrowLeft: rtl ? 1 : -1 }[event.key];
    const next = event.key === "Home" ? 0 : event.key === "End" ? items.length - 1 : step ? (active + step + items.length) % items.length : null;
    if (next === null) return;
    event.preventDefault();
    setActive(next);
    tabs.current[next]?.focus();
  }

  return (
    <div className="flex flex-col gap-5 sm:gap-8">
      <div
        role="tablist"
        aria-label={label}
        onKeyDown={onKeyDown}
        className="-mx-4 flex snap-x scroll-px-4 gap-1 overflow-x-auto px-4 [scrollbar-width:none] sm:mx-auto sm:max-w-full sm:rounded-2xl sm:bg-muted sm:p-1.5 [&::-webkit-scrollbar]:hidden"
      >
        {items.map((item, i) => {
          const selected = i === active;
          return (
            <button
              key={item.slug}
              ref={(node) => {
                tabs.current[i] = node;
              }}
              type="button"
              role="tab"
              id={`industry-tab-${item.slug}`}
              aria-selected={selected}
              aria-controls={`industry-panel-${item.slug}`}
              tabIndex={selected ? 0 : -1}
              onClick={() => setActive(i)}
              className={cn(
                "flex h-11 shrink-0 snap-start items-center rounded-xl px-4 text-[15px] font-semibold whitespace-nowrap transition-colors outline-none focus-visible:ring-4 focus-visible:ring-ring/20 max-sm:bg-muted sm:px-5",
                selected ? "bg-foreground text-white sm:bg-white sm:text-foreground sm:shadow-[0_2px_8px_rgb(27_27_32/0.12)]" : "text-muted-foreground hover:text-foreground",
              )}
            >
              {item.name}
            </button>
          );
        })}
      </div>

      {items.map((item, i) => {
        const Art = INDUSTRY_ART[item.slug];
        return (
          <div
            key={item.slug}
            role="tabpanel"
            id={`industry-panel-${item.slug}`}
            aria-labelledby={`industry-tab-${item.slug}`}
            hidden={i !== active}
            className="grid gap-6 rounded-[2rem] bg-accent p-4 sm:p-8 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)] lg:gap-10 lg:p-10"
          >
            <div className="flex flex-col items-start gap-4">
              <Art />
              <h3 className="text-2xl leading-tight font-bold tracking-tight text-balance">{item.title}</h3>
              <p className="text-[15px] leading-relaxed text-muted-foreground">{item.short}</p>
              <Link href={item.href} className="group mt-auto flex h-11 items-center gap-2 rounded-xl bg-foreground px-5 text-[15px] font-semibold text-white hover:bg-foreground/85">
                {more}
                <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5 rtl:rotate-180 rtl:group-hover:-translate-x-0.5" />
              </Link>
            </div>

            <div className="flex flex-col gap-4 rounded-3xl bg-white p-4 shadow-[0_18px_40px_-24px_rgb(80_24_16/0.45)] sm:p-5">
              <p className="text-xs font-bold tracking-wide text-muted-foreground uppercase">{asks}</p>
              <ul className="flex flex-wrap gap-2">
                {item.questions.map((question) => (
                  <li key={question} dir="auto" className="rounded-full border border-border bg-white px-3 py-1.5 text-[13px] font-medium">
                    {question}
                  </li>
                ))}
              </ul>
              <div aria-hidden className="mt-auto flex flex-col gap-2 border-t border-border pt-4">
                {item.chat.map((line, j) => (
                  <p
                    key={j}
                    dir="auto"
                    className={cn(
                      "max-w-[88%] rounded-2xl px-3.5 py-2.5 text-[13px] leading-relaxed",
                      line.from === "customer" ? "self-end rounded-ee-md bg-primary text-white" : "self-start rounded-es-md bg-muted",
                    )}
                  >
                    {line.text}
                  </p>
                ))}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

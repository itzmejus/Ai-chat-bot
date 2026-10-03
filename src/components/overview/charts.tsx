"use client";

import { useFormatter, useTranslations } from "next-intl";
import { useState } from "react";
import { cn } from "@/lib/utils";

/**
 * Overview charts. Plain HTML and CSS (no chart library).
 *
 * Conventions: marks carry colour, text stays in text colours; columns are thin
 * with a rounded data end and a square baseline; touching segments are separated
 * by a 2px gap; every value is also reachable without hovering (legend, axis, or
 * the screen-reader table).
 */

/** Round an axis maximum up to a clean number (1, 2 or 5 times a power of ten). */
function niceMax(value: number): number {
  if (value <= 4) return 4;
  const magnitude = 10 ** Math.floor(Math.log10(value));
  const scaled = value / magnitude;
  return (scaled <= 1 ? 1 : scaled <= 2 ? 2 : scaled <= 5 ? 5 : 10) * magnitude;
}

// ---------------------------------------------------------------- conversations per day

export function DailyColumns({ data }: { data: { day: string; conversations: number }[] }) {
  const t = useTranslations("overview");
  const format = useFormatter();
  const [active, setActive] = useState<number | null>(null);

  const max = niceMax(Math.max(...data.map((d) => d.conversations)));
  const ticks = [max, max / 2, 0];
  // Days are plain dates; noon UTC keeps them on the right day in any time zone.
  const dayLabel = (day: string, long = false) =>
    format.dateTime(new Date(`${day}T12:00:00Z`), long ? { weekday: "long", day: "numeric", month: "long" } : { day: "numeric", month: "short" });
  const labelled = new Set([0, Math.floor((data.length - 1) / 2), data.length - 1]);

  return (
    <figure className="flex flex-col gap-2">
      <div className="flex gap-3">
        {/* y axis */}
        <div className="flex h-44 flex-col justify-between text-end text-[11px] leading-none text-muted-foreground tabular-nums" aria-hidden>
          {ticks.map((tick) => (
            <span key={tick} className="-translate-y-1/2 last:translate-y-1/2">
              {tick}
            </span>
          ))}
        </div>

        <div className="relative h-44 min-w-0 flex-1" onPointerLeave={() => setActive(null)}>
          {/* gridlines: hairline, solid, recessive */}
          <div className="pointer-events-none absolute inset-0 flex flex-col justify-between" aria-hidden>
            {ticks.map((tick) => (
              <span key={tick} className={cn("h-px w-full", tick === 0 ? "bg-foreground/25" : "bg-border")} />
            ))}
          </div>

          {/* columns: the whole band is the hover target, not just the painted bar */}
          <div className="absolute inset-0 flex items-end" dir="ltr">
            {data.map((d, i) => (
              <button
                key={d.day}
                type="button"
                onPointerEnter={() => setActive(i)}
                onFocus={() => setActive(i)}
                onBlur={() => setActive(null)}
                aria-label={`${dayLabel(d.day, true)}: ${t("chartTooltip", { count: d.conversations })}`}
                className="group relative flex h-full min-w-0 flex-1 cursor-default items-end justify-center outline-none"
              >
                {active === i && <span className="absolute inset-y-0 w-full rounded-md bg-foreground/[0.04]" aria-hidden />}
                <span
                  className={cn(
                    "relative w-full max-w-6 rounded-t-[4px] bg-[#2563eb] transition-[height,filter] duration-300 group-focus-visible:ring-2 group-focus-visible:ring-ring group-focus-visible:ring-offset-2",
                    active !== null && active !== i && "opacity-45",
                  )}
                  style={{ height: `${(d.conversations / max) * 100}%`, minHeight: d.conversations > 0 ? 3 : 0, marginInline: 2 }}
                />
              </button>
            ))}
          </div>

          {/* tooltip: value first, label second */}
          {active !== null && (
            <div
              role="status"
              dir="ltr"
              className="pointer-events-none absolute -top-2 z-10 -translate-x-1/2 -translate-y-full rounded-lg bg-foreground px-2.5 py-1.5 text-center whitespace-nowrap text-background shadow-lg"
              style={{ left: `clamp(3.5rem, ${((active + 0.5) / data.length) * 100}%, calc(100% - 3.5rem))` }}
            >
              <p className="text-sm font-semibold">{t("chartTooltip", { count: data[active].conversations })}</p>
              <p className="text-[11px] opacity-70">{dayLabel(data[active].day, true)}</p>
            </div>
          )}
        </div>
      </div>

      {/* x axis: first, middle and last day */}
      <div className="flex ps-7 text-[11px] text-muted-foreground" dir="ltr" aria-hidden>
        {data.map((d, i) => (
          <span key={d.day} className="min-w-0 flex-1 text-center whitespace-nowrap">
            {labelled.has(i) ? dayLabel(d.day) : ""}
          </span>
        ))}
      </div>

      {/* The same numbers as a table, for screen readers. */}
      <table className="sr-only">
        <caption>{t("chartTitle")}</caption>
        <tbody>
          {data.map((d) => (
            <tr key={d.day}>
              <th scope="row">{dayLabel(d.day, true)}</th>
              <td>{d.conversations}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </figure>
  );
}

// ---------------------------------------------------------------- how conversations are handled

/**
 * Colours validated with the dataviz palette checker for colour-blind separation
 * between neighbouring segments. The legend with numbers is always shown, so
 * identity never depends on colour alone.
 */
const SEGMENTS = [
  { key: "ai", color: "#2563eb" },
  { key: "needs_human", color: "#eb6834" },
  { key: "human", color: "#1baf7a" },
  { key: "closed", color: "#4a3aa7" },
] as const;

export function HandlingBreakdown({ counts }: { counts: Record<(typeof SEGMENTS)[number]["key"], number> }) {
  const t = useTranslations();
  const [active, setActive] = useState<string | null>(null);
  const total = SEGMENTS.reduce((sum, s) => sum + counts[s.key], 0);
  const percent = (n: number) => (total > 0 ? Math.round((n / total) * 100) : 0);

  return (
    <div className="flex flex-col gap-5">
      {/* stacked bar: 2px gaps separate the segments */}
      <div className="flex h-3 gap-[2px] overflow-hidden rounded-full" dir="ltr" role="img" aria-label={t("overview.handlingTitle")}>
        {total === 0 ? (
          <span className="h-full w-full rounded-full bg-secondary" />
        ) : (
          SEGMENTS.filter((s) => counts[s.key] > 0).map((s) => (
            <span
              key={s.key}
              onPointerEnter={() => setActive(s.key)}
              onPointerLeave={() => setActive(null)}
              className={cn("h-full transition-opacity", active && active !== s.key && "opacity-35")}
              style={{ width: `${(counts[s.key] / total) * 100}%`, backgroundColor: s.color, minWidth: 6 }}
            />
          ))
        )}
      </div>

      <ul className="flex flex-col gap-2.5 text-sm">
        {SEGMENTS.map((s) => (
          <li
            key={s.key}
            onPointerEnter={() => setActive(s.key)}
            onPointerLeave={() => setActive(null)}
            className={cn("flex items-center gap-2.5 transition-opacity", active && active !== s.key && "opacity-50")}
          >
            <span className="size-2.5 shrink-0 rounded-[3px]" style={{ backgroundColor: s.color }} />
            <span className="min-w-0 flex-1 truncate text-muted-foreground">{t(`inbox.status.${s.key}`)}</span>
            <span className="font-semibold tabular-nums">{counts[s.key]}</span>
            <span className="w-10 text-end text-xs text-muted-foreground tabular-nums">{percent(counts[s.key])}%</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

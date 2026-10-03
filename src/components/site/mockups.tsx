import { Check, ChevronDown } from "lucide-react";
import { LogoMark } from "@/components/brand";
import { DotPattern } from "@/components/illustrations";
import { LOGO_BUBBLE, LOGO_SPARK } from "@/lib/logo";
import type { ChatLine, SiteContent } from "@/content/site";
import { cn } from "@/lib/utils";

/**
 * Product pictures for the public site, drawn with HTML and CSS instead of image
 * files: they stay sharp at every size, weigh almost nothing, follow the page's
 * language and direction, and are hidden from screen readers (the surrounding
 * text already says what they show).
 */

/** One chat bubble. `tone` picks colours for a light or dark surface. */
export function Bubble({ line, tone = "light", accent = "var(--primary)" }: { line: ChatLine; tone?: "light" | "dark"; accent?: string }) {
  if (line.from === "note") {
    return (
      <p dir="auto" className={cn("self-center rounded-full px-3 py-1 text-[11px] font-medium", tone === "dark" ? "bg-white/10 text-white/70" : "bg-muted text-muted-foreground")}>
        {line.text}
      </p>
    );
  }
  const mine = line.from === "customer";
  return (
    <p
      dir="auto"
      style={mine ? { backgroundColor: accent } : undefined}
      className={cn(
        "max-w-[85%] rounded-2xl px-3.5 py-2.5 text-[13px] leading-relaxed",
        mine && "self-end rounded-ee-md text-white",
        !mine && tone === "light" && "self-start rounded-es-md bg-white text-foreground shadow-[0_1px_3px_rgb(27_27_32/0.1)]",
        !mine && tone === "dark" && "self-start rounded-es-md bg-white/10 text-white ring-1 ring-white/10",
        line.from === "agent" && tone === "dark" && "bg-[#1f3a2c] ring-[#00c057]/30",
      )}
    >
      {line.text}
    </p>
  );
}

/** The chat widget panel as customers see it. */
export function WidgetMock({ demo, className, accent = "var(--primary)" }: { demo: SiteContent["home"]["demo"]; className?: string; accent?: string }) {
  return (
    <div className={cn("flex flex-col overflow-hidden rounded-3xl bg-[#f4f4f6] shadow-[0_32px_64px_-24px_rgb(27_27_32/0.45)] ring-1 ring-black/5", className)}>
      <div className="flex items-center gap-3 px-4 py-3.5 text-white" style={{ backgroundColor: accent }}>
        <span className="relative flex size-9 items-center justify-center rounded-full bg-white/20">
          {/* the brand mark without its tile, as the real widget draws it */}
          <svg viewBox="5 6 22 20" className="h-5 w-[1.4rem]">
            <path d={LOGO_BUBBLE} fill="currentColor" />
            <path d={LOGO_SPARK} fill={accent} />
          </svg>
          <span className="absolute -end-0.5 -bottom-0.5 size-3 rounded-full bg-[#00c057] ring-2" style={{ ["--tw-ring-color" as string]: accent }} />
        </span>
        <span className="flex min-w-0 flex-col">
          <span className="text-sm font-semibold">{demo.assistant}</span>
          <span className="truncate text-[11px] text-white/80">{demo.status}</span>
        </span>
        <ChevronDown className="ms-auto size-4 opacity-80" />
      </div>
      <div className="flex flex-col gap-2.5 p-4">
        {demo.chat.map((line, i) => (
          <span key={i} className="site-pop flex flex-col" style={{ animationDelay: `${0.4 + i * 0.55}s` }}>
            <Bubble line={line} accent={accent} />
          </span>
        ))}
      </div>
      <div className="mt-auto flex items-center gap-2 border-t border-black/5 bg-white p-3">
        <span className="flex h-10 flex-1 items-center rounded-full border border-border px-4 text-[13px] text-muted-foreground">{demo.placeholder}</span>
        <span className="flex size-10 items-center justify-center rounded-full text-white" style={{ backgroundColor: accent }}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className="size-4 rtl:-scale-x-100">
            <path d="M4 12 20 4l-5 16-3.500-6.500L4 12Z" />
          </svg>
        </span>
      </div>
    </div>
  );
}

/** A small floating card used around the hero picture. */
function FloatCard({ className, children }: { className?: string; children: React.ReactNode }) {
  return <div className={cn("site-float absolute z-20 items-center gap-3 rounded-2xl bg-white p-3 pe-4 shadow-[0_20px_44px_-18px_rgb(10_20_60/0.55)] ring-1 ring-black/5", className)}>{children}</div>;
}

const INBOX_PILL = ["bg-[#fff0e8] text-[#c2410c]", "bg-accent text-accent-foreground", "bg-muted text-muted-foreground"];

/** The dashboard inbox on a light surface: sidebar, conversation list and the open chat. */
function DashboardMock({ home }: { home: SiteContent["home"] }) {
  const { handover, demo } = home;
  return (
    <div className="flex h-full overflow-hidden rounded-t-2xl bg-white shadow-[0_40px_80px_-30px_rgb(10_20_60/0.6)] ring-1 ring-black/5">
      {/* sidebar */}
      <div className="flex w-14 shrink-0 flex-col items-center gap-3 bg-[#1b1b20] py-4">
        <LogoMark />
        {/* menu entries, drawn as plain marks: the second (the inbox) is the open one */}
        {[0, 1, 2, 3, 4].map((i) => (
          <span key={i} className={cn("flex size-9 items-center justify-center rounded-xl", i === 1 && "bg-white/15")}>
            <span className={cn("size-4 rounded-[5px]", i === 1 ? "bg-white" : "bg-white/25")} />
          </span>
        ))}
      </div>

      {/* conversation list */}
      <div className="flex w-52 shrink-0 flex-col border-e border-border bg-[#fafafb]">
        <div className="flex items-center justify-between px-4 pt-4 pb-3">
          <span className="text-sm font-bold">{handover.inboxTitle}</span>
          <span className="rounded-full bg-primary px-2 py-0.5 text-[10px] font-semibold text-white">3</span>
        </div>
        <ul className="flex flex-col gap-1 px-2">
          {handover.names.map((name, i) => (
            <li key={name} className={cn("flex items-center gap-2.5 rounded-xl p-2.5", i === 1 && "bg-white shadow-[0_1px_3px_rgb(27_27_32/0.1)] ring-1 ring-border")}>
              <span className={cn("flex size-8 shrink-0 items-center justify-center rounded-full text-[11px] font-semibold", i === 1 ? "bg-primary text-white" : "bg-accent text-accent-foreground")}>{name.slice(0, 1)}</span>
              <span className="flex min-w-0 flex-col gap-1">
                <span dir="auto" className="truncate text-xs font-semibold">
                  {name}
                </span>
                <span className={cn("w-fit rounded-full px-1.5 py-0.5 text-[10px] font-medium", INBOX_PILL[i])}>{handover.filters[i + 1]}</span>
              </span>
            </li>
          ))}
        </ul>
      </div>

      {/* open conversation */}
      <div className="flex min-w-0 flex-1 flex-col bg-[#f6f6f7]">
        <div className="flex items-center justify-between gap-3 border-b border-border bg-white px-4 py-3">
          <span className="flex min-w-0 flex-col">
            <span dir="auto" className="truncate text-sm font-semibold">
              {demo.leadName}
            </span>
            <span dir="ltr" className="text-[11px] text-muted-foreground rtl:text-end">
              {demo.leadPhone}
            </span>
          </span>
          <span className="flex shrink-0 items-center rounded-lg bg-foreground px-2.5 py-1.5 text-[11px] font-semibold text-white">{handover.takeover}</span>
        </div>
        <div className="flex flex-col gap-2 p-4">
          {demo.chat.map((line, i) => (
            <p
              key={i}
              dir="auto"
              className={cn(
                "max-w-[78%] rounded-2xl px-3 py-2 text-xs leading-relaxed",
                line.from === "customer" ? "self-start rounded-es-md bg-white shadow-[0_1px_2px_rgb(27_27_32/0.08)]" : "self-end rounded-ee-md bg-primary text-white",
              )}
            >
              {line.text}
            </p>
          ))}
        </div>
      </div>
    </div>
  );
}

/**
 * Hero picture: a colourful stage holding the team's inbox and, in front of it, the chat
 * widget the customer sees, with the same conversation in both. Phones show the widget only.
 */
export function HeroStage({ home }: { home: SiteContent["home"] }) {
  const { demo } = home;
  return (
    <div aria-hidden className="relative mx-auto w-full max-w-6xl text-start">
      {/* soft shadow of colour under the stage */}
      <div className="absolute inset-x-10 -bottom-6 h-24 rounded-full bg-primary/35 blur-3xl" />

      <div className="site-stage relative overflow-hidden rounded-[1.75rem] sm:rounded-[2.25rem]">
        <DotPattern className="text-white/25" />
        <div className="relative flex items-end justify-center gap-0 px-4 pt-10 sm:px-10 sm:pt-14 lg:h-[31rem] lg:items-stretch lg:justify-start lg:gap-7 lg:px-12">
          {/* inbox (desktop) */}
          <div className="hidden min-w-0 flex-1 lg:block">
            <DashboardMock home={home} />
          </div>
          {/* widget, overlapping the inbox */}
          <WidgetMock demo={demo} className="relative z-10 w-full max-w-[21rem] rounded-b-none lg:w-[20.5rem] lg:shrink-0" />
        </div>
      </div>

      {/* floating notes */}
      <FloatCard className="-start-3 bottom-20 hidden md:flex lg:-start-8">
        <span className="flex size-10 items-center justify-center rounded-xl bg-[#e7f8ee] text-xl leading-none font-bold text-success">+</span>
        <span className="flex flex-col">
          <span className="text-[11px] font-medium text-muted-foreground">{demo.leadTitle}</span>
          <span className="text-sm font-semibold">{demo.leadName}</span>
        </span>
      </FloatCard>
      <FloatCard className="-end-3 -top-6 hidden [animation-delay:1.5s] md:flex lg:-end-6">
        <span className="flex size-10 items-center justify-center rounded-xl bg-accent text-base font-bold text-accent-foreground">ع A</span>
        <span className="flex flex-col">
          <span className="text-sm font-semibold">العربية · English</span>
          <span className="flex items-center gap-1 text-[11px] font-medium text-muted-foreground">
            <span className="size-1.5 rounded-full bg-[#00c057]" />
            24/7
          </span>
        </span>
      </FloatCard>
      <div className="site-float absolute start-1/2 -bottom-4 z-20 hidden -translate-x-1/2 items-center gap-2 rounded-full bg-foreground px-4 py-2.5 text-xs font-medium text-white shadow-[0_16px_32px_-12px_rgb(10_20_60/0.7)] [animation-delay:0.8s] sm:flex rtl:translate-x-1/2">
        <svg viewBox="-10 -10 20 20" className="size-3.5" fill="#fbbf24">
          <path d="M0-10C1.5-3 3-1.5 10 0 3 1.5 1.5 3 0 10-1.5 3-3 1.5-10 0-3-1.5-1.5-3 0-10Z" />
        </svg>
        {demo.answered}
      </div>
    </div>
  );
}

/** Small tick list used inside cards. */
export function TickList({ items, tone = "light" }: { items: string[]; tone?: "light" | "dark" }) {
  return (
    <ul className="flex flex-col gap-3">
      {items.map((item) => (
        <li key={item} className={cn("flex items-start gap-3 text-[15px] leading-relaxed", tone === "dark" ? "text-white/85" : "text-foreground/85")}>
          <span className={cn("mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full", tone === "dark" ? "bg-primary text-white" : "bg-accent text-primary")}>
            <Check className="size-3" strokeWidth={3} />
          </span>
          {item}
        </li>
      ))}
    </ul>
  );
}

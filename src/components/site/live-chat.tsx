"use client";

import { Check, FileText, Globe, NotebookPen, type LucideIcon } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { LogoMark } from "@/components/brand";
import type { SiteContent } from "@/content/site";
import { cn } from "@/lib/utils";
import { Portrait } from "./hero";

/**
 * Conversations that play themselves on the home page: a question arrives, the assistant
 * "types", the answer appears, and the loop starts again a few seconds later.
 *
 * How it is built, so it never misbehaves:
 *  - Every bubble is always in the page and keeps its space; playing only fades bubbles in.
 *    Nothing below moves, and the full conversation is in the HTML for visitors without
 *    JavaScript and for search engines.
 *  - It plays only while it is on screen, and not at all for visitors who asked their device
 *    for less motion: they see the finished conversation.
 */

/**
 * Step through a script. `times` are the moments (ms from the start) at which each step
 * begins; after `loop` ms it starts over. Returns the number of steps reached so far.
 * Before it starts, and without JavaScript, every step counts as reached.
 */
function useTimeline(times: readonly number[], loop: number) {
  const ref = useRef<HTMLDivElement>(null);
  const [step, setStep] = useState(times.length);

  useEffect(() => {
    const element = ref.current;
    if (!element || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let timers: number[] = [];
    const stop = () => {
      timers.forEach((timer) => window.clearTimeout(timer));
      timers = [];
    };
    const play = () => {
      stop();
      timers.push(window.setTimeout(() => setStep(0), 0));
      times.forEach((ms, i) => timers.push(window.setTimeout(() => setStep(i + 1), ms)));
      timers.push(window.setTimeout(play, loop));
    };

    const observer = new IntersectionObserver(([entry]) => (entry.isIntersecting ? play() : stop()), { threshold: 0.35 });
    observer.observe(element);
    return () => {
      observer.disconnect();
      stop();
    };
  }, [times, loop]);

  return { ref, step };
}

/** Fades and lifts its content in when `shown`; keeps its space when not. */
const appear = (shown: boolean) => cn("transition-[opacity,translate,scale] duration-500 ease-out", shown ? "opacity-100" : "translate-y-2 scale-[0.98] opacity-0");

function Dots({ className }: { className?: string }) {
  return (
    <span className={cn("flex gap-1", className)}>
      {[0, 1, 2].map((i) => (
        <span key={i} className="size-1.5 animate-bounce rounded-full bg-current" style={{ animationDelay: `${i * 0.15}s`, animationDuration: "0.9s" }} />
      ))}
    </span>
  );
}

/**
 * A reply that is typed first. The finished bubble keeps its space from the start (so nothing
 * below moves) but stays invisible while `typing`; a small bubble with three dots sits in
 * its corner until the words replace it.
 */
function Reply({
  text,
  typing,
  className,
  side = "end",
  compact = false,
}: {
  text: string;
  typing: boolean;
  className?: string;
  /** Which side of the conversation the reply sits on: the dots appear in that corner. */
  side?: "start" | "end";
  /** Tighter padding, for the small chat window. */
  compact?: boolean;
}) {
  return (
    <div className="relative min-w-0">
      <p dir="auto" className={cn("rounded-2xl text-[13px] transition-opacity duration-300", compact ? "px-3 py-2 leading-snug" : "px-3.5 py-2.5 leading-relaxed sm:text-sm", className, typing && "opacity-0")}>
        {text}
      </p>
      <span className={cn("absolute bottom-0 rounded-2xl px-4 py-3.5 transition-opacity duration-200", side === "end" ? "end-0" : "start-0", className, typing ? "opacity-100" : "opacity-0")}>
        <Dots />
      </span>
    </div>
  );
}

// ---------------------------------------------------------------- answering from the knowledge base

/** When each step of the knowledge conversation starts, in ms. */
const KNOWLEDGE_TIMES = [500, 1300, 2700, 4600, 5400, 6800] as const;

const SOURCES: { icon: LucideIcon; name: string }[] = [
  { icon: FileText, name: "price-list.pdf" },
  { icon: Globe, name: "yoursite.com/faq" },
  { icon: NotebookPen, name: "opening-hours" },
];

/**
 * The assistant answering from what the business gave it. On the left, the sources; on the
 * right, two questions. While an answer is being typed the source it comes from lights up,
 * and is ticked once the answer is given.
 */
export function KnowledgeChat({ demo }: { demo: SiteContent["home"]["demo"] }) {
  const { ref, step } = useTimeline(KNOWLEDGE_TIMES, 11500);
  // Two exchanges: steps 1-3 and 4-6 (question, typing, answer). Each answer uses one source.
  const exchanges = [0, 1].map((i) => ({ question: demo.chat[i * 2], answer: demo.chat[i * 2 + 1], from: i * 3 }));
  const state = (source: number) => {
    const exchange = exchanges[source];
    if (!exchange) return "idle";
    if (step >= exchange.from + 3) return "used";
    return step === exchange.from + 2 ? "reading" : "idle";
  };

  return (
    <div ref={ref} className="min-w-0">
      {/* Phones: the same conversation as the customer sees it, in the chat window on a website. */}
      <WidgetOnSite demo={demo} step={step} exchanges={exchanges} className="sm:hidden" />

      {/* Larger screens: the sources on one side, the conversation on the other. */}
      <div className="grid min-w-0 grid-cols-[12rem_minmax(0,1fr)] gap-4 max-sm:hidden">
      {/* sources */}
      <div className="flex min-w-0 flex-col gap-2.5 rounded-3xl bg-white/70 p-3 ring-1 ring-black/5 sm:self-center sm:p-3.5">
        <p className="flex items-center gap-2 px-1 text-[11px] font-bold tracking-[0.12em] text-muted-foreground uppercase">
          <span className="relative flex size-2">
            <span className="absolute inline-flex size-full animate-ping rounded-full bg-[#00c057] opacity-60 motion-reduce:hidden" />
            <span className="relative inline-flex size-2 rounded-full bg-[#00c057]" />
          </span>
          {demo.knowledge}
        </p>
        <ul dir="ltr" className="flex flex-wrap gap-2 sm:flex-col sm:flex-nowrap">
          {SOURCES.map(({ icon: Icon, name }, i) => {
            const now = state(i);
            return (
              <li
                key={name}
                className={cn(
                  "flex min-w-0 items-center gap-2 rounded-2xl bg-white px-2.5 py-2 text-xs font-medium transition-shadow duration-300",
                  now === "reading" ? "shadow-[0_8px_20px_-8px_rgb(220_38_38/0.55)] ring-2 ring-primary" : "ring-1 ring-black/5",
                )}
              >
                <span className={cn("flex size-6 shrink-0 items-center justify-center rounded-lg transition-colors duration-300", now === "idle" ? "bg-muted text-muted-foreground" : "bg-primary text-white")}>
                  {now === "used" ? <Check className="size-3.5" strokeWidth={3} /> : <Icon className="size-3.5" />}
                </span>
                <span className="truncate">{name}</span>
              </li>
            );
          })}
        </ul>
      </div>

      {/* conversation */}
      <div className="flex min-w-0 flex-col justify-center gap-2.5">
        {exchanges.map(({ question, answer, from }, i) => (
          <div key={i} className="flex flex-col gap-2.5">
            <div className={cn("flex max-w-[92%] items-end gap-2 self-start", appear(step >= from + 1))}>
              <Portrait look={i === 0 ? "scarf" : "short"} className="size-7" />
              <p dir="auto" className="min-w-0 rounded-2xl rounded-es-md bg-white px-3.5 py-2.5 text-[13px] leading-relaxed shadow-[0_1px_3px_rgb(27_27_32/0.1)] sm:text-sm">
                {question.text}
              </p>
            </div>
            <div className={cn("flex max-w-[92%] items-end gap-2 self-end", appear(step >= from + 2))}>
              <Reply text={answer.text} typing={step === from + 2} className="rounded-ee-md bg-primary text-white" />
              <LogoMark className="size-7 shrink-0" />
            </div>
          </div>
        ))}
        <p className={cn("w-fit self-end rounded-full bg-[#fff6dc] px-3 py-1 text-[11px] font-semibold text-[#8a5a00]", appear(step >= 6))}>{demo.answered}</p>
      </div>
      </div>
    </div>
  );
}

type Exchange = { question: { text: string }; answer: { text: string }; from: number };

/**
 * A browser window showing a business's website with the chat open on top of it: the
 * visitor's messages in the brand colour, the assistant's replies typed in, and the round
 * chat button in the corner. Plays the same script as the sources view.
 */
function WidgetOnSite({ demo, step, exchanges, className }: { demo: SiteContent["home"]["demo"]; step: number; exchanges: Exchange[]; className?: string }) {
  return (
    <div dir="ltr" className={cn("relative overflow-hidden rounded-3xl bg-white shadow-[0_24px_48px_-28px_rgb(80_24_16/0.6)] ring-1 ring-black/5", className)}>
      {/* browser bar */}
      <div className="flex items-center gap-1.5 border-b border-border/70 px-3.5 py-2.5">
        <span className="size-2.5 rounded-full bg-[#ff5f57]" />
        <span className="size-2.5 rounded-full bg-[#febc2e]" />
        <span className="size-2.5 rounded-full bg-[#28c840]" />
        <span className="ms-2 flex h-7 min-w-0 flex-1 items-center rounded-lg bg-muted px-3 text-[11px] text-muted-foreground">
          <span className="truncate">{demo.site}</span>
        </span>
      </div>

      <div className="relative bg-muted/50">
        {/* the website behind the chat: a name, a few lines, a card */}
        <div className="absolute inset-0 flex flex-col gap-3 p-4">
          <span className="text-sm font-bold tracking-tight">{demo.site.split(".")[0]}</span>
          <span className="mt-3 h-2 w-16 rounded-full bg-foreground/15" />
          <span className="h-24 w-28 rounded-2xl bg-white ring-1 ring-black/5" />
          <span className="h-16 w-28 rounded-2xl bg-white ring-1 ring-black/5" />
          <span className="h-9 w-28 rounded-xl bg-foreground/85" />
        </div>

        {/* the chat window, overlapping the page */}
        <div className="relative ms-9 me-2.5 mt-3 mb-9 flex flex-col overflow-hidden rounded-2xl bg-white shadow-[0_18px_40px_-16px_rgb(27_27_32/0.45)] ring-1 ring-black/5">
          <div className="flex items-center gap-2.5 bg-primary px-3.5 py-3 text-white">
            <span className="relative flex size-8 shrink-0 items-center justify-center rounded-full bg-white">
              <LogoMark className="size-5" />
              <span className="absolute -end-0.5 -bottom-0.5 size-2.5 rounded-full bg-[#00c057] ring-2 ring-primary" />
            </span>
            <span dir="auto" className="flex min-w-0 flex-col leading-tight">
              <span className="truncate text-[13px] font-semibold">{demo.assistant}</span>
              <span className="truncate text-[11px] text-white/80">{demo.status}</span>
            </span>
          </div>

          <div className="flex flex-col gap-2 bg-[#f6f6f7] p-3">
            {exchanges.map(({ question, answer, from }, i) => (
              <div key={i} className="flex flex-col gap-2">
                <p dir="auto" className={cn("max-w-[86%] self-end rounded-2xl rounded-ee-md bg-primary px-3 py-2 text-[13px] leading-snug text-white", appear(step >= from + 1))}>
                  {question.text}
                </p>
                <div className={cn("flex max-w-[86%] self-start", appear(step >= from + 2))}>
                  <Reply text={answer.text} typing={step === from + 2} side="start" className="rounded-es-md bg-white text-foreground shadow-[0_1px_2px_rgb(27_27_32/0.1)]" compact />
                </div>
              </div>
            ))}
          </div>

          <div className="border-t border-border/70 p-2.5 pe-14">
            <span dir="auto" className="flex h-9 items-center rounded-full bg-muted px-3.5 text-xs text-muted-foreground">
              {demo.placeholder}
            </span>
          </div>
        </div>

        {/* the round chat button, with one unread reply while an answer is waiting */}
        <span className="absolute end-2 bottom-2.5 flex size-12 items-center justify-center rounded-full bg-primary shadow-[0_10px_24px_-8px_rgb(220_38_38/0.7)] ring-4 ring-white">
          <LogoMark className="size-7" />
          <span className={cn("absolute -end-1 -top-1 flex size-5 items-center justify-center rounded-full bg-foreground text-[10px] font-bold text-white ring-2 ring-white transition-[opacity,scale] duration-300", step >= 3 ? "opacity-100" : "scale-50 opacity-0")}>
            {step >= 6 ? 2 : 1}
          </span>
        </span>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------- handing over to a person

const HANDOVER_TIMES = [500, 1400, 2900, 4300, 5200, 6800] as const;

/**
 * A conversation that changes hands, as the team sees it in their inbox: the customer asks
 * for a person, the assistant passes it on (the status changes), and a team member answers.
 */
export function HandoverLive({ t }: { t: SiteContent["home"]["handover"] }) {
  const { ref, step } = useTimeline(HANDOVER_TIMES, 12000);
  const [customer, assistant, note, agent] = t.chat;
  const needsHuman = step >= 3;

  return (
    <div ref={ref} aria-hidden className="flex flex-col rounded-[1.75rem] bg-accent p-3 sm:p-5">
      <div className="flex flex-1 flex-col overflow-hidden rounded-3xl bg-white shadow-[0_24px_48px_-28px_rgb(220_38_38/0.55)] ring-1 ring-black/5">
        <div className="flex items-center justify-between gap-3 border-b border-border/70 px-4 py-3 sm:px-5">
          <span className="flex min-w-0 items-center gap-2.5">
            <Portrait look="short" className="size-9" />
            <span dir="auto" className="truncate text-sm font-semibold">
              {t.names[0]}
            </span>
          </span>
          {/* the status flips from "AI handled" to "Needs human" when the assistant passes the chat on */}
          <span
            className={cn(
              "flex shrink-0 items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold transition-colors duration-500",
              needsHuman ? "bg-[#fff1d6] text-[#9a5b00]" : "bg-[#e7f8ee] text-success",
            )}
          >
            <span className={cn("size-1.5 rounded-full bg-current", needsHuman && "animate-pulse")} />
            {needsHuman ? t.filters[1] : t.filters[2]}
          </span>
        </div>

        <div className="flex flex-1 flex-col justify-center gap-3 bg-muted/60 p-4 sm:p-5">
          <p dir="auto" className={cn("max-w-[85%] self-start rounded-2xl rounded-es-md bg-white px-3.5 py-2.5 text-[13px] leading-relaxed shadow-[0_1px_3px_rgb(27_27_32/0.1)] sm:text-sm", appear(step >= 1))}>
            {customer.text}
          </p>

          <div className={cn("flex max-w-[88%] items-end gap-2 self-end", appear(step >= 2))}>
            <Reply text={assistant.text} typing={step === 2} className="rounded-ee-md bg-primary text-white" />
            <LogoMark className="size-7" />
          </div>

          <p className={cn("flex items-center gap-3 py-1 text-[11px] font-semibold text-[#9a5b00]", appear(step >= 4))}>
            <span className="h-px flex-1 bg-[#f5c56b]" />
            <span dir="auto" className="rounded-full bg-[#fff1d6] px-3 py-1">
              {note.text}
            </span>
            <span className="h-px flex-1 bg-[#f5c56b]" />
          </p>

          <div className={cn("flex max-w-[88%] items-end gap-2 self-end", appear(step >= 5))}>
            <Reply text={agent.text} typing={step === 5} className="rounded-ee-md bg-foreground text-white" />
            <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-[#fbbf24]">
              <svg viewBox="0 0 16 16" className="size-4" fill="#1b1b20">
                <circle cx="8" cy="5.5" r="3" />
                <path d="M2.500 14a5.500 5.500 0 0 1 11 0Z" />
              </svg>
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3 border-t border-border/70 px-4 py-3 sm:px-5">
          <span className="h-9 flex-1 rounded-full border border-border bg-muted/60" />
          <span className={cn("flex h-9 items-center rounded-full px-4 text-xs font-semibold text-white transition-[background-color,scale] duration-500", step === 3 || step === 4 ? "scale-105 bg-primary" : "bg-foreground")}>
            {t.takeover}
          </span>
        </div>
      </div>
    </div>
  );
}

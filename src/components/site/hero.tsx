import { LogoMark } from "@/components/brand";
import type { SiteContent } from "@/content/site";
import { cn } from "@/lib/utils";
import { PLATFORM_LOGOS } from "./platform-logos";

/**
 * The picture at the top of the home page: a photo of a customer with her phone, standing
 * inside a set of arches, with the conversation she is having floating around her.
 * The photo is public/images/hero-person.png; the two web-sized copies next to it are what
 * the page loads (regenerate them if the photo is replaced).
 */

const SPARKLE = "M0-10C1.5-3 3-1.5 10 0 3 1.5 1.5 3 0 10-1.5 3-3 1.5-10 0-3-1.5-1.5-3 0-10Z";

/** A hand-drawn stroke under the highlighted words of the headline. */
export function HeadlineStroke() {
  return (
    <svg aria-hidden viewBox="0 0 300 14" preserveAspectRatio="none" fill="none" className="absolute inset-x-0 -bottom-1.5 h-2.5 w-full sm:-bottom-2 sm:h-3.5">
      <path d="M3 9.500C52 3.500 118 2 172 4.500c44 2 86 3.500 125 1.500" stroke="#fbbf24" strokeWidth="5" strokeLinecap="round" />
    </svg>
  );
}

/** A small drawn portrait for the cards around the hero. Two looks, so the people differ. */
export function Portrait({ look, className }: { look: "scarf" | "short"; className?: string }) {
  return (
    <svg aria-hidden viewBox="0 0 40 40" className={cn("size-10 shrink-0 rounded-full", className)}>
      <rect width="40" height="40" fill={look === "scarf" ? "#fee2e2" : "#fde68a"} />
      {look === "scarf" ? (
        <>
          <path d="M8 40V21a12 12 0 0 1 24 0v19Z" fill="#dc2626" />
          <ellipse cx="20" cy="20.500" rx="7" ry="8" fill="#f0c9a4" />
          <path d="M13.500 17.500c3.500-.500 7-2.500 9-5.500 1.500 3 3 4.500 4.500 5.500" stroke="#b91c1c" strokeWidth="2.500" strokeLinecap="round" fill="none" />
        </>
      ) : (
        <>
          <path d="M5 40a15 12 0 0 1 30 0Z" fill="#1b1b20" />
          <rect x="17" y="24" width="6" height="6" fill="#d9a877" />
          <circle cx="20" cy="18" r="8" fill="#e3b58a" />
          <path d="M11.500 17a8.500 8.500 0 0 1 17 0c-3-.500-5.500-2-7-4.500-2 3-5.500 4.500-10 4.500Z" fill="#1b1b20" />
        </>
      )}
      <path d="M17 23.500c1 .900 2 1.300 3 1.300s2-.400 3-1.300" stroke="#7a4a2b" strokeWidth="1.200" strokeLinecap="round" fill="none" />
    </svg>
  );
}

/**
 * Something floating beside the person: a chat bubble or a small card. Each one arrives
 * like a message, `at` seconds after the page opens, so the conversation plays out in order.
 */
function Float({ className, tone = "card", at, children }: { className?: string; tone?: "card" | "customer"; at: number; children: React.ReactNode }) {
  return (
    <div
      style={{ "--at": `${at}s` } as React.CSSProperties}
      className={cn(
        "site-message absolute z-20 text-start shadow-[0_24px_48px_-20px_rgb(80_24_16/0.5)]",
        tone === "customer" ? "rounded-2xl rounded-ee-md bg-primary px-4 py-2.5 text-[13px] leading-relaxed font-medium text-white" : "rounded-2xl bg-white ring-1 ring-black/5",
        className,
      )}
    >
      {children}
    </div>
  );
}

/**
 * One turn of the looping conversation shown on phones and tablets: it comes in `at` seconds
 * into the loop, stays a few seconds and leaves, and the whole loop repeats.
 */
function Turn({ className, at, children }: { className?: string; at: number; children: React.ReactNode }) {
  return (
    <div style={{ "--at": `${at}s` } as React.CSSProperties} className={cn("site-turn absolute z-20 text-start shadow-[0_18px_40px_-18px_rgb(80_24_16/0.55)] lg:hidden", className)}>
      {children}
    </div>
  );
}

/** The assistant's reply: typing dots for a moment, then the words. The bubble is full size from the start, so nothing jumps. */
function Typed({ text }: { text: string }) {
  return (
    <span className="relative">
      <span className="site-typing absolute start-0 top-1.5 flex gap-1">
        {[0, 1, 2].map((i) => (
          <span key={i} className="size-2 animate-pulse rounded-full bg-muted-foreground/60" style={{ animationDelay: `${i * 0.15}s` }} />
        ))}
      </span>
      <span dir="auto" className="site-typed block">
        {text}
      </span>
    </span>
  );
}

/**
 * Website builders the chat widget can be added to: their logos only, on one line, scrolling
 * sideways in a loop (their names are there for screen readers). The list is repeated so the
 * loop has no seam on any screen width, and it pauses while the pointer is over it.
 */
const PLATFORMS = PLATFORM_LOGOS;

export function PlatformMarquee({ label }: { label: string }) {
  return (
    <div className="relative bg-sidebar py-4 text-white sm:py-5">
      <div className="mx-auto flex max-w-6xl flex-col items-center gap-3 px-4 sm:flex-row sm:gap-10 sm:px-6">
        <p className="shrink-0 text-sm font-medium text-white/60">{label}</p>
        <div dir="ltr" className="site-marquee-mask w-full min-w-0 flex-1 overflow-hidden">
          <ul className="site-marquee flex w-max items-center">
            {[...PLATFORMS, ...PLATFORMS, ...PLATFORMS, ...PLATFORMS].map(({ name, path }, i) => (
              <li key={i} aria-hidden={i >= PLATFORMS.length} className="shrink-0 pe-12 text-white/90 sm:pe-16">
                <svg aria-hidden viewBox="0 0 24 24" className="size-9 sm:size-10" fill="currentColor">
                  <path d={path} />
                </svg>
                <span className="sr-only">{name}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

export function HeroStage({ home }: { home: SiteContent["home"] }) {
  const { demo, handover } = home;
  const joined = handover.chat.find((line) => line.from === "note")?.text;
  const [ask, answer, askAgain, answerAgain] = demo.chat;
  const reply = "flex max-w-[17rem] items-start gap-2.5 p-3 text-[13px] leading-relaxed";
  // Phone versions: a question bubble in a top corner, and a card across the bottom of the picture.
  const question = "max-w-[11.5rem] rounded-2xl rounded-ee-md bg-primary px-3 py-2 text-xs leading-relaxed font-medium text-white";
  const answerCard = "inset-x-2 bottom-3 flex items-start gap-2.5 rounded-2xl bg-white p-2.5 pe-3 text-xs leading-relaxed ring-1 ring-black/5 sm:inset-x-auto sm:start-1/2 sm:w-[22rem] sm:-translate-x-1/2 sm:text-[13px] rtl:sm:translate-x-1/2";

  return (
    <div aria-hidden className="relative mt-6 h-[25rem] w-full max-w-5xl overflow-hidden sm:mt-12 sm:h-[33rem]">
      {/* arches */}
      <svg viewBox="0 0 1000 480" preserveAspectRatio="xMidYMax slice" fill="none" className="absolute inset-0 size-full">
        <defs>
          <linearGradient id="hero-arch" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#fbbf24" />
            <stop offset="1" stopColor="#fbbf24" stopOpacity="0.2" />
          </linearGradient>
          <radialGradient id="hero-glow" cx="0.5" cy="0.62" r="0.5">
            <stop offset="0" stopColor="#fde68a" stopOpacity="0.9" />
            <stop offset="1" stopColor="#fde68a" stopOpacity="0" />
          </radialGradient>
        </defs>
        <ellipse cx="500" cy="330" rx="480" ry="300" fill="url(#hero-glow)" />
        {[
          [330, 0.28],
          [275, 0.45],
          [220, 0.65],
          [165, 0.95],
        ].map(([r, opacity]) => (
          // Each arch starts a little lower than the one outside it, so they nest.
          <path key={r} d={`M${500 - r} 480V${r + 30 + (330 - r) * 0.3}a${r} ${r} 0 0 1 ${2 * r} 0V480`} stroke="url(#hero-arch)" strokeOpacity={opacity} strokeWidth="26" />
        ))}
        <path d={SPARKLE} transform="translate(96 70) scale(1.5)" fill="#fbbf24" />
        <path d={SPARKLE} transform="translate(905 40) scale(1)" fill="#dc2626" fillOpacity="0.55" />
        <path d={SPARKLE} transform="translate(60 330) scale(0.7)" fill="#dc2626" fillOpacity="0.4" />
        <path d={SPARKLE} transform="translate(950 300) scale(0.8)" fill="#fbbf24" />
      </svg>

      {/* The photo keeps its proportions and always fits: as tall as the stage allows, never wider than the screen. */}
      {/* eslint-disable-next-line @next/next/no-img-element -- a fixed, pre-sized hero picture; srcSet picks the right file */}
      <img
        src="/images/hero-person-900.webp"
        srcSet="/images/hero-person-480.webp 480w, /images/hero-person-900.webp 900w"
        sizes="(min-width: 640px) 400px, 300px"
        width={900}
        height={1143}
        alt=""
        fetchPriority="high"
        decoding="async"
        className="absolute inset-x-0 bottom-0 mx-auto h-[97%] w-auto max-w-full object-contain object-bottom"
      />

      {/* Phones and tablets: there is no room beside her, so the same conversation plays as a
          loop instead. Questions appear at the top corners, and the reply to each (then the lead
          and the team member) in one card across the bottom, each giving way to the next. */}
      <Turn at={0.4} className={cn(question, "start-0 top-3")}>
        <span dir="auto">{ask.text}</span>
      </Turn>
      <Turn at={1.2} className={answerCard}>
        <LogoMark className="size-7" />
        <span className="flex min-w-0 flex-col gap-1.5">
          <span dir="auto">{answer.text}</span>
          <span className="w-fit rounded-full bg-[#fff6dc] px-2 py-0.5 text-[11px] font-semibold text-[#8a5a00]">{demo.answered}</span>
        </span>
      </Turn>
      <Turn at={5.4} className={cn(question, "end-0 top-3")}>
        <span dir="auto">{askAgain.text}</span>
      </Turn>
      <Turn at={6.2} className={answerCard}>
        <LogoMark className="size-7" />
        <span dir="auto">{answerAgain.text}</span>
      </Turn>
      <Turn at={10.6} className={cn(answerCard, "items-center")}>
        <Portrait look="scarf" />
        <span className="flex min-w-0 flex-col">
          <span className="text-[11px] font-medium text-muted-foreground">{demo.leadTitle}</span>
          <span dir="auto" className="truncate text-sm font-semibold">
            {demo.leadName}
          </span>
          <span dir="ltr" className="text-[11px] text-muted-foreground rtl:text-end">
            {demo.leadPhone}
          </span>
        </span>
      </Turn>
      {joined && (
        <Turn at={15.2} className={cn(answerCard, "items-center")}>
          <span className="relative">
            <Portrait look="short" />
            <span className="absolute -end-0.5 -bottom-0.5 size-3 rounded-full bg-[#00c057] ring-2 ring-white" />
          </span>
          <span className="flex min-w-0 flex-col">
            <span dir="auto" className="text-sm font-semibold">
              {joined}
            </span>
            <span className="text-[11px] font-medium text-muted-foreground">{handover.takeover}</span>
          </span>
        </Turn>
      )}

      {/* wide screens: the conversation on both sides, a lead below on one side and a team member on the other */}
      <Float at={0.5} tone="customer" className="start-[7%] top-[7%] hidden max-w-60 lg:block">
        <span dir="auto">{ask.text}</span>
      </Float>
      <Float at={1.5} className={cn(reply, "start-[1%] top-[27%] hidden lg:flex")}>
        <LogoMark className="size-7" />
        <Typed text={answer.text} />
      </Float>
      <Float at={3.4} className="start-[8%] bottom-[9%] hidden items-center gap-3 p-3 pe-4 lg:flex">
        <Portrait look="scarf" />
        <span className="flex flex-col">
          <span className="text-[11px] font-medium text-muted-foreground">{demo.leadTitle}</span>
          <span dir="auto" className="text-sm font-semibold">
            {demo.leadName}
          </span>
          <span dir="ltr" className="text-[11px] text-muted-foreground rtl:text-end">
            {demo.leadPhone}
          </span>
        </span>
      </Float>

      <Float at={4.2} tone="customer" className="end-[9%] top-[11%] hidden max-w-60 lg:block">
        <span dir="auto">{askAgain.text}</span>
      </Float>
      <Float at={5.2} className={cn(reply, "end-[1%] top-[30%] hidden lg:flex")}>
        <LogoMark className="size-7" />
        <Typed text={answerAgain.text} />
      </Float>
      {joined && (
        <Float at={7.1} className="end-[7%] bottom-[11%] hidden items-center gap-3 p-3 pe-4 lg:flex">
          <span className="relative">
            <Portrait look="short" />
            <span className="absolute -end-0.5 -bottom-0.5 size-3 rounded-full bg-[#00c057] ring-2 ring-white" />
          </span>
          <span className="flex flex-col">
            <span dir="auto" className="text-sm font-semibold">
              {joined}
            </span>
            <span className="text-[11px] font-medium text-muted-foreground">{handover.takeover}</span>
          </span>
        </Float>
      )}
    </div>
  );
}

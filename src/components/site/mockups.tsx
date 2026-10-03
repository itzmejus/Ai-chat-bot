import { Check } from "lucide-react";
import type { ChatLine, SiteContent } from "@/content/site";
import { LOGO_BUBBLE, LOGO_SPARK } from "@/lib/logo";
import { cn } from "@/lib/utils";

/**
 * Product pictures for the public site, drawn with HTML, CSS and inline SVG instead of
 * image files: they stay sharp at every size, weigh almost nothing, follow the page's
 * language and direction, and are hidden from screen readers (the surrounding
 * text already says what they show).
 */

const SPARKLE = "M0-10C1.5-3 3-1.5 10 0 3 1.5 1.5 3 0 10-1.5 3-3 1.5-10 0-3-1.5-1.5-3 0-10Z";

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

/** A hand-drawn stroke under the highlighted words of the headline. */
export function HeadlineStroke() {
  return (
    <svg aria-hidden viewBox="0 0 300 14" preserveAspectRatio="none" fill="none" className="absolute inset-x-0 -bottom-1.5 h-2.5 w-full sm:-bottom-2 sm:h-3.5">
      <path d="M3 9.500C52 3.500 118 2 172 4.500c44 2 86 3.500 125 1.500" stroke="#fbbf24" strokeWidth="5" strokeLinecap="round" />
    </svg>
  );
}

/** A small drawn portrait for the cards around the hero. Two looks, so the people differ. */
function Portrait({ look, className }: { look: "scarf" | "short"; className?: string }) {
  return (
    <svg aria-hidden viewBox="0 0 40 40" className={cn("size-10 shrink-0 rounded-full", className)}>
      <rect width="40" height="40" fill={look === "scarf" ? "#dbeafe" : "#fde68a"} />
      {look === "scarf" ? (
        <>
          {/* headscarf, face, shoulders */}
          <path d="M8 40V21a12 12 0 0 1 24 0v19Z" fill="#2563eb" />
          <ellipse cx="20" cy="20.500" rx="7" ry="8" fill="#f0c9a4" />
          <path d="M13.500 17.500c3.500-.500 7-2.500 9-5.500 1.500 3 3 4.500 4.500 5.500" stroke="#1d4ed8" strokeWidth="2.500" strokeLinecap="round" fill="none" />
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

/** A floating card beside the phone. */
function FloatCard({ className, children }: { className?: string; children: React.ReactNode }) {
  return (
    <div className={cn("site-float absolute z-20 flex items-center gap-3 rounded-2xl bg-white p-3 pe-4 text-start shadow-[0_24px_48px_-20px_rgb(15_30_80/0.45)] ring-1 ring-black/5", className)}>
      {children}
    </div>
  );
}

/**
 * Hero picture: a phone showing the chat, standing inside a set of arches, with the
 * things the product does floating around it (a lead, the languages, an answer from the
 * business's own price list, a team member stepping in). The phone's lower part is cut
 * off by the dark strip that follows the hero.
 */
export function HeroStage({ home }: { home: SiteContent["home"] }) {
  const { demo, handover } = home;
  const joined = handover.chat.find((line) => line.from === "note")?.text;
  return (
    <div aria-hidden className="relative mt-12 h-[26.5rem] w-full max-w-5xl overflow-hidden sm:mt-14 sm:h-[31rem]">
      {/* arches */}
      <svg viewBox="0 0 1000 480" preserveAspectRatio="xMidYMax slice" fill="none" className="absolute inset-0 size-full">
        <defs>
          <linearGradient id="hero-arch" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#2563eb" />
            <stop offset="1" stopColor="#2563eb" stopOpacity="0.15" />
          </linearGradient>
          <radialGradient id="hero-glow" cx="0.5" cy="0.62" r="0.5">
            <stop offset="0" stopColor="#bfdbfe" stopOpacity="0.9" />
            <stop offset="1" stopColor="#bfdbfe" stopOpacity="0" />
          </radialGradient>
        </defs>
        <ellipse cx="500" cy="330" rx="480" ry="300" fill="url(#hero-glow)" />
        {[
          [330, 0.16],
          [275, 0.3],
          [220, 0.5],
          [165, 0.85],
        ].map(([r, opacity]) => (
          // Each arch starts a little lower than the one outside it, so they nest.
          <path key={r} d={`M${500 - r} 480V${r + 30 + (330 - r) * 0.3}a${r} ${r} 0 0 1 ${2 * r} 0V480`} stroke="url(#hero-arch)" strokeOpacity={opacity} strokeWidth="26" />
        ))}
        <path d={SPARKLE} transform="translate(96 70) scale(1.5)" fill="#fbbf24" />
        <path d={SPARKLE} transform="translate(905 40) scale(1)" fill="#2563eb" fillOpacity="0.55" />
        <path d={SPARKLE} transform="translate(60 330) scale(0.7)" fill="#2563eb" fillOpacity="0.4" />
        <path d={SPARKLE} transform="translate(950 300) scale(0.8)" fill="#fbbf24" />
      </svg>

      {/* phone */}
      <div className="absolute inset-x-0 top-6 mx-auto w-[17rem] rounded-[2.6rem] bg-[#1b1b20] p-2.5 shadow-[0_40px_80px_-24px_rgb(15_30_80/0.6)] ring-1 ring-black/10 sm:top-8 sm:w-[18.5rem]">
        <div className="flex h-[34rem] flex-col overflow-hidden rounded-[2.05rem] bg-[#f4f4f6] text-start">
          <div className="relative flex items-center gap-3 bg-primary px-4 pt-9 pb-3.5 text-white">
            <span className="absolute inset-x-0 top-2.5 mx-auto h-5 w-20 rounded-full bg-[#1b1b20]" />
            <span className="relative flex size-9 shrink-0 items-center justify-center rounded-full bg-white/20">
              <svg viewBox="5 6 22 20" className="h-5 w-[1.4rem]">
                <path d={LOGO_BUBBLE} fill="currentColor" />
                <path d={LOGO_SPARK} fill="var(--primary)" />
              </svg>
              <span className="absolute -end-0.5 -bottom-0.5 size-3 rounded-full bg-[#00c057] ring-2 ring-primary" />
            </span>
            <span className="flex min-w-0 flex-col">
              <span className="text-sm font-semibold">{demo.assistant}</span>
              <span className="truncate text-[11px] text-white/80">{demo.status}</span>
            </span>
          </div>
          <div className="flex flex-col gap-2.5 p-3.5">
            {demo.chat.map((line, i) => (
              <span key={i} className="site-pop flex flex-col" style={{ animationDelay: `${0.4 + i * 0.55}s` }}>
                <Bubble line={line} />
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* around the phone */}
      <FloatCard className="start-0 top-16 hidden md:flex lg:start-10">
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
      </FloatCard>

      <FloatCard className="start-4 bottom-24 hidden [animation-delay:1.2s] md:flex lg:start-24">
        <svg viewBox="-10 -10 20 20" className="size-9 shrink-0 rounded-xl bg-[#fff6dc] p-2" fill="#f59e0b">
          <path d={SPARKLE} />
        </svg>
        <span className="max-w-40 text-sm leading-snug font-semibold">{demo.answered}</span>
      </FloatCard>

      <FloatCard className="end-0 top-24 hidden [animation-delay:0.6s] md:flex lg:end-12">
        <span className="flex -space-x-1.5 text-[13px] font-bold rtl:space-x-reverse">
          {["A", "ع", "अ"].map((letter, i) => (
            <span key={letter} className={cn("flex size-9 items-center justify-center rounded-full ring-2 ring-white", ["bg-primary text-white", "bg-[#1b1b20] text-white", "bg-[#fbbf24] text-[#1b1b20]"][i])}>
              {letter}
            </span>
          ))}
        </span>
        <span className="flex flex-col">
          <span className="text-sm font-semibold">{home.strip[2]}</span>
          <span className="flex items-center gap-1.5 text-[11px] font-medium text-muted-foreground">
            <span className="size-1.5 rounded-full bg-[#00c057]" />
            24/7
          </span>
        </span>
      </FloatCard>

      {joined && (
        <FloatCard className="end-2 bottom-28 hidden [animation-delay:1.8s] md:flex lg:end-20">
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
        </FloatCard>
      )}
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

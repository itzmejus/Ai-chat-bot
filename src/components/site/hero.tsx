import { LogoMark } from "@/components/brand";
import type { SiteContent } from "@/content/site";
import { cn } from "@/lib/utils";

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
      <rect width="40" height="40" fill={look === "scarf" ? "#dbeafe" : "#fde68a"} />
      {look === "scarf" ? (
        <>
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

/** Something floating beside the person: a chat bubble or a small card. */
function Float({ className, tone = "card", children }: { className?: string; tone?: "card" | "customer"; children: React.ReactNode }) {
  return (
    <div
      className={cn(
        "site-float absolute z-20 text-start shadow-[0_24px_48px_-20px_rgb(15_30_80/0.5)]",
        tone === "customer" ? "rounded-2xl rounded-ee-md bg-primary px-4 py-2.5 text-[13px] leading-relaxed font-medium text-white" : "rounded-2xl bg-white ring-1 ring-black/5",
        className,
      )}
    >
      {children}
    </div>
  );
}

export function HeroStage({ home }: { home: SiteContent["home"] }) {
  const { demo, handover } = home;
  const joined = handover.chat.find((line) => line.from === "note")?.text;
  const [ask, answer, askAgain, answerAgain] = demo.chat;
  const reply = "flex max-w-[17rem] items-start gap-2.5 p-3 text-[13px] leading-relaxed";

  return (
    <div aria-hidden className="relative mt-6 h-[25rem] w-full max-w-5xl overflow-hidden sm:mt-12 sm:h-[33rem]">
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

      {/* phones and tablets: two short pieces, tucked at the edges */}
      <Float tone="customer" className="start-0 top-3 max-w-[10.5rem] px-3 py-2 text-xs lg:hidden">
        <span dir="auto">{ask.text}</span>
      </Float>
      <Float className="end-0 bottom-6 flex max-w-[10.5rem] items-center gap-2 p-2 pe-3 text-xs leading-snug font-semibold [animation-delay:1.2s] lg:hidden">
        <svg viewBox="-10 -10 20 20" className="size-7 shrink-0 rounded-lg bg-[#fff6dc] p-1.5" fill="#f59e0b">
          <path d={SPARKLE} />
        </svg>
        {demo.answered}
      </Float>

      {/* wide screens: the conversation on both sides, a lead below on one side and a team member on the other */}
      <Float tone="customer" className="start-[7%] top-[7%] hidden max-w-60 lg:block">
        <span dir="auto">{ask.text}</span>
      </Float>
      <Float className={cn(reply, "start-[1%] top-[27%] hidden [animation-delay:0.6s] lg:flex")}>
        <LogoMark className="size-7" />
        <span dir="auto">{answer.text}</span>
      </Float>
      <Float className="start-[8%] bottom-[9%] hidden items-center gap-3 p-3 pe-4 [animation-delay:1.4s] lg:flex">
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

      <Float tone="customer" className="end-[9%] top-[11%] hidden max-w-60 [animation-delay:0.9s] lg:block">
        <span dir="auto">{askAgain.text}</span>
      </Float>
      <Float className={cn(reply, "end-[1%] top-[30%] hidden [animation-delay:0.3s] lg:flex")}>
        <LogoMark className="size-7" />
        <span dir="auto">{answerAgain.text}</span>
      </Float>
      {joined && (
        <Float className="end-[7%] bottom-[11%] hidden items-center gap-3 p-3 pe-4 [animation-delay:1.8s] lg:flex">
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

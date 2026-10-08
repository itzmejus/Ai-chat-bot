import type { FeatureKey, SiteContent } from "@/content/site";
import { cn } from "@/lib/utils";
import { FEATURE_ART, STEP_ART } from "./art";
import { Portrait } from "./hero";
import { KnowledgeChat } from "./live-chat";

/**
 * Home page sections below the hero: large feature rows that alternate sides, a row of
 * solid colour tiles for the headline numbers, and the setup steps on a timeline.
 * Every layout is written phone-first: one column, then two from tablets up.
 */

type Home = SiteContent["home"];

// ---------------------------------------------------------------- feature rows

/** The same answer in three languages. */
function LanguagesPanel() {
  const lines: [string, "ltr" | "rtl"][] = [
    ["We are open until 9 pm today.", "ltr"],
    ["نعم، نفتح اليوم حتى الساعة 9 مساءً.", "rtl"],
    ["जी हाँ, हम आज रात 9 बजे तक खुले हैं।", "ltr"],
    ["Oui, nous sommes ouverts jusqu'à 21 h.", "ltr"],
  ];
  return (
    <div dir="ltr" className="flex flex-col gap-3">
      {lines.map(([text, dir], i) => (
        <p
          key={text}
          dir={dir}
          className={cn(
            "w-fit max-w-[90%] rounded-2xl px-4 py-2.5 text-sm font-medium sm:text-[15px]",
            i % 2 === 0 ? "rounded-es-md bg-white text-foreground" : "self-end rounded-ee-md bg-primary text-white",
          )}
        >
          {text}
        </p>
      ))}
    </div>
  );
}

/** A captured lead, as it appears in the leads list. */
function LeadsPanel({ home }: { home: Home }) {
  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-3.5 rounded-3xl bg-white p-4 shadow-[0_18px_40px_-20px_rgb(60_40_0/0.55)] sm:p-5">
        <Portrait look="scarf" className="size-12" />
        <span className="flex min-w-0 flex-1 flex-col">
          <span dir="auto" className="truncate text-base font-bold">
            {home.demo.leadName}
          </span>
          <span dir="ltr" className="text-sm text-muted-foreground rtl:text-end">
            {home.demo.leadPhone}
          </span>
        </span>
        <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-[#e7f8ee] text-xl leading-none font-bold text-success">+</span>
      </div>
      {[home.handover.names[0], home.handover.names[2]].map((name, i) => (
        <div key={name} className="flex items-center gap-3.5 rounded-2xl bg-white/70 px-4 py-3">
          <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-[#1b1b20] text-xs font-bold text-white">{name.slice(0, 1)}</span>
          <span dir="auto" className="min-w-0 flex-1 truncate text-sm font-semibold">
            {name}
          </span>
          <span className={cn("h-2 rounded-full bg-[#1b1b20]/15", i === 0 ? "w-16" : "w-10")} />
        </div>
      ))}
    </div>
  );
}

/** A web page with the chat window open in the corner, and the colour choices. */
function WidgetPanel({ home }: { home: Home }) {
  return (
    <div dir="ltr" className="relative overflow-hidden rounded-3xl bg-white p-4 shadow-[0_18px_40px_-20px_rgb(0_0_0/0.6)] sm:p-5">
      <div className="flex gap-1.5">
        {[0, 1, 2].map((i) => (
          <span key={i} className="size-2.5 rounded-full bg-border" />
        ))}
      </div>
      <div className="mt-4 flex flex-col gap-2.5">
        <span className="h-3 w-1/2 rounded-full bg-foreground/70" />
        <span className="h-2.5 w-2/3 rounded-full bg-foreground/15" />
        <span className="h-2.5 w-1/2 rounded-full bg-foreground/15" />
      </div>
      <div className="mt-5 flex items-end justify-between gap-3">
        <div className="flex gap-1.5 sm:gap-2">
          {["#dc2626", "#1b1b20", "#00a04a", "#e11d48", "#f97316"].map((color, i) => (
            <span key={color} className={cn("size-5 rounded-full sm:size-7", i === 0 && "ring-2 ring-foreground ring-offset-2")} style={{ backgroundColor: color }} />
          ))}
        </div>
        <div className="flex w-28 shrink-0 flex-col overflow-hidden rounded-2xl shadow-[0_12px_28px_-12px_rgb(80_24_16/0.6)] ring-1 ring-black/5 sm:w-44">
          <span className="bg-primary px-3 py-2 text-xs font-semibold text-white">{home.demo.assistant}</span>
          <span className="flex flex-col gap-1.5 bg-muted p-2.5">
            <span className="h-4 w-3/4 rounded-full bg-white" />
            <span className="h-4 w-1/2 self-end rounded-full bg-primary" />
          </span>
        </div>
      </div>
    </div>
  );
}

const ROWS: { key: FeatureKey; panel: string }[] = [
  { key: "grounded", panel: "bg-accent" },
  { key: "bilingual", panel: "bg-[#1b1b20]" },
  { key: "leads", panel: "bg-[#fbbf24]" },
  { key: "widget", panel: "bg-primary" },
];

/** The four main features as large rows: words on one side, a coloured picture on the other, swapping sides each row. */
export function FeatureRows({ home }: { home: Home }) {
  return (
    <div className="flex flex-col gap-14 sm:gap-20 lg:gap-28">
      {ROWS.map(({ key, panel }, i) => (
        <div key={key} className="grid items-center gap-7 lg:grid-cols-2 lg:gap-16">
          <div className={cn("flex min-w-0 flex-col gap-4", i % 2 === 1 && "lg:order-2")}>
            <h3 className="text-[1.75rem] leading-[1.15] font-bold tracking-tight text-balance sm:text-4xl">{home.features.items[key].title}</h3>
            <p className="text-lg leading-relaxed text-pretty text-muted-foreground">{home.features.items[key].text}</p>
          </div>
          <div aria-hidden className={cn("min-w-0 overflow-hidden rounded-[2rem] p-5 sm:p-10", key === "grounded" && "p-4 sm:p-7", panel)}>
            {key === "grounded" && <KnowledgeChat demo={home.demo} />}
            {key === "bilingual" && <LanguagesPanel />}
            {key === "leads" && <LeadsPanel home={home} />}
            {key === "widget" && <WidgetPanel home={home} />}
          </div>
        </div>
      ))}
    </div>
  );
}

/** The remaining features as a plain list with their illustrations: no boxes, just the picture, a title and a line. */
export function FeatureList({ home, keys }: { home: Home; keys: FeatureKey[] }) {
  return (
    <ul className="grid gap-x-8 gap-y-10 sm:grid-cols-2 lg:grid-cols-4">
      {keys.map((key) => {
        const Art = FEATURE_ART[key];
        return (
          <li key={key} className="flex gap-4 sm:flex-col sm:gap-3">
            <Art className="h-16 w-20 sm:h-20 sm:w-[6.25rem]" />
            <div className="flex min-w-0 flex-col gap-1.5">
              <h3 className="text-lg font-bold tracking-tight">{home.features.items[key].title}</h3>
              <p className="text-[15px] leading-relaxed text-muted-foreground">{home.features.items[key].text}</p>
            </div>
          </li>
        );
      })}
    </ul>
  );
}

// ---------------------------------------------------------------- numbers

const TILES = ["bg-primary text-white", "bg-[#1b1b20] text-white", "bg-[#fbbf24] text-[#1b1b20]", "bg-accent text-foreground"];

/** The headline numbers as four solid colour tiles. */
export function StatTiles({ stats }: { stats: Home["stats"] }) {
  return (
    <dl className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
      {stats.map((stat, i) => (
        <div key={stat.label} className={cn("flex min-h-40 flex-col-reverse justify-between gap-6 rounded-3xl p-5 sm:min-h-52 sm:p-7", TILES[i % TILES.length])}>
          <dt className="text-sm leading-snug font-medium opacity-85 sm:text-base">{stat.label}</dt>
          <dd className="text-[2.5rem] leading-none font-bold tracking-tight sm:text-6xl">{stat.value}</dd>
        </div>
      ))}
    </dl>
  );
}

// ---------------------------------------------------------------- steps

/**
 * The setup steps on a timeline: a horizontal line with the steps hanging from it on wide
 * screens, a vertical line down the side on phones.
 */
export function StepsTimeline({ steps }: { steps: Home["steps"] }) {
  return (
    <ol className="relative grid gap-10 lg:grid-cols-3 lg:gap-8">
      {/* the line: down the start edge on phones, across the pictures on wide screens */}
      <span aria-hidden className="absolute start-10 top-4 bottom-4 w-px bg-border lg:inset-x-0 lg:top-12 lg:bottom-auto lg:h-px lg:w-auto" />
      {steps.items.map((step, i) => {
        const Art = STEP_ART[i];
        return (
          <li key={step.title} className="relative flex gap-5 lg:flex-col lg:gap-5">
            <Art className="h-16 w-20 lg:h-24 lg:w-[7.5rem]" />
            <div className="flex min-w-0 flex-col gap-2">
              <p className="text-sm font-bold text-primary">
                {steps.label} {i + 1}
              </p>
              <h3 className="text-xl font-bold tracking-tight">{step.title}</h3>
              <p className="text-[15px] leading-relaxed text-muted-foreground lg:max-w-sm">{step.text}</p>
            </div>
          </li>
        );
      })}
    </ol>
  );
}

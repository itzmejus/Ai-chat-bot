import { ArrowRight, Check, ChevronDown } from "lucide-react";
import Link from "next/link";
import { DotPattern } from "@/components/illustrations";
import { getSiteContent, PLAN_CURRENCY, SITE_PLANS, type Faq } from "@/content/site";
import { INDUSTRY_SLUGS, sitePath, type IndustrySlug, type SiteLang } from "@/lib/site-routes";
import { appLink } from "@/lib/site-seo";
import { cn } from "@/lib/utils";
import { INDUSTRY_ART, PlanArt, RELAY_ART } from "./art";
import { IndustryTabs } from "./industry-tabs";
import { HandoverLive } from "./live-chat";
import { CtaLink } from "./shell";

/** Page-width wrapper with consistent vertical rhythm. */
export function Section({ children, className, id, tone = "white" }: { children: React.ReactNode; className?: string; id?: string; tone?: "white" | "muted" }) {
  return (
    <section id={id} className={cn("scroll-mt-20 py-16 sm:py-24", tone === "muted" && "bg-muted", className)}>
      <div className="mx-auto max-w-6xl px-4 sm:px-6">{children}</div>
    </section>
  );
}

export function Eyebrow({ children, tone = "light" }: { children: React.ReactNode; tone?: "light" | "dark" }) {
  return (
    <p className={cn("inline-flex items-center gap-2 rounded-full px-3 py-1 text-[13px] font-semibold", tone === "dark" ? "bg-white/10 text-white ring-1 ring-white/15" : "bg-accent text-accent-foreground")}>
      {children}
    </p>
  );
}

export function SectionHeading({ eyebrow, title, sub, align = "center", as: Tag = "h2" }: { eyebrow?: string; title: string; sub?: string; align?: "center" | "start"; as?: "h1" | "h2" }) {
  return (
    <div className={cn("flex max-w-3xl flex-col gap-4", align === "center" ? "mx-auto items-center text-center" : "items-start text-start")}>
      {eyebrow && <Eyebrow>{eyebrow}</Eyebrow>}
      <Tag className={cn("font-bold tracking-tight text-balance", Tag === "h1" ? "text-4xl leading-[1.1] sm:text-5xl" : "text-[1.75rem] leading-[1.15] sm:text-[2.75rem] sm:leading-[1.1]")}>{title}</Tag>
      {sub && <p className="text-lg leading-relaxed text-pretty text-muted-foreground">{sub}</p>}
    </div>
  );
}

/** Hero for inner pages: soft blue glow, heading, optional children (buttons). */
export function PageHero({ eyebrow, title, sub, children }: { eyebrow: string; title: string; sub: string; children?: React.ReactNode }) {
  return (
    <section className="site-hero relative overflow-hidden border-b border-border/60">
      <div className="mx-auto flex max-w-6xl flex-col items-center gap-8 px-4 py-16 sm:px-6 sm:py-24">
        <SectionHeading as="h1" eyebrow={eyebrow} title={title} sub={sub} />
        {children}
      </div>
    </section>
  );
}

/** "Learn more"-style text link with an arrow. */
export function ArrowLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link href={href} className="group flex h-11 items-center gap-2 rounded-lg px-3 text-[15px] font-semibold text-primary hover:bg-accent">
      {children}
      <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5 rtl:rotate-180 rtl:group-hover:-translate-x-0.5" />
    </Link>
  );
}

// ---------------------------------------------------------------- industries

/**
 * The industries as tabs: pick one to see what customers ask and a sample exchange.
 * Every panel is in the HTML (the hidden ones too), so search engines read all six.
 */
export function IndustryShowcase({ lang }: { lang: SiteLang }) {
  const t = getSiteContent(lang);
  return (
    <IndustryTabs
      label={t.nav.industries}
      asks={t.industryPage.asks}
      more={t.home.industries.link}
      items={INDUSTRY_SLUGS.map((slug) => {
        const industry = t.industries[slug];
        return { slug, name: industry.name, short: industry.short, title: industry.h1, questions: industry.questions.slice(0, 4), chat: industry.chat, href: sitePath(lang, `/industries/${slug}`) };
      })}
    />
  );
}

/** Industry cards linking to their pages, each with its illustration. */
export function IndustryCards({ lang, exclude }: { lang: SiteLang; exclude?: IndustrySlug }) {
  const t = getSiteContent(lang);
  return (
    <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {INDUSTRY_SLUGS.filter((slug) => slug !== exclude).map((slug) => {
        const Art = INDUSTRY_ART[slug];
        const industry = t.industries[slug];
        return (
          <li key={slug}>
            <Link
              href={sitePath(lang, `/industries/${slug}`)}
              className="group flex h-full flex-col gap-3 rounded-3xl border border-border/80 bg-white p-6 transition-[box-shadow,transform,border-color] hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-[0_18px_40px_-24px_rgb(220_38_38/0.5)]"
            >
              <Art className="-ms-1 h-20 w-[6.25rem]" />
              <h3 className="text-lg font-semibold">{industry.name}</h3>
              <p className="text-[15px] leading-relaxed text-muted-foreground">{industry.short}</p>
              <span className="mt-auto flex items-center gap-1.5 pt-2 text-sm font-semibold text-primary">
                {t.home.industries.link}
                <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5 rtl:rotate-180 rtl:group-hover:-translate-x-0.5" />
              </span>
            </Link>
          </li>
        );
      })}
    </ul>
  );
}

// ---------------------------------------------------------------- pricing

const planNumber = (lang: SiteLang) => new Intl.NumberFormat(lang === "ar" ? "ar-u-nu-latn" : "en");

function Tick({ tone = "light" }: { tone?: "light" | "dark" }) {
  return (
    <span className={cn("mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full", tone === "dark" ? "bg-white/15 text-white" : "bg-accent text-primary")}>
      <Check className="size-3" strokeWidth={3} />
    </span>
  );
}

/**
 * The three plans side by side, the recommended one on a dark raised card.
 * Prices and limits come from SITE_PLANS.
 */
export function PricingCards({ lang }: { lang: SiteLang }) {
  const t = getSiteContent(lang).pricingPage;
  const number = planNumber(lang);
  return (
    <ul className="mx-auto grid max-w-md items-stretch gap-5 lg:max-w-none lg:grid-cols-3 lg:gap-6">
      {SITE_PLANS.map((plan, i) => {
        const dark = Boolean(plan.popular);
        return (
          <li
            key={plan.id}
            className={cn(
              "relative flex flex-col gap-6 overflow-hidden rounded-[1.75rem] p-7 sm:p-8",
              dark ? "hero-surface text-white shadow-[0_32px_64px_-28px_rgb(220_38_38/0.7)] lg:-my-3" : "border border-border/80 bg-white",
            )}
          >
            <div className="flex items-start justify-between gap-3">
              <PlanArt level={(i + 1) as 1 | 2 | 3} className={dark ? "text-white" : "text-primary"} />
              {plan.popular && <span className="rounded-full bg-[#fbbf24] px-3 py-1 text-xs font-bold text-[#1b1b20]">{t.popular}</span>}
            </div>
            <div className="flex flex-col gap-1">
              <h3 className="text-xl font-bold">{t.plans[plan.id].name}</h3>
              <p className={cn("text-[15px]", dark ? "text-white/70" : "text-muted-foreground")}>{t.plans[plan.id].tagline}</p>
            </div>
            <p className="flex items-baseline gap-2">
              {plan.price === 0 ? (
                <span className="text-5xl font-bold tracking-tight">{t.free}</span>
              ) : (
                <>
                  <span dir="ltr" className="flex items-baseline gap-2">
                    {plan.was && (
                      // The regular price, crossed out; <s> tells screen readers it no longer applies.
                      <s className={cn("text-xl font-semibold", dark ? "text-white/45" : "text-muted-foreground/70")}>
                        {PLAN_CURRENCY.symbol}
                        {number.format(plan.was)}
                      </s>
                    )}
                    <span className="text-5xl font-bold tracking-tight">
                      {PLAN_CURRENCY.symbol}
                      {number.format(plan.price)}
                    </span>
                  </span>
                  <span className={cn("text-sm", dark ? "text-white/70" : "text-muted-foreground")}>{t.perMonth}</span>
                </>
              )}
            </p>
            <CtaLink href={appLink("/signup")} variant={dark ? "light" : "outline"} className="w-full">
              {t.plans[plan.id].cta}
            </CtaLink>
            <ul className={cn("flex flex-col gap-3 border-t pt-6 text-[15px]", dark ? "border-white/15" : "border-border")}>
              {(
                [
                  [plan.messages, t.limits.messages],
                  [plan.pages, t.limits.pages],
                  [plan.seats, t.limits.seats],
                ] as const
              ).map(([value, label]) => (
                <li key={label} className="flex items-start gap-3">
                  <Tick tone={dark ? "dark" : "light"} />
                  <span>
                    <strong className="font-semibold">{number.format(value)}</strong> {label}
                  </span>
                </li>
              ))}
            </ul>
          </li>
        );
      })}
    </ul>
  );
}

/** Everything every plan includes, as a strip under the plan cards. */
export function IncludedInEveryPlan({ lang }: { lang: SiteLang }) {
  const t = getSiteContent(lang).pricingPage.included;
  return (
    <div className="rounded-[1.75rem] bg-accent p-6 sm:p-8">
      <h3 className="text-lg font-bold">{t.title}</h3>
      <ul className="mt-4 grid gap-x-6 gap-y-3 sm:grid-cols-2 lg:grid-cols-3">
        {t.items.map((item) => (
          <li key={item} className="flex items-start gap-3 text-[15px]">
            <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-primary text-white">
              <Check className="size-3" strokeWidth={3} />
            </span>
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}

/** The plans as a table: price and limits first, then what all of them include. */
export function PlanComparison({ lang }: { lang: SiteLang }) {
  const t = getSiteContent(lang).pricingPage;
  const number = planNumber(lang);
  const limit = (label: string) => label.charAt(0).toUpperCase() + label.slice(1);
  const rows: { label: string; cells: React.ReactNode[] }[] = [
    { label: t.compare.price, cells: SITE_PLANS.map((p) =>
        p.price === 0 ? (
          t.free
        ) : (
          <span key={p.id} dir="ltr" className="inline-flex items-baseline gap-1.5">
            {p.was && (
              <s className="text-sm font-normal text-muted-foreground">
                {PLAN_CURRENCY.symbol}
                {number.format(p.was)}
              </s>
            )}
            {PLAN_CURRENCY.symbol}
            {number.format(p.price)}
          </span>
        ),
      ),
    },
    { label: limit(t.limits.messages), cells: SITE_PLANS.map((p) => number.format(p.messages)) },
    { label: limit(t.limits.pages), cells: SITE_PLANS.map((p) => number.format(p.pages)) },
    { label: limit(t.limits.seats), cells: SITE_PLANS.map((p) => number.format(p.seats)) },
  ];
  return (
    <div className="overflow-hidden rounded-3xl border border-border/80 bg-white sm:rounded-[1.75rem]">
      {/* Sized to fit a phone without scrolling sideways: small type and tight cells there, roomier from tablets up. */}
      <table className="w-full border-collapse text-[13px] leading-snug sm:text-[15px]">
        <caption className="sr-only">{t.compare.title}</caption>
        <thead>
          <tr className="border-b border-border">
            <th scope="col" className="p-2.5 text-start text-xs font-semibold text-muted-foreground sm:p-4 sm:px-6 sm:text-sm">
              {t.compare.feature}
            </th>
            {SITE_PLANS.map((plan) => (
              <th key={plan.id} scope="col" className={cn("w-[19%] p-2.5 text-center text-[13px] font-bold sm:w-auto sm:p-4 sm:text-base", plan.popular && "bg-accent text-accent-foreground")}>
                {t.plans[plan.id].name}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.label} className="border-b border-border/70">
              <th scope="row" className="p-2.5 text-start font-medium sm:p-4 sm:px-6">
                {row.label}
              </th>
              {row.cells.map((cell, i) => (
                <td key={i} dir="ltr" className={cn("p-2 text-center font-semibold whitespace-nowrap tabular-nums sm:p-4", SITE_PLANS[i].popular && "bg-accent/60")}>
                  {cell}
                </td>
              ))}
            </tr>
          ))}
          {t.included.items.map((item) => (
            <tr key={item} className="border-b border-border/70 last:border-0">
              <th scope="row" className="p-2.5 text-start font-medium sm:p-4 sm:px-6">
                {item}
              </th>
              {SITE_PLANS.map((plan) => (
                <td key={plan.id} className={cn("p-2 sm:p-4", plan.popular && "bg-accent/60")}>
                  <span className="mx-auto flex size-5 items-center justify-center rounded-full bg-[#e7f8ee] text-success">
                    <Check className="size-3" strokeWidth={3} />
                    <span className="sr-only">{t.compare.yes}</span>
                  </span>
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ---------------------------------------------------------------- AI and people, together

/** How the assistant and the team share a conversation: a three-stage relay beside a chat that changes hands. */
export function HandoverSection({ lang }: { lang: SiteLang }) {
  const t = getSiteContent(lang).home.handover;
  return (
    <Section id="handover">
      <SectionHeading title={t.title} sub={t.text} />
      <div className="mt-12 grid items-stretch gap-6 lg:grid-cols-2">
        <ol className="relative flex flex-col gap-4">
          {t.flow.map((stage, i) => {
            const Art = RELAY_ART[i];
            return (
              <li key={stage.title} className="relative flex flex-1 items-center gap-4 rounded-3xl border border-border/80 bg-white p-4 sm:gap-6 sm:p-6">
                <Art className="h-20 w-[6.25rem] sm:h-24 sm:w-[7.5rem]" />
                <div className="flex min-w-0 flex-col gap-1.5">
                  <p className="text-xs font-bold tracking-wide text-primary uppercase">
                    {i + 1} / {t.flow.length}
                  </p>
                  <h3 className="text-lg font-semibold sm:text-xl">{stage.title}</h3>
                  <p className="text-[15px] leading-relaxed text-muted-foreground">{stage.text}</p>
                </div>
              </li>
            );
          })}
        </ol>
        <HandoverLive t={t} />
      </div>
      <ul className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {t.points.map((point) => (
          <li key={point} className="flex items-start gap-3 rounded-2xl bg-muted p-4 text-[15px] leading-snug font-medium">
            <Tick />
            {point}
          </li>
        ))}
      </ul>
    </Section>
  );
}

// ---------------------------------------------------------------- FAQ and closing band

/** Questions and answers. Native <details>, so it works without JavaScript and the answers are in the HTML. */
export function FaqList({ items }: { items: Faq[] }) {
  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-3">
      {items.map((item) => (
        <details key={item.q} className="group rounded-2xl border border-border/80 bg-white open:shadow-[0_12px_30px_-20px_rgb(27_27_32/0.35)]">
          <summary className="flex cursor-pointer list-none items-center justify-between gap-4 p-5 text-start text-base font-semibold [&::-webkit-details-marker]:hidden">
            <h3 className="text-base font-semibold">{item.q}</h3>
            <ChevronDown className="size-5 shrink-0 text-muted-foreground transition-transform group-open:rotate-180" />
          </summary>
          <p className="px-5 pb-5 text-[15px] leading-relaxed text-muted-foreground">{item.a}</p>
        </details>
      ))}
    </div>
  );
}

/** Closing call to action on a dark panel. */
export function CtaBand({ lang }: { lang: SiteLang }) {
  const t = getSiteContent(lang).home.cta;
  return (
    <section className="px-4 py-16 sm:px-6 sm:py-24">
      <div className="hero-surface relative mx-auto flex max-w-6xl flex-col items-center gap-6 overflow-hidden rounded-[2rem] px-6 py-16 text-center sm:py-20">
        <DotPattern className="text-white/10" />
        <h2 className="relative max-w-2xl text-3xl leading-tight font-bold tracking-tight text-balance text-white sm:text-[2.5rem]">{t.title}</h2>
        <p className="relative max-w-xl text-lg leading-relaxed text-white/75">{t.sub}</p>
        <CtaLink href={appLink("/signup")} variant="light" size="lg" arrow className="relative w-full sm:w-auto">
          {t.button}
        </CtaLink>
        <p className="relative text-sm text-white/60">{t.note}</p>
      </div>
    </section>
  );
}

/** Small decorative pictures inside the two wide feature cards. */
export function GroundedVisual() {
  return (
    <div aria-hidden dir="ltr" className="flex flex-wrap items-center gap-2">
      {["brightsmile.ae", "price-list.pdf", "FAQ"].map((label, i) => (
        <span key={label} className="flex items-center gap-2 rounded-full border border-border bg-white px-3 py-1.5 text-xs font-medium text-foreground/80">
          <span className={cn("size-2 rounded-full", ["bg-primary", "bg-[#fbbf24]", "bg-[#00c057]"][i])} />
          {label}
        </span>
      ))}
    </div>
  );
}

export function BilingualVisual() {
  return (
    <div aria-hidden className="flex flex-col gap-2">
      <p dir="ltr" className="w-fit rounded-2xl rounded-es-md bg-white px-3.5 py-2 text-[13px] shadow-[0_1px_3px_rgb(27_27_32/0.12)]">
        We are open until 9 pm today.
      </p>
      <p dir="rtl" className="w-fit self-end rounded-2xl rounded-es-md bg-white px-3.5 py-2 text-[13px] shadow-[0_1px_3px_rgb(27_27_32/0.12)]">
        نعم، نفتح اليوم حتى الساعة 9 مساءً.
      </p>
      <p dir="ltr" className="w-fit rounded-2xl rounded-es-md bg-white px-3.5 py-2 text-[13px] shadow-[0_1px_3px_rgb(27_27_32/0.12)]">
        जी हाँ, हम आज रात 9 बजे तक खुले हैं।
      </p>
    </div>
  );
}

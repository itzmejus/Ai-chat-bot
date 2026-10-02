import {
  ArrowRight,
  BarChart3,
  Building2,
  Car,
  Check,
  ChevronDown,
  FileText,
  Globe,
  Headset,
  Inbox,
  Languages,
  MessageCircleQuestion,
  Palette,
  Scissors,
  ShieldCheck,
  ShoppingBag,
  Stethoscope,
  UserPlus,
  UtensilsCrossed,
  type LucideIcon,
} from "lucide-react";
import Link from "next/link";
import { DotPattern } from "@/components/illustrations";
import { getSiteContent, SITE_PLANS, type Faq, type FeatureKey } from "@/content/site";
import { INDUSTRY_SLUGS, sitePath, type IndustrySlug, type SiteLang } from "@/lib/site-routes";
import { appLink } from "@/lib/site-seo";
import { cn } from "@/lib/utils";
import { CtaLink } from "./shell";

export const FEATURE_ICONS: Record<FeatureKey, LucideIcon> = {
  grounded: MessageCircleQuestion,
  bilingual: Languages,
  leads: UserPlus,
  handover: Headset,
  inbox: Inbox,
  insights: BarChart3,
  widget: Palette,
  security: ShieldCheck,
};

/** Icon colours, one per feature, so the grid is not a wall of blue. */
export const FEATURE_TINT: Record<FeatureKey, string> = {
  grounded: "bg-[#e8f1ff] text-[#0055d6]",
  bilingual: "bg-[#f1ebff] text-[#5b34c4]",
  leads: "bg-[#e7f8ee] text-[#00873d]",
  handover: "bg-[#fff0e8] text-[#c2410c]",
  inbox: "bg-[#e8f1ff] text-[#0055d6]",
  insights: "bg-[#fff6d6] text-[#8a6100]",
  widget: "bg-[#ffe9f1] text-[#be185d]",
  security: "bg-[#e6f7f6] text-[#0f766e]",
};

export const INDUSTRY_ICONS: Record<IndustrySlug, LucideIcon> = {
  clinics: Stethoscope,
  "real-estate": Building2,
  salons: Scissors,
  restaurants: UtensilsCrossed,
  "car-rental": Car,
  retail: ShoppingBag,
};

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
      <Tag className={cn("font-bold tracking-tight text-balance", Tag === "h1" ? "text-4xl leading-[1.1] sm:text-5xl" : "text-3xl leading-tight sm:text-[2.5rem]")}>{title}</Tag>
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

/** Six industry cards linking to their pages. */
export function IndustryCards({ lang, exclude }: { lang: SiteLang; exclude?: IndustrySlug }) {
  const t = getSiteContent(lang);
  return (
    <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {INDUSTRY_SLUGS.filter((slug) => slug !== exclude).map((slug) => {
        const Icon = INDUSTRY_ICONS[slug];
        const industry = t.industries[slug];
        return (
          <li key={slug}>
            <Link
              href={sitePath(lang, `/industries/${slug}`)}
              className="card-surface group flex h-full flex-col gap-3 rounded-2xl border border-border/80 p-6 transition-[box-shadow,transform,border-color] hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-[0_18px_40px_-24px_rgb(0_102_255/0.5)]"
            >
              <span className="flex size-11 items-center justify-center rounded-xl bg-accent text-primary">
                <Icon className="size-5" />
              </span>
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

/** The three plans. Prices and limits come from SITE_PLANS. */
export function PricingCards({ lang }: { lang: SiteLang }) {
  const t = getSiteContent(lang).pricingPage;
  const number = new Intl.NumberFormat(lang === "ar" ? "ar-AE-u-nu-latn" : "en-AE");
  return (
    <ul className="grid items-stretch gap-5 lg:grid-cols-3">
      {SITE_PLANS.map((plan) => (
        <li
          key={plan.id}
          className={cn(
            "relative flex flex-col gap-6 rounded-3xl border p-7",
            plan.popular ? "border-primary bg-white shadow-[0_30px_60px_-30px_rgb(0_102_255/0.55)] ring-4 ring-primary/10" : "card-surface border-border/80",
          )}
        >
          {plan.popular && <span className="absolute -top-3.5 start-7 rounded-full bg-primary px-3 py-1 text-xs font-semibold text-white">{t.popular}</span>}
          <div className="flex flex-col gap-1">
            <h3 className="text-xl font-bold">{t.plans[plan.id].name}</h3>
            <p className="text-[15px] text-muted-foreground">{t.plans[plan.id].tagline}</p>
          </div>
          <p className="flex items-baseline gap-2">
            {plan.priceAed === 0 ? (
              <span className="text-4xl font-bold tracking-tight">{t.free}</span>
            ) : (
              <>
                <span className="text-4xl font-bold tracking-tight" dir="ltr">
                  AED {number.format(plan.priceAed)}
                </span>
                <span className="text-sm text-muted-foreground">{t.perMonth}</span>
              </>
            )}
          </p>
          <ul className="flex flex-col gap-3 text-[15px]">
            {(
              [
                [plan.messages, t.limits.messages],
                [plan.pages, t.limits.pages],
                [plan.seats, t.limits.seats],
              ] as const
            ).map(([value, label]) => (
              <li key={label} className="flex items-start gap-3">
                <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-accent text-primary">
                  <Check className="size-3" strokeWidth={3} />
                </span>
                <span>
                  <strong className="font-semibold">{number.format(value)}</strong> {label}
                </span>
              </li>
            ))}
          </ul>
          <CtaLink href={appLink("/signup")} variant={plan.popular ? "primary" : "outline"} className="mt-auto w-full">
            {t.plans[plan.id].cta}
          </CtaLink>
        </li>
      ))}
    </ul>
  );
}

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
        <CtaLink href={appLink("/signup")} variant="light" size="lg" arrow className="relative">
          {t.button}
        </CtaLink>
        <p className="relative text-sm text-white/60">{t.note}</p>
      </div>
    </section>
  );
}

/** Small decorative pictures inside the two wide feature cards. */
export function GroundedVisual() {
  const sources: [LucideIcon, string][] = [
    [Globe, "brightsmile.ae"],
    [FileText, "price-list.pdf"],
    [MessageCircleQuestion, "FAQ"],
  ];
  return (
    <div aria-hidden dir="ltr" className="flex flex-wrap items-center gap-2">
      {sources.map(([Icon, label]) => (
        <span key={label} className="flex items-center gap-1.5 rounded-full border border-border bg-white px-3 py-1.5 text-xs font-medium text-foreground/80">
          <Icon className="size-3.5 text-primary" />
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
    </div>
  );
}

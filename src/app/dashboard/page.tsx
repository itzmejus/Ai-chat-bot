import { ArrowRight, BookOpen, Check, FileText, MessagesSquare, Sparkles, Users, type LucideIcon } from "lucide-react";
import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { ChatScene, DotPattern, ProgressRing } from "@/components/illustrations";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { DAYS, type WorkingHours } from "@/lib/validation";
import { requireWorkspace } from "@/server/auth/session";
import { knowledgePagesUsed } from "@/server/knowledge";
import { getAiMessagesUsed } from "@/server/limits/usage";

export const metadata = { title: "Overview" };

const SURFACE_SHADOW = "shadow-[0_1px_2px_rgb(16_24_40/0.04),0_4px_16px_-4px_rgb(16_24_40/0.06)]";

/** Ring colour for a usage figure: the tile's own colour, amber when nearly used up, red when full. */
function usageColor(value: number, max: number, base: string) {
  const ratio = max > 0 ? value / max : 0;
  return ratio >= 1 ? "#d6000a" : ratio >= 0.8 ? "#d97706" : base;
}

/** One headline number. Limits get a progress ring; plain counts get an icon badge. */
function StatTile({
  icon: Icon,
  label,
  value,
  hint,
  max,
  color,
  ringColor = color,
}: {
  icon: LucideIcon;
  label: string;
  value: number;
  hint?: string;
  max?: number;
  /** Accent colour: tints the tile and colours the icon. */
  color: string;
  ringColor?: string;
}) {
  return (
    <div
      className={cn("relative overflow-hidden rounded-2xl border border-border/70 bg-card p-4 sm:p-5", SURFACE_SHADOW)}
      style={{
        // Same soft surface as cards, with the corner glow in this tile's accent colour.
        backgroundImage: `radial-gradient(110% 110% at 100% 0%, color-mix(in oklab, ${color} 13%, transparent), transparent 62%), linear-gradient(180deg, #ffffff, #fafafc)`,
      }}
    >
      <div className="flex items-start justify-between gap-2">
        <p className="text-[13px] leading-snug font-medium text-muted-foreground sm:text-sm">{label}</p>
        {max !== undefined ? (
          <ProgressRing value={value} max={max} color={ringColor} size={44}>
            <Icon className="size-4" />
          </ProgressRing>
        ) : (
          <span
            className="flex size-11 shrink-0 items-center justify-center rounded-full"
            style={{ color, backgroundColor: `color-mix(in oklab, ${color} 14%, white)` }}
          >
            <Icon className="size-[18px]" />
          </span>
        )}
      </div>
      <p className="mt-2 flex flex-wrap items-baseline gap-x-1.5">
        <span className="text-3xl font-bold tracking-tight tabular-nums">{value}</span>
        {hint && <span className="text-sm text-muted-foreground">{hint}</span>}
      </p>
    </div>
  );
}

/**
 * Overview: setup progress, usage against the plan, and the business profile.
 * Conversation analytics are added in phase 6.
 */
export default async function OverviewPage() {
  const { user, workspace, db } = await requireWorkspace();
  const t = await getTranslations();

  const [readySources, pagesUsed, messagesUsed, members, testChats] = await Promise.all([
    db.knowledgeSource.count({ where: { status: "ready" } }),
    knowledgePagesUsed(db),
    getAiMessagesUsed(db),
    db.membership.count(),
    db.conversation.count({ where: { isTest: true } }),
  ]);

  const steps = [
    { done: readySources > 0, title: t("overview.step1Title"), text: t("overview.step1Text"), href: "/dashboard/knowledge" as const },
    { done: testChats > 0, title: t("overview.step2Title"), text: t("overview.step2Text"), href: "/dashboard/knowledge" as const },
  ];
  const stepsDone = steps.filter((s) => s.done).length;

  const hours = workspace.workingHours as Partial<WorkingHours> | null;
  const notSet = <span className="text-muted-foreground">{t("overview.notSet")}</span>;
  const profile: [string, React.ReactNode][] = [
    [t("onboarding.industry"), t(`onboarding.industries.${workspace.industry}`)],
    [t("onboarding.defaultLanguage"), t(`onboarding.languages.${workspace.defaultLanguage}`)],
    [t("onboarding.websiteUrl"), workspace.websiteUrl ? <span dir="ltr">{workspace.websiteUrl.replace(/^https?:\/\//, "")}</span> : notSet],
    [t("onboarding.phone"), workspace.phone ? <span dir="ltr">{workspace.phone}</span> : notSet],
    [t("onboarding.whatsapp"), workspace.whatsapp ? <span dir="ltr">{workspace.whatsapp}</span> : notSet],
  ];

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-6">
      {/* Welcome banner, with the setup checklist until every step is done */}
      <section className="hero-surface relative overflow-hidden rounded-3xl p-5 text-white shadow-xl sm:p-8">
        <DotPattern className="text-white/10" />
        <ChatScene className="pointer-events-none absolute -end-20 -top-12 w-52 opacity-30 sm:-end-2 sm:top-1/2 sm:w-72 sm:-translate-y-1/2 sm:opacity-100 lg:end-8 lg:w-80" />

        <div className="relative max-w-[78%] sm:max-w-md lg:max-w-xl">
          <p className="inline-flex max-w-full items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 text-xs font-medium text-white/80 ring-1 ring-white/15">
            <span className="size-1.5 shrink-0 rounded-full bg-[#00c057]" />
            <span className="truncate" dir="auto">
              {workspace.name}
            </span>
          </p>
          <h1 className="mt-4 text-[26px] leading-tight font-bold tracking-tight sm:text-4xl">
            {t("overview.welcome", { name: (user.name ?? user.email).split(" ")[0] })}
          </h1>
          <p className="mt-2 text-sm text-white/65 sm:text-base">{t("overview.subtitle", { business: workspace.name })}</p>
        </div>

        {stepsDone < steps.length && (
          <div className="relative mt-6 sm:mt-8 sm:max-w-[60%] lg:max-w-[58%]">
            <p className="flex flex-wrap items-center gap-x-2 text-sm font-semibold">
              <Sparkles className="size-4 text-[#ffd000]" />
              {t("overview.setupTitle")}
              <span className="font-normal text-white/55">· {t("overview.setupProgress", { done: stepsDone, total: steps.length })}</span>
            </p>
            <div className="mt-3 grid gap-2.5">
              {steps.map((step, i) => (
                <Link
                  key={step.title}
                  href={step.href}
                  className="group flex items-center gap-3 rounded-2xl bg-white/[0.08] p-3 ring-1 ring-white/10 backdrop-blur transition-colors hover:bg-white/[0.14] sm:gap-4 sm:p-4"
                >
                  <span
                    className={cn(
                      "flex size-9 shrink-0 items-center justify-center rounded-full text-sm font-semibold",
                      step.done ? "bg-[#00c057] text-white" : "bg-white/10 text-white ring-1 ring-white/20",
                    )}
                  >
                    {step.done ? <Check className="size-4" strokeWidth={3} /> : i + 1}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className={cn("block text-sm font-semibold sm:text-[15px]", step.done && "text-white/60 line-through")}>{step.title}</span>
                    <span className="block text-[13px] text-white/60 sm:text-sm">{step.text}</span>
                  </span>
                  <ArrowRight className="size-4 shrink-0 text-white/50 transition-transform group-hover:translate-x-0.5 rtl:-scale-x-100" />
                </Link>
              ))}
            </div>
          </div>
        )}
      </section>

      {/* Usage against the plan */}
      <div className="grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-4">
        <StatTile
          icon={MessagesSquare}
          label={t("overview.statMessages")}
          value={messagesUsed}
          hint={t("overview.ofMax", { max: workspace.plan.monthlyMessages })}
          max={workspace.plan.monthlyMessages}
          color="#0066ff"
          ringColor={usageColor(messagesUsed, workspace.plan.monthlyMessages, "#0066ff")}
        />
        <StatTile
          icon={FileText}
          label={t("overview.statPages")}
          value={pagesUsed}
          hint={t("overview.ofMax", { max: workspace.plan.maxKnowledgePages })}
          max={workspace.plan.maxKnowledgePages}
          color="#00a04a"
          ringColor={usageColor(pagesUsed, workspace.plan.maxKnowledgePages, "#00a04a")}
        />
        <StatTile icon={BookOpen} label={t("overview.statSources")} value={readySources} hint={t("overview.statSourcesHint")} color="#c99700" />
        <StatTile
          icon={Users}
          label={t("overview.statTeam")}
          value={members}
          hint={t("overview.ofMax", { max: workspace.plan.maxAgents })}
          max={workspace.plan.maxAgents}
          color="#7c4dff"
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>{t("overview.profile")}</CardTitle>
            <CardDescription dir="auto">{workspace.name}</CardDescription>
          </CardHeader>
          <CardContent>
            <dl className="flex flex-col">
              {profile.map(([label, value]) => (
                <div key={label} className="flex items-center justify-between gap-4 border-b border-border/70 py-3 text-sm">
                  <dt className="text-muted-foreground">{label}</dt>
                  <dd className="min-w-0 truncate font-medium">{value}</dd>
                </div>
              ))}
              <div className="flex items-center justify-between gap-4 border-b border-border/70 py-3 text-sm">
                <dt className="text-muted-foreground">{t("overview.plan")}</dt>
                <dd>
                  <Badge variant="secondary">{workspace.plan.name}</Badge>
                </dd>
              </div>
            </dl>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t("overview.workingHours")}</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="flex flex-col text-sm">
              {DAYS.map((day) => {
                const h = hours?.[day];
                const closed = !h || h.closed;
                return (
                  <li key={day} className="flex items-center justify-between gap-4 border-b border-border/70 py-2.5 last:border-0">
                    <span className="text-muted-foreground">{t(`onboarding.days.${day}`)}</span>
                    {closed ? (
                      <span className="text-muted-foreground">{t("overview.closed")}</span>
                    ) : (
                      <span dir="ltr" className="font-medium tabular-nums">
                        {h.open} – {h.close}
                      </span>
                    )}
                  </li>
                );
              })}
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

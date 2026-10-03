import { ArrowRight, CalendarDays, Check, CircleHelp, Headset, MessageSquarePlus, MessagesSquare, Sparkles, TrendingUp, UserPlus, type LucideIcon } from "lucide-react";
import Link from "next/link";
import { getFormatter, getTranslations } from "next-intl/server";
import { ChatScene, DotPattern } from "@/components/illustrations";
import { Meter } from "@/components/meter";
import { DailyColumns, HandlingBreakdown } from "@/components/overview/charts";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { conversationsPerDay, overviewCounts, questionInsights, type QuestionGroup } from "@/server/analytics";
import { requireWorkspace } from "@/server/auth/session";
import { knowledgePagesUsed } from "@/server/knowledge";
import { getAiMessagesUsed } from "@/server/limits/usage";

export const metadata = { title: "Overview" };

const SURFACE_SHADOW = "shadow-[0_1px_2px_rgb(16_24_40/0.04),0_4px_16px_-4px_rgb(16_24_40/0.06)]";

/** One headline number with an icon. The number is the chart. */
function StatTile({ icon: Icon, label, value, hint, color, href }: { icon: LucideIcon; label: string; value: number; hint: string; color: string; href?: string }) {
  const body = (
    <>
      <div className="flex items-start justify-between gap-2">
        <p className="text-[13px] leading-snug font-medium text-muted-foreground sm:text-sm">{label}</p>
        <span
          className="flex size-10 shrink-0 items-center justify-center rounded-full"
          style={{ color, backgroundColor: `color-mix(in oklab, ${color} 14%, white)` }}
        >
          <Icon className="size-[18px]" />
        </span>
      </div>
      <p className="mt-2 flex flex-wrap items-baseline gap-x-1.5">
        <span className="text-3xl font-bold tracking-tight">{value.toLocaleString("en-US")}</span>
        <span className="text-sm text-muted-foreground">{hint}</span>
      </p>
    </>
  );
  const className = cn("relative block overflow-hidden rounded-2xl border border-border/70 bg-card p-4 sm:p-5", SURFACE_SHADOW);
  // Same soft surface as cards, with the corner glow in this tile's accent colour.
  const style = {
    backgroundImage: `radial-gradient(110% 110% at 100% 0%, color-mix(in oklab, ${color} 13%, transparent), transparent 62%), linear-gradient(180deg, #ffffff, #fafafc)`,
  };
  return href ? (
    <Link href={href} className={cn(className, "transition-shadow hover:shadow-lg")} style={style}>
      {body}
    </Link>
  ) : (
    <div className={className} style={style}>
      {body}
    </div>
  );
}

/** A ranked list of question groups with a thin bar showing how often each was asked. */
function QuestionList({
  groups,
  barColor,
  timesAsked,
  action,
}: {
  groups: QuestionGroup[];
  barColor: string;
  timesAsked: (count: number) => string;
  action: (group: QuestionGroup) => React.ReactNode;
}) {
  const max = Math.max(...groups.map((g) => g.count), 1);
  return (
    <ol className="flex flex-col">
      {groups.map((group, i) => (
        <li key={`${group.conversationId}-${i}`} className="flex items-center gap-3 border-b border-border/60 py-2.5 last:border-0">
          <span className="w-5 shrink-0 text-center text-xs font-semibold text-muted-foreground tabular-nums">{i + 1}</span>
          <div className="min-w-0 flex-1">
            {/* React escapes this text: it was typed by an anonymous website visitor. */}
            <p className="truncate text-sm font-medium" dir="auto" title={group.text}>
              {group.text}
            </p>
            <div className="mt-1.5 flex items-center gap-2">
              <span className="h-1.5 flex-1 overflow-hidden rounded-full bg-secondary">
                <span className="block h-full rounded-full" style={{ width: `${(group.count / max) * 100}%`, backgroundColor: barColor }} />
              </span>
              <span className="shrink-0 text-xs text-muted-foreground">{timesAsked(group.count)}</span>
            </div>
          </div>
          {action(group)}
        </li>
      ))}
    </ol>
  );
}

function CardTitleRow({ icon: Icon, title, description, color }: { icon: LucideIcon; title: string; description: string; color: string }) {
  return (
    <CardHeader>
      <div className="flex items-center gap-3">
        <span className="flex size-10 shrink-0 items-center justify-center rounded-xl" style={{ color, backgroundColor: `color-mix(in oklab, ${color} 13%, white)` }}>
          <Icon className="size-5" />
        </span>
        <div className="min-w-0">
          <CardTitle>{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </div>
      </div>
    </CardHeader>
  );
}

/**
 * Overview: setup progress, headline numbers, conversation charts, what customers
 * ask (and what the assistant could not answer), and plan usage.
 */
export default async function OverviewPage() {
  const { user, workspace, db } = await requireWorkspace();
  const t = await getTranslations();
  const format = await getFormatter();

  const [readySources, pagesUsed, messagesUsed, members, testChats, widget, counts, daily, questions] = await Promise.all([
    db.knowledgeSource.count({ where: { status: "ready" } }),
    knowledgePagesUsed(db),
    getAiMessagesUsed(db),
    db.membership.count(),
    db.conversation.count({ where: { isTest: true } }),
    db.widgetSettings.findFirst({ select: { allowedDomains: true } }),
    overviewCounts(db),
    conversationsPerDay(workspace.id),
    questionInsights(workspace.id),
  ]);

  const steps = [
    { done: readySources > 0, title: t("overview.step1Title"), text: t("overview.step1Text"), href: "/dashboard/knowledge" as const },
    { done: testChats > 0, title: t("overview.step2Title"), text: t("overview.step2Text"), href: "/dashboard/knowledge" as const },
    { done: (widget?.allowedDomains.length ?? 0) > 0, title: t("overview.step3Title"), text: t("overview.step3Text"), href: "/dashboard/widget" as const },
  ];
  const stepsDone = steps.filter((s) => s.done).length;

  const usage = [
    { label: t("overview.usageMessages"), value: messagesUsed, max: workspace.plan.monthlyMessages, warn: true },
    { label: t("overview.usagePages"), value: pagesUsed, max: workspace.plan.maxKnowledgePages, warn: true },
    { label: t("overview.usageTeam"), value: members, max: workspace.plan.maxAgents, warn: false },
  ];
  const timesAsked = (count: number) => t("overview.timesAsked", { count });

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
              <Sparkles className="size-4 text-[#fbbf24]" />
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

      {/* Headline numbers */}
      <div className="grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-4">
        <StatTile icon={MessagesSquare} label={t("overview.kpiTotal")} value={counts.total} hint={t("overview.kpiTotalHint")} color="#dc2626" href="/dashboard/inbox" />
        <StatTile icon={CalendarDays} label={t("overview.kpiToday")} value={counts.today} hint={t("overview.kpiTodayHint")} color="#7c4dff" />
        <StatTile
          icon={UserPlus}
          label={t("overview.kpiLeads")}
          value={counts.leads}
          hint={t("overview.kpiLeadsHint", { count: counts.newLeads })}
          color="#00a04a"
          href="/dashboard/leads"
        />
        <StatTile
          icon={Headset}
          label={t("overview.kpiNeedsHuman")}
          value={counts.needsHuman}
          hint={t("overview.kpiNeedsHumanHint")}
          color="#eb6834"
          href="/dashboard/inbox"
        />
      </div>

      {/* Charts */}
      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardTitleRow icon={TrendingUp} title={t("overview.chartTitle")} description={t("overview.chartSubtitle")} color="#dc2626" />
          <CardContent>
            <DailyColumns data={daily} />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>{t("overview.handlingTitle")}</CardTitle>
            <CardDescription>{t("overview.handlingSubtitle")}</CardDescription>
          </CardHeader>
          <CardContent>
            <HandlingBreakdown counts={counts.byStatus} />
          </CardContent>
        </Card>
      </div>

      {/* What customers ask */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardTitleRow icon={MessagesSquare} title={t("overview.topTitle")} description={t("overview.topSubtitle")} color="#dc2626" />
          <CardContent>
            {questions.top.length === 0 ? (
              <p className="rounded-xl border border-dashed p-4 text-sm text-muted-foreground">{t("overview.topEmpty")}</p>
            ) : (
              <QuestionList
                groups={questions.top}
                barColor="#dc2626"
                timesAsked={timesAsked}
                action={(group) => (
                  <Link
                    href={`/dashboard/inbox?c=${group.conversationId}`}
                    title={`${t("overview.viewChat")} · ${format.dateTime(group.lastAsked, { dateStyle: "medium" })}`}
                    aria-label={t("overview.viewChat")}
                    className="flex size-8 shrink-0 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground"
                  >
                    <ArrowRight className="size-4 rtl:-scale-x-100" />
                  </Link>
                )}
              />
            )}
          </CardContent>
        </Card>

        <Card>
          <CardTitleRow icon={CircleHelp} title={t("overview.unansweredTitle")} description={t("overview.unansweredSubtitle")} color="#eb6834" />
          <CardContent>
            {questions.unanswered.length === 0 ? (
              <p className="flex items-center gap-2 rounded-xl border border-dashed p-4 text-sm text-muted-foreground">
                <Check className="size-4 shrink-0 text-success" />
                {t("overview.unansweredEmpty")}
              </p>
            ) : (
              <QuestionList
                groups={questions.unanswered}
                barColor="#eb6834"
                timesAsked={timesAsked}
                action={(group) => (
                  // Opens the FAQ form with this question filled in.
                  <Link
                    href={`/dashboard/knowledge?faq=${encodeURIComponent(group.text.slice(0, 300))}`}
                    className="flex h-8 shrink-0 items-center gap-1.5 rounded-lg border border-border/80 bg-background px-2.5 text-xs font-medium hover:border-primary/50 hover:text-primary"
                  >
                    <MessageSquarePlus className="size-3.5" />
                    {t("overview.addAnswer")}
                  </Link>
                )}
              />
            )}
          </CardContent>
        </Card>
      </div>

      {/* Plan usage */}
      <Card>
        <CardHeader>
          <div className="flex flex-wrap items-center justify-between gap-2">
            <CardTitle className="flex items-center gap-2">
              {t("overview.usageTitle")}
              <Badge variant="secondary">{workspace.plan.name}</Badge>
            </CardTitle>
            <Link href="/dashboard/settings" className="flex h-8 items-center rounded-lg px-2 text-sm font-medium text-primary hover:bg-accent">
              {t("nav.viewPlans")}
            </Link>
          </div>
        </CardHeader>
        <CardContent className="grid gap-5 sm:grid-cols-3">
          {usage.map((u) => (
            <div key={u.label}>
              <div className="mb-1.5 flex items-baseline justify-between gap-2 text-sm">
                <span className="text-muted-foreground">{u.label}</span>
                <span className="font-medium tabular-nums">
                  {u.value} <span className="font-normal text-muted-foreground">{t("overview.ofMax", { max: u.max })}</span>
                </span>
              </div>
              <Meter value={u.value} max={u.max} warn={u.warn} />
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}

import { ArrowRight, BookOpen, Check, FileText, MessagesSquare, Sparkles, Users, type LucideIcon } from "lucide-react";
import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { Meter } from "@/components/meter";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { DAYS, type WorkingHours } from "@/lib/validation";
import { requireWorkspace } from "@/server/auth/session";
import { knowledgePagesUsed } from "@/server/knowledge";
import { getAiMessagesUsed } from "@/server/limits/usage";

export const metadata = { title: "Overview" };

/** One headline number with an icon and, for limits, a usage bar. */
function StatTile({
  icon: Icon,
  label,
  value,
  hint,
  max,
  warn,
  tint,
}: {
  icon: LucideIcon;
  label: string;
  value: number;
  hint?: string;
  max?: number;
  warn?: boolean;
  tint: string;
}) {
  return (
    <Card size="sm">
      <CardContent className="flex flex-col gap-3">
        <div className="flex items-center justify-between gap-2">
          <p className="text-sm font-medium text-muted-foreground">{label}</p>
          <span className={cn("flex size-9 shrink-0 items-center justify-center rounded-xl", tint)}>
            <Icon className="size-[18px]" />
          </span>
        </div>
        <p className="flex items-baseline gap-1.5">
          <span className="text-2xl font-bold tracking-tight tabular-nums sm:text-3xl">{value}</span>
          {hint && <span className="text-sm text-muted-foreground">{hint}</span>}
        </p>
        {max !== undefined && <Meter value={value} max={max} warn={warn} />}
      </CardContent>
    </Card>
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
      <div>
        <h1 className="text-2xl font-bold tracking-tight md:text-[28px]">{t("overview.welcome", { name: (user.name ?? user.email).split(" ")[0] })}</h1>
        <p className="mt-1 text-muted-foreground">{t("overview.subtitle", { business: workspace.name })}</p>
      </div>

      {/* Setup checklist: shown until every step is done */}
      {stepsDone < steps.length && (
        <Card className="relative overflow-hidden border-0 bg-sidebar text-white shadow-lg">
          <div aria-hidden className="pointer-events-none absolute -end-20 -top-24 size-72 rounded-full bg-primary/40 blur-3xl" />
          <CardHeader className="relative">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Sparkles className="size-5 text-[#ffd000]" />
              {t("overview.setupTitle")}
            </CardTitle>
            <CardDescription className="text-white/60">
              {t("overview.setupProgress", { done: stepsDone, total: steps.length })}
            </CardDescription>
          </CardHeader>
          <CardContent className="relative grid gap-3 md:grid-cols-2">
            {steps.map((step, i) => (
              <Link
                key={step.title}
                href={step.href}
                className="group flex items-center gap-4 rounded-xl bg-white/[0.07] p-4 ring-1 ring-white/10 transition-colors hover:bg-white/[0.12]"
              >
                <span
                  className={cn(
                    "flex size-9 shrink-0 items-center justify-center rounded-full text-sm font-semibold",
                    step.done ? "bg-[#00c057] text-white" : "bg-white/10 text-white",
                  )}
                >
                  {step.done ? <Check className="size-4" strokeWidth={3} /> : i + 1}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block font-semibold">{step.title}</span>
                  <span className="block text-sm text-white/60">{step.text}</span>
                </span>
                <ArrowRight className="size-4 shrink-0 text-white/50 transition-transform group-hover:translate-x-0.5 rtl:-scale-x-100" />
              </Link>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Usage against the plan */}
      <div className="grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-4">
        <StatTile
          icon={MessagesSquare}
          label={t("overview.statMessages")}
          value={messagesUsed}
          hint={t("overview.ofMax", { max: workspace.plan.monthlyMessages })}
          max={workspace.plan.monthlyMessages}
          tint="bg-accent text-primary"
        />
        <StatTile
          icon={FileText}
          label={t("overview.statPages")}
          value={pagesUsed}
          hint={t("overview.ofMax", { max: workspace.plan.maxKnowledgePages })}
          max={workspace.plan.maxKnowledgePages}
          tint="bg-[#e7f8ee] text-success"
        />
        <StatTile
          icon={BookOpen}
          label={t("overview.statSources")}
          value={readySources}
          hint={t("overview.statSourcesHint")}
          tint="bg-[#fff6cc] text-[#8a6d00]"
        />
        <StatTile
          icon={Users}
          label={t("overview.statTeam")}
          value={members}
          hint={t("overview.ofMax", { max: workspace.plan.maxAgents })}
          max={workspace.plan.maxAgents}
          warn={false}
          tint="bg-[#f1ebff] text-[#6b3fd4]"
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

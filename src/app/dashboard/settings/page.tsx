import { BellRing, Building2, CreditCard, type LucideIcon } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { Meter } from "@/components/meter";
import { OnboardingForm } from "@/components/onboarding-form";
import { PageHero } from "@/components/page-hero";
import { NotificationForm } from "@/components/settings/notification-form";
import { PlanPicker } from "@/components/settings/plan-picker";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DEFAULT_WORKING_HOURS, type WorkingHours } from "@/lib/validation";
import { requireWorkspace } from "@/server/auth/session";
import { freePlanChangeAllowed, listPlans } from "@/server/billing";
import { emailConfigured } from "@/server/email/mailer";
import { knowledgePagesUsed } from "@/server/knowledge";
import { getAiMessagesUsed } from "@/server/limits/usage";

export const metadata = { title: "Settings" };

function SectionHeader({ icon: Icon, title, description, color }: { icon: LucideIcon; title: string; description: string; color: string }) {
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

/** Settings: business profile and hours, email notifications, plan and usage. */
export default async function SettingsPage() {
  const { db, workspace, role } = await requireWorkspace();
  const t = await getTranslations();
  const canEdit = role === "owner";

  const [notifications, plans, messagesUsed, pagesUsed, members] = await Promise.all([
    db.notificationSettings.findFirst(),
    listPlans(),
    getAiMessagesUsed(db),
    knowledgePagesUsed(db),
    db.membership.count(),
  ]);
  const usage = [
    { label: t("overview.usageMessages"), value: messagesUsed, max: workspace.plan.monthlyMessages, warn: true },
    { label: t("overview.usagePages"), value: pagesUsed, max: workspace.plan.maxKnowledgePages, warn: true },
    { label: t("overview.usageTeam"), value: members, max: workspace.plan.maxAgents, warn: false },
  ];

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-6">
      <PageHero title={t("settings.title")} subtitle={t("settings.subtitle")} />

      <div className="grid items-start gap-6 xl:grid-cols-[minmax(0,1fr)_24rem]">
        <Card>
          <SectionHeader icon={Building2} title={t("settings.profileTitle")} description={t("settings.profileSubtitle")} color="#0066ff" />
          <CardContent>
            <OnboardingForm
              mode="edit"
              disabled={!canEdit}
              initial={{
                name: workspace.name,
                industry: workspace.industry,
                defaultLanguage: workspace.defaultLanguage,
                websiteUrl: workspace.websiteUrl ?? "",
                phone: workspace.phone ?? "",
                whatsapp: workspace.whatsapp ?? "",
                workingHours: { ...DEFAULT_WORKING_HOURS, ...(workspace.workingHours as Partial<WorkingHours> | null) },
              }}
            />
          </CardContent>
        </Card>

        <div className="flex min-w-0 flex-col gap-6">
          <Card>
            <SectionHeader icon={BellRing} title={t("settings.notificationsTitle")} description={t("settings.notificationsSubtitle")} color="#eb6834" />
            <CardContent>
              <NotificationForm
                canEdit={canEdit}
                emailConfigured={emailConfigured()}
                initial={{
                  notifyOnLead: notifications?.notifyOnLead ?? true,
                  notifyOnNeedsHuman: notifications?.notifyOnNeedsHuman ?? true,
                  emails: notifications?.emails ?? [],
                }}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>{t("overview.usageTitle")}</CardTitle>
              <CardDescription>{t("settings.usageSubtitle")}</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
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
      </div>

      <Card>
        <SectionHeader icon={CreditCard} title={t("settings.planTitle")} description={t("settings.planSubtitle")} color="#7c4dff" />
        <CardContent>
          <PlanPicker plans={plans} currentId={workspace.planId} canSwitch={canEdit && freePlanChangeAllowed()} />
        </CardContent>
      </Card>
    </div>
  );
}

import { getTranslations } from "next-intl/server";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { requireWorkspace } from "@/server/auth/session";

export const metadata = { title: "Overview" };

/** Overview page. Phase 1 shows the business profile; analytics arrive in phase 6. */
export default async function OverviewPage() {
  const { user, workspace } = await requireWorkspace();
  const t = await getTranslations();
  const notSet = <span className="text-muted-foreground">{t("overview.notSet")}</span>;

  const rows: [string, React.ReactNode][] = [
    [t("onboarding.industry"), t(`onboarding.industries.${workspace.industry}`)],
    [t("onboarding.defaultLanguage"), t(`onboarding.languages.${workspace.defaultLanguage}`)],
    [t("onboarding.websiteUrl"), workspace.websiteUrl ? <span dir="ltr">{workspace.websiteUrl}</span> : notSet],
    [t("onboarding.phone"), workspace.phone ? <span dir="ltr">{workspace.phone}</span> : notSet],
    [t("onboarding.whatsapp"), workspace.whatsapp ? <span dir="ltr">{workspace.whatsapp}</span> : notSet],
    [t("overview.embedKey"), <code key="k" dir="ltr" className="text-xs break-all">{workspace.publicKey}</code>],
  ];

  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold">{t("overview.welcome", { name: user.name ?? user.email })}</h1>
        <p className="mt-1 text-muted-foreground">{t("overview.ready", { business: workspace.name })}</p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>{t("overview.profile")}</CardTitle>
            <CardDescription>{workspace.name}</CardDescription>
          </CardHeader>
          <CardContent>
            <dl className="grid gap-3 text-sm sm:grid-cols-[10rem_1fr]">
              {rows.map(([label, value]) => (
                <div key={label} className="contents">
                  <dt className="text-muted-foreground">{label}</dt>
                  <dd className="min-w-0">{value}</dd>
                </div>
              ))}
            </dl>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t("overview.plan")}</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-3 text-sm">
            <Badge variant="secondary" className="w-fit">
              {workspace.plan.name}
            </Badge>
            <p className="text-muted-foreground">
              {t("overview.planLimits", {
                messages: workspace.plan.monthlyMessages,
                pages: workspace.plan.maxKnowledgePages,
                agents: workspace.plan.maxAgents,
              })}
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

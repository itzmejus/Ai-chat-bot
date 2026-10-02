import { getTranslations } from "next-intl/server";
import { AssistantSettingsForm } from "@/components/assistant/settings-form";
import { TestChat } from "@/components/assistant/test-chat";
import { AddSource } from "@/components/knowledge/add-source";
import { SourcesTable } from "@/components/knowledge/sources-table";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { requireWorkspace } from "@/server/auth/session";
import { getNotes, knowledgePagesUsed, listSources, MAX_CRAWL_PAGES } from "@/server/knowledge";

export const metadata = { title: "Knowledge base" };

/** Knowledge base: add sources, watch their status, tune the assistant and test it. */
export default async function KnowledgePage() {
  const { workspace, db, role } = await requireWorkspace();
  const t = await getTranslations();
  const [sources, notes, used, settings] = await Promise.all([
    listSources(db),
    getNotes(db),
    knowledgePagesUsed(db),
    db.assistantSettings.findFirst(),
  ]);
  const alreadyCrawled = sources.some((s) => s.type === "url");
  const assistant = {
    assistantName: settings?.assistantName ?? "Assistant",
    greeting: settings?.greeting ?? "",
    tone: settings?.tone ?? ("friendly" as const),
    extraInstructions: settings?.extraInstructions ?? "",
  };

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">{t("knowledge.title")}</h1>
        <p className="mt-1 text-muted-foreground">{t("knowledge.subtitle")}</p>
        <p className="mt-2 text-sm text-muted-foreground">
          {t("knowledge.usage", { used, max: workspace.plan.maxKnowledgePages })}
        </p>
      </div>

      <div className="grid items-start gap-6 xl:grid-cols-[minmax(0,1fr)_24rem]">
        <div className="flex min-w-0 flex-col gap-6">
          <Card>
            <CardHeader>
              <CardTitle>{t("knowledge.addTitle")}</CardTitle>
            </CardHeader>
            <CardContent>
              <AddSource
                // Suggest the business's own website until it has been added once.
                defaultUrl={alreadyCrawled ? "" : (workspace.websiteUrl ?? "")}
                notes={notes}
                maxCrawlPages={Math.min(MAX_CRAWL_PAGES, workspace.plan.maxKnowledgePages)}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>{t("knowledge.sourcesTitle")}</CardTitle>
            </CardHeader>
            <CardContent>
              <SourcesTable sources={sources} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>{t("assistant.settingsTitle")}</CardTitle>
              <CardDescription>{t("assistant.settingsSubtitle")}</CardDescription>
            </CardHeader>
            <CardContent>
              <AssistantSettingsForm initial={assistant} canEdit={role === "owner"} />
            </CardContent>
          </Card>
        </div>

        {/* Stays in view on wide screens while sources are edited. */}
        <Card className="xl:sticky xl:top-8">
          <CardHeader>
            <CardTitle>{t("assistant.testTitle")}</CardTitle>
            <CardDescription>{t("assistant.testSubtitle")}</CardDescription>
          </CardHeader>
          <CardContent>
            <TestChat assistantName={assistant.assistantName} greeting={assistant.greeting} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

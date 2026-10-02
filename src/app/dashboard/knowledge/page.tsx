import { getTranslations } from "next-intl/server";
import { AddSource } from "@/components/knowledge/add-source";
import { SourcesTable } from "@/components/knowledge/sources-table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { requireWorkspace } from "@/server/auth/session";
import { getNotes, knowledgePagesUsed, listSources, MAX_CRAWL_PAGES } from "@/server/knowledge";

export const metadata = { title: "Knowledge base" };

/** Knowledge base: add sources and watch their processing status. */
export default async function KnowledgePage() {
  const { workspace, db } = await requireWorkspace();
  const t = await getTranslations("knowledge");
  const [sources, notes, used] = await Promise.all([listSources(db), getNotes(db), knowledgePagesUsed(db)]);
  const alreadyCrawled = sources.some((s) => s.type === "url");

  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold">{t("title")}</h1>
        <p className="mt-1 text-muted-foreground">{t("subtitle")}</p>
        <p className="mt-2 text-sm text-muted-foreground">{t("usage", { used, max: workspace.plan.maxKnowledgePages })}</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t("addTitle")}</CardTitle>
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
          <CardTitle>{t("sourcesTitle")}</CardTitle>
        </CardHeader>
        <CardContent>
          <SourcesTable sources={sources} />
        </CardContent>
      </Card>
    </div>
  );
}

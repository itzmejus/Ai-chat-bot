import { Bot, Database, PlusCircle, SlidersHorizontal, type LucideIcon } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { AssistantSettingsForm } from "@/components/assistant/settings-form";
import { TestChat } from "@/components/assistant/test-chat";
import { DotPattern, KnowledgeScene } from "@/components/illustrations";
import { AddSource } from "@/components/knowledge/add-source";
import { SourcesTable } from "@/components/knowledge/sources-table";
import { Meter } from "@/components/meter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { requireWorkspace } from "@/server/auth/session";
import { getNotes, knowledgePagesUsed, listSources, MAX_CRAWL_PAGES } from "@/server/knowledge";

export const metadata = { title: "Knowledge base" };

/** Card header with a tinted icon badge beside the title. */
function SectionHeader({ icon: Icon, title, description, color }: { icon: LucideIcon; title: string; description?: string; color: string }) {
  return (
    <CardHeader>
      <div className="flex items-center gap-3">
        <span
          className="flex size-10 shrink-0 items-center justify-center rounded-xl"
          style={{ color, backgroundColor: `color-mix(in oklab, ${color} 13%, white)` }}
        >
          <Icon className="size-5" />
        </span>
        <div className="min-w-0">
          <CardTitle>{title}</CardTitle>
          {description && <CardDescription>{description}</CardDescription>}
        </div>
      </div>
    </CardHeader>
  );
}

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
  const ready = sources.filter((s) => s.status === "ready").length;
  const processing = sources.filter((s) => s.status === "processing").length;
  const maxPages = workspace.plan.maxKnowledgePages;
  const assistant = {
    assistantName: settings?.assistantName ?? "Assistant",
    greeting: settings?.greeting ?? "",
    tone: settings?.tone ?? ("friendly" as const),
    extraInstructions: settings?.extraInstructions ?? "",
  };

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-6">
      {/* Banner with the headline figures */}
      <section className="hero-surface relative overflow-hidden rounded-3xl p-5 text-white shadow-xl sm:p-8">
        <DotPattern className="text-white/10" />
        <KnowledgeScene className="pointer-events-none absolute -end-36 -top-2 w-64 opacity-25 sm:-end-4 sm:top-1/2 sm:w-80 sm:-translate-y-1/2 sm:opacity-100 lg:end-8" />

        <div className="relative max-w-[85%] sm:max-w-md lg:max-w-xl">
          <h1 className="text-[26px] leading-tight font-bold tracking-tight sm:text-4xl">{t("knowledge.title")}</h1>
          <p className="mt-2 text-sm text-white/65 sm:text-base">{t("knowledge.subtitle")}</p>
        </div>

        <dl className="relative mt-6 grid max-w-xl grid-cols-3 gap-2.5 sm:mt-8 sm:gap-3">
          <div className="rounded-2xl bg-white/[0.08] p-3 ring-1 ring-white/10 backdrop-blur sm:p-4">
            <dt className="text-xs text-white/60">{t("knowledge.heroPages")}</dt>
            <dd className="mt-1 flex items-baseline gap-1">
              <span className="text-2xl font-bold tabular-nums">{used}</span>
              <span className="text-xs text-white/55">{t("overview.ofMax", { max: maxPages })}</span>
            </dd>
            <Meter value={used} max={maxPages} tone="dark" className="mt-2" />
          </div>
          <div className="rounded-2xl bg-white/[0.08] p-3 ring-1 ring-white/10 backdrop-blur sm:p-4">
            <dt className="text-xs text-white/60">{t("knowledge.heroSources")}</dt>
            <dd className="mt-1 text-2xl font-bold tabular-nums">{ready}</dd>
          </div>
          <div className="rounded-2xl bg-white/[0.08] p-3 ring-1 ring-white/10 backdrop-blur sm:p-4">
            <dt className="text-xs text-white/60">{t("knowledge.heroProcessing")}</dt>
            <dd className="mt-1 flex items-center gap-2 text-2xl font-bold tabular-nums">
              {processing}
              {processing > 0 && <span className="size-2 animate-pulse rounded-full bg-[#ffd000]" />}
            </dd>
          </div>
        </dl>
      </section>

      <div className="grid items-start gap-6 xl:grid-cols-[minmax(0,1fr)_24rem]">
        <div className="flex min-w-0 flex-col gap-6">
          <Card>
            <SectionHeader icon={PlusCircle} title={t("knowledge.addTitle")} description={t("knowledge.addSubtitle")} color="#0066ff" />
            <CardContent>
              <AddSource
                // Suggest the business's own website until it has been added once.
                defaultUrl={alreadyCrawled ? "" : (workspace.websiteUrl ?? "")}
                notes={notes}
                maxCrawlPages={Math.min(MAX_CRAWL_PAGES, maxPages)}
              />
            </CardContent>
          </Card>

          <Card>
            <SectionHeader icon={Database} title={t("knowledge.sourcesTitle")} description={t("knowledge.sourcesSubtitle")} color="#00a04a" />
            <CardContent>
              <SourcesTable sources={sources} />
            </CardContent>
          </Card>

          <Card>
            <SectionHeader
              icon={SlidersHorizontal}
              title={t("assistant.settingsTitle")}
              description={t("assistant.settingsSubtitle")}
              color="#7c4dff"
            />
            <CardContent>
              <AssistantSettingsForm initial={assistant} canEdit={role === "owner"} />
            </CardContent>
          </Card>
        </div>

        {/* Stays in view on wide screens while sources are edited. */}
        <Card className="xl:sticky xl:top-24">
          <SectionHeader icon={Bot} title={t("assistant.testTitle")} description={t("assistant.testSubtitle")} color="#c99700" />
          <CardContent>
            <TestChat assistantName={assistant.assistantName} greeting={assistant.greeting} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

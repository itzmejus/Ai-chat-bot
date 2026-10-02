"use client";

import { FileText, Globe, Loader2, MessageCircleQuestion, NotebookPen, RefreshCw, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useFormatter, useTranslations } from "next-intl";
import { useEffect, useTransition } from "react";
import { DocsScene } from "@/components/illustrations";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { deleteSourceAction, resyncSourceAction } from "@/server/actions/knowledge";

export type SourceRow = {
  id: string;
  type: "url" | "file" | "faq" | "notes";
  title: string;
  url: string | null;
  status: "processing" | "ready" | "failed";
  error: string | null;
  pageCount: number;
  lastSyncedAt: Date | null;
};

const TYPE_ICONS = { url: Globe, file: FileText, faq: MessageCircleQuestion, notes: NotebookPen } as const;

function SourceActions({ source }: { source: SourceRow }) {
  const t = useTranslations("knowledge");
  const [pending, startTransition] = useTransition();
  return (
    <div className="flex shrink-0 justify-end gap-1">
      <Button
        variant="ghost"
        size="icon-sm"
        title={t("resync")}
        aria-label={t("resync")}
        disabled={pending || source.status === "processing"}
        onClick={() => startTransition(() => resyncSourceAction(source.id))}
      >
        <RefreshCw />
      </Button>
      <Button
        variant="ghost"
        size="icon-sm"
        title={t("delete")}
        aria-label={t("delete")}
        disabled={pending}
        onClick={() => {
          if (window.confirm(t("confirmDelete"))) startTransition(() => deleteSourceAction(source.id));
        }}
      >
        <Trash2 className="text-destructive" />
      </Button>
    </div>
  );
}

function StatusPill({ status }: { status: SourceRow["status"] }) {
  const t = useTranslations("knowledge");
  return (
    <span
      className={cn(
        "inline-flex h-6 items-center gap-1.5 rounded-full px-2.5 text-xs font-medium whitespace-nowrap",
        status === "ready" && "bg-[#e7f8ee] text-success",
        status === "failed" && "bg-destructive/10 text-destructive",
        status === "processing" && "bg-accent text-accent-foreground",
      )}
    >
      {status === "processing" ? <Loader2 className="size-3 animate-spin" /> : <span className="size-1.5 rounded-full bg-current" />}
      {t(`status.${status}`)}
    </span>
  );
}

/** Icon, title and type (or the failure reason) of one source. */
function SourceIdentity({ source }: { source: SourceRow }) {
  const t = useTranslations("knowledge");
  const Icon = TYPE_ICONS[source.type];
  return (
    <div className="flex min-w-0 items-center gap-3">
      <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-accent to-white text-primary ring-1 ring-primary/10">
        <Icon className="size-4" />
      </span>
      <div className="min-w-0">
        {/* React escapes this text, so crawled or uploaded titles cannot inject markup. */}
        <p className="truncate font-medium" dir="auto" title={source.title}>
          {source.type === "notes" ? t("types.notes") : source.title}
        </p>
        {source.status === "failed" && source.error ? (
          <p className="text-xs text-destructive">{t(`errors.${source.error}`)}</p>
        ) : (
          <p className="text-xs text-muted-foreground">{t(`types.${source.type}`)}</p>
        )}
      </div>
    </div>
  );
}

export function SourcesTable({ sources }: { sources: SourceRow[] }) {
  const t = useTranslations("knowledge");
  const format = useFormatter();
  const router = useRouter();

  // While anything is processing, re-fetch the list every few seconds.
  const processing = sources.some((s) => s.status === "processing");
  useEffect(() => {
    if (!processing) return;
    const timer = setInterval(() => router.refresh(), 3000);
    return () => clearInterval(timer);
  }, [processing, router]);

  if (sources.length === 0) {
    return (
      <div className="flex flex-col items-center gap-2 rounded-xl border border-dashed bg-background/60 px-4 py-8 text-center">
        <DocsScene className="w-40" />
        <p className="max-w-xs text-sm text-muted-foreground">{t("empty")}</p>
      </div>
    );
  }

  const synced = (source: SourceRow) =>
    source.lastSyncedAt ? format.dateTime(source.lastSyncedAt, { dateStyle: "medium", timeStyle: "short" }) : t("never");
  const th = "px-3 py-2.5 text-start text-xs font-medium tracking-wide text-muted-foreground uppercase first:ps-4";

  return (
    <>
      {/* Phones: one card per source */}
      <ul className="flex flex-col gap-2.5 md:hidden">
        {sources.map((source) => (
          <li key={source.id} className="rounded-xl border border-border/70 bg-background p-3">
            <div className="flex items-center justify-between gap-2">
              <SourceIdentity source={source} />
              <SourceActions source={source} />
            </div>
            <div className="mt-3 flex items-center justify-between gap-2 border-t border-border/70 pt-2.5 text-xs text-muted-foreground">
              <StatusPill status={source.status} />
              <span className="truncate">{synced(source)}</span>
            </div>
          </li>
        ))}
      </ul>

      {/* Larger screens: table */}
      <div className="hidden overflow-x-auto rounded-xl border border-border/70 bg-background md:block">
        <table className="w-full text-sm">
          <thead className="bg-muted/60">
            <tr>
              <th className={th}>{t("colSource")}</th>
              <th className={th}>{t("colStatus")}</th>
              <th className={th}>{t("colPages")}</th>
              <th className={th}>{t("colSynced")}</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {sources.map((source) => (
              <tr key={source.id} className="border-t border-border/70 transition-colors hover:bg-muted/40">
                <td className="max-w-[20rem] py-3 ps-4 pe-3">
                  <SourceIdentity source={source} />
                </td>
                <td className="px-3 py-3">
                  <StatusPill status={source.status} />
                </td>
                <td className="px-3 py-3 tabular-nums">{source.status === "ready" ? source.pageCount : "–"}</td>
                <td className="px-3 py-3 whitespace-nowrap text-muted-foreground">{synced(source)}</td>
                <td className="py-3 pe-3">
                  <SourceActions source={source} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}

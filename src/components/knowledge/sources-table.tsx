"use client";

import { Loader2, RefreshCw, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useFormatter, useTranslations } from "next-intl";
import { useEffect, useTransition } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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

function SourceActions({ source }: { source: SourceRow }) {
  const t = useTranslations("knowledge");
  const [pending, startTransition] = useTransition();
  return (
    <div className="flex justify-end gap-1">
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

  if (sources.length === 0) return <p className="text-sm text-muted-foreground">{t("empty")}</p>;

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[40rem] text-sm">
        <thead>
          <tr className="border-b text-start text-muted-foreground">
            <th className="py-2 pe-3 text-start font-medium">{t("colSource")}</th>
            <th className="py-2 pe-3 text-start font-medium">{t("colType")}</th>
            <th className="py-2 pe-3 text-start font-medium">{t("colStatus")}</th>
            <th className="py-2 pe-3 text-start font-medium">{t("colPages")}</th>
            <th className="py-2 pe-3 text-start font-medium">{t("colSynced")}</th>
            <th className="py-2" />
          </tr>
        </thead>
        <tbody>
          {sources.map((source) => (
            <tr key={source.id} className="border-b last:border-0">
              <td className="max-w-[18rem] py-2.5 pe-3">
                {/* React escapes this text, so crawled or uploaded titles cannot inject markup. */}
                <p className="truncate font-medium" dir="auto" title={source.title}>
                  {source.type === "notes" ? t("types.notes") : source.title}
                </p>
                {source.status === "failed" && source.error && (
                  <p className="text-destructive">{t(`errors.${source.error}`)}</p>
                )}
              </td>
              <td className="py-2.5 pe-3 whitespace-nowrap">{t(`types.${source.type}`)}</td>
              <td className="py-2.5 pe-3">
                <Badge variant={source.status === "ready" ? "secondary" : source.status === "failed" ? "destructive" : "outline"}>
                  {source.status === "processing" && <Loader2 className="animate-spin" />}
                  {t(`status.${source.status}`)}
                </Badge>
              </td>
              <td className="py-2.5 pe-3 tabular-nums">{source.status === "ready" ? source.pageCount : "–"}</td>
              <td className="py-2.5 pe-3 whitespace-nowrap text-muted-foreground">
                {source.lastSyncedAt ? format.dateTime(source.lastSyncedAt, { dateStyle: "medium", timeStyle: "short" }) : t("never")}
              </td>
              <td className="py-2.5">
                <SourceActions source={source} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

"use client";

import { Download, Mail, MessageSquareText, Phone, Search } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useFormatter, useTranslations } from "next-intl";
import { useEffect, useState, useTransition } from "react";
import { Avatar } from "@/components/brand";
import { InboxScene } from "@/components/illustrations";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { setLeadStatusAction } from "@/server/actions/leads";

type Status = "new" | "contacted" | "converted";
export type LeadRow = {
  id: string;
  name: string | null;
  phone: string | null;
  email: string | null;
  interest: string | null;
  status: Status;
  conversationId: string | null;
  createdAt: Date;
};
type Counts = { all: number; new: number; contacted: number; converted: number };

const STATUSES: Status[] = ["new", "contacted", "converted"];
const STATUS_STYLE: Record<Status, string> = {
  new: "bg-accent text-accent-foreground",
  contacted: "bg-[#fff1d6] text-[#9a5b00]",
  converted: "bg-[#e7f8ee] text-success",
};
const STATUS_DOT: Record<Status | "all", string> = { all: "bg-foreground", new: "bg-primary", contacted: "bg-[#f59e0b]", converted: "bg-[#00c057]" };

/** A select styled as a status pill. Saves as soon as it changes. */
function StatusSelect({ lead }: { lead: LeadRow }) {
  const t = useTranslations("leads");
  const [status, setStatus] = useState(lead.status);
  const [pending, startTransition] = useTransition();

  return (
    <select
      value={status}
      disabled={pending}
      aria-label={t("colStatus")}
      onChange={(e) => {
        const next = e.target.value as Status;
        const previous = status;
        setStatus(next);
        startTransition(async () => {
          const result = await setLeadStatusAction(lead.id, next);
          if (!result.ok) setStatus(previous);
        });
      }}
      className={cn(
        "h-8 cursor-pointer rounded-full border-0 ps-3 pe-7 text-xs font-semibold outline-none focus-visible:ring-4 focus-visible:ring-ring/20 disabled:opacity-60",
        STATUS_STYLE[status],
      )}
    >
      {STATUSES.map((s) => (
        <option key={s} value={s} className="bg-background text-foreground">
          {t(`status.${s}`)}
        </option>
      ))}
    </select>
  );
}

/** Leads list: status tabs, search, CSV export; a table on wide screens and cards on phones. */
export function LeadsTable({ leads, counts, status, search }: { leads: LeadRow[]; counts: Counts; status: Status | "all"; search: string }) {
  const t = useTranslations("leads");
  const format = useFormatter();
  const router = useRouter();
  const pathname = usePathname();
  const [query, setQuery] = useState(search);

  const href = (nextStatus: Status | "all", q: string) => {
    const params = new URLSearchParams();
    if (nextStatus !== "all") params.set("status", nextStatus);
    if (q) params.set("q", q);
    const qs = params.toString();
    return qs ? `${pathname}?${qs}` : pathname;
  };

  // Search as you type (debounced); the filter lives in the URL so it survives a refresh.
  useEffect(() => {
    if (query.trim() === search) return;
    const timer = setTimeout(() => router.replace(href(status, query.trim())), 350);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- href only depends on values listed here
  }, [query, search, status, router]);

  const exportParams = new URLSearchParams();
  if (status !== "all") exportParams.set("status", status);
  if (search) exportParams.set("q", search);
  const label = (lead: LeadRow) => lead.name ?? lead.phone ?? lead.email ?? "–";
  const date = (d: Date) => format.dateTime(d, { dateStyle: "medium", timeStyle: "short" });

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div role="tablist" className="grid grid-cols-2 gap-1.5 sm:flex">
          {(["all", ...STATUSES] as const).map((s) => (
            <Link
              key={s}
              role="tab"
              aria-selected={status === s}
              href={href(s, search)}
              className={cn(
                "flex h-9 min-w-0 items-center gap-2 rounded-xl border px-3 text-[13px] font-medium transition-colors",
                status === s
                  ? "border-foreground bg-foreground text-background shadow-sm"
                  : "border-border/80 bg-background text-muted-foreground hover:border-foreground/30 hover:text-foreground",
              )}
            >
              <span className={cn("size-2 shrink-0 rounded-full", status === s && s === "all" ? "bg-background" : STATUS_DOT[s])} />
              <span className="min-w-0 flex-1 truncate">{s === "all" ? t("all") : t(`status.${s}`)}</span>
              <span className={cn("shrink-0 rounded-full px-1.5 text-[11px] tabular-nums", status === s ? "bg-white/20" : "bg-muted")}>{counts[s]}</span>
            </Link>
          ))}
        </div>
        <div className="flex gap-2">
          <label className="relative block min-w-0 flex-1 lg:w-64">
            <Search className="pointer-events-none absolute start-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              role="searchbox"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={t("search")}
              aria-label={t("search")}
              dir="auto"
              className="h-9 w-full min-w-0 rounded-full border border-input bg-background ps-10 pe-4 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-4 focus-visible:ring-ring/15"
            />
          </label>
          {/* A plain link: the browser downloads the file the server sends. */}
          <a href={`/api/leads/export?${exportParams}`} className={cn(buttonVariants({ variant: "outline" }), "shrink-0", leads.length === 0 && "pointer-events-none opacity-50")} aria-disabled={leads.length === 0}>
            <Download />
            {t("export")}
          </a>
        </div>
      </div>

      {leads.length === 0 ? (
        <div className="flex flex-col items-center gap-1.5 rounded-xl border border-dashed bg-background/60 px-4 py-10 text-center">
          <InboxScene className="w-44" />
          <p className="text-sm font-semibold">{search || status !== "all" ? t("noResults") : t("empty")}</p>
          {!search && status === "all" && <p className="max-w-sm text-xs text-muted-foreground">{t("emptyHint")}</p>}
        </div>
      ) : (
        <>
          {/* Phones: one card per lead */}
          <ul className="flex flex-col gap-2.5 md:hidden">
            {leads.map((lead) => (
              <li key={lead.id} className="rounded-xl border border-border/70 bg-background p-3.5">
                <div className="flex items-center gap-3">
                  <Avatar name={label(lead)} />
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-semibold" dir="auto">
                      {label(lead)}
                    </p>
                    {lead.interest && (
                      <p className="truncate text-xs text-primary" dir="auto" title={`${t("colInterest")}: ${lead.interest}`}>
                        {t("colInterest")}: {lead.interest}
                      </p>
                    )}
                    <p className="text-xs text-muted-foreground">{date(lead.createdAt)}</p>
                  </div>
                  <StatusSelect lead={lead} />
                </div>
                <div className="mt-3 flex flex-col gap-1.5 border-t border-border/70 pt-3 text-sm">
                  {lead.phone && (
                    <a href={`tel:${lead.phone}`} dir="ltr" className="inline-flex items-center gap-2 self-start hover:text-primary rtl:self-end">
                      <Phone className="size-3.5 text-muted-foreground" />
                      {lead.phone}
                    </a>
                  )}
                  {lead.email && (
                    <a href={`mailto:${lead.email}`} dir="ltr" className="inline-flex min-w-0 items-center gap-2 self-start hover:text-primary rtl:self-end">
                      <Mail className="size-3.5 shrink-0 text-muted-foreground" />
                      <span className="truncate">{lead.email}</span>
                    </a>
                  )}
                  {lead.conversationId && (
                    <Link href={`/dashboard/inbox?c=${lead.conversationId}`} className="inline-flex items-center gap-2 font-medium text-primary">
                      <MessageSquareText className="size-3.5" />
                      {t("viewChat")}
                    </Link>
                  )}
                </div>
              </li>
            ))}
          </ul>

          {/* Larger screens: table */}
          <div className="hidden overflow-hidden rounded-xl border border-border/70 bg-background md:block">
            <table className="w-full table-fixed text-sm">
              <thead className="bg-muted/60">
                <tr className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
                  <th className="w-[26%] py-2.5 ps-4 pe-3 text-start font-medium">{t("colName")}</th>
                  <th className="w-[18%] px-3 py-2.5 text-start font-medium">{t("colPhone")}</th>
                  <th className="px-3 py-2.5 text-start font-medium">{t("colEmail")}</th>
                  <th className="w-[17%] px-3 py-2.5 text-start font-medium">{t("colDate")}</th>
                  <th className="w-[13%] px-3 py-2.5 text-start font-medium">{t("colStatus")}</th>
                  <th className="w-[9%] py-2.5 ps-3 pe-4 text-end font-medium">{t("colChat")}</th>
                </tr>
              </thead>
              <tbody>
                {leads.map((lead) => (
                  <tr key={lead.id} className="border-t border-border/70 transition-colors hover:bg-muted/40">
                    <td className="py-3 ps-4 pe-3">
                      <div className="flex min-w-0 items-center gap-3">
                        <Avatar name={label(lead)} />
                        {/* React escapes this text, so a visitor-supplied name cannot inject markup. */}
                        <span className="flex min-w-0 flex-col">
                          <span className="truncate font-medium" dir="auto" title={lead.name ?? undefined}>
                            {lead.name ?? <span className="text-muted-foreground">–</span>}
                          </span>
                          {lead.interest && (
                            <span className="truncate text-xs text-primary" dir="auto" title={`${t("colInterest")}: ${lead.interest}`}>
                              {t("colInterest")}: {lead.interest}
                            </span>
                          )}
                        </span>
                      </div>
                    </td>
                    <td className="truncate px-3 py-3">
                      {lead.phone ? (
                        <a href={`tel:${lead.phone}`} dir="ltr" className="hover:text-primary">
                          {lead.phone}
                        </a>
                      ) : (
                        <span className="text-muted-foreground">–</span>
                      )}
                    </td>
                    <td className="truncate px-3 py-3">
                      {lead.email ? (
                        <a href={`mailto:${lead.email}`} dir="ltr" className="hover:text-primary" title={lead.email}>
                          {lead.email}
                        </a>
                      ) : (
                        <span className="text-muted-foreground">–</span>
                      )}
                    </td>
                    <td className="truncate px-3 py-3 text-muted-foreground">{date(lead.createdAt)}</td>
                    <td className="px-3 py-3">
                      <StatusSelect lead={lead} />
                    </td>
                    <td className="py-3 ps-3 pe-4 text-end">
                      {lead.conversationId ? (
                        <Link
                          href={`/dashboard/inbox?c=${lead.conversationId}`}
                          title={t("viewChat")}
                          aria-label={t("viewChat")}
                          className={buttonVariants({ variant: "ghost", size: "icon-sm" })}
                        >
                          <MessageSquareText className="text-primary" />
                        </Link>
                      ) : (
                        <span className="text-muted-foreground">–</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}

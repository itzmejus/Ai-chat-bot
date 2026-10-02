import { CircleCheckBig, PhoneCall, Sparkles, type LucideIcon } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { DotPattern } from "@/components/illustrations";
import { LeadsTable } from "@/components/leads/leads-table";
import { Card, CardContent } from "@/components/ui/card";
import { requireWorkspace } from "@/server/auth/session";
import { LEAD_STATUSES, leadCounts, listLeads, type LeadStatus } from "@/server/leads";

export const metadata = { title: "Leads" };

function HeroStat({ icon: Icon, label, value }: { icon: LucideIcon; label: string; value: number }) {
  return (
    <div className="flex min-w-0 items-center gap-2.5 rounded-2xl bg-white/[0.08] px-3 py-2 ring-1 ring-white/10 backdrop-blur sm:px-3.5 sm:py-2.5">
      <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-white/10">
        <Icon className="size-4" />
      </span>
      <div className="min-w-0 leading-tight">
        <p className="text-lg font-bold">{value}</p>
        <p className="truncate text-[11px] text-white/60">{label}</p>
      </div>
    </div>
  );
}

/** Leads: contact details captured by the assistant or the pre-chat form. */
export default async function LeadsPage({ searchParams }: PageProps<"/dashboard/leads">) {
  const { db } = await requireWorkspace();
  const t = await getTranslations("leads");
  const params = await searchParams;

  const requested = typeof params.status === "string" ? params.status : "";
  const status = (LEAD_STATUSES as readonly string[]).includes(requested) ? (requested as LeadStatus) : undefined;
  const search = typeof params.q === "string" ? params.q.slice(0, 100) : "";

  const [leads, counts] = await Promise.all([listLeads(db, { status, search }), leadCounts(db)]);

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-6">
      <section className="hero-surface relative overflow-hidden rounded-3xl p-5 text-white shadow-xl sm:p-8">
        <DotPattern className="text-white/10" />
        <div className="relative flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-xl">
            <h1 className="text-[26px] leading-tight font-bold tracking-tight sm:text-4xl">{t("title")}</h1>
            <p className="mt-2 text-sm text-white/65 sm:text-base">{t("subtitle")}</p>
          </div>
          <div className="grid grid-cols-3 gap-2 sm:gap-2.5 lg:w-[28rem] lg:shrink-0">
            <HeroStat icon={Sparkles} label={t("status.new")} value={counts.new} />
            <HeroStat icon={PhoneCall} label={t("status.contacted")} value={counts.contacted} />
            <HeroStat icon={CircleCheckBig} label={t("status.converted")} value={counts.converted} />
          </div>
        </div>
      </section>

      <Card>
        <CardContent>
          <LeadsTable key={status ?? "all"} leads={leads} counts={counts} status={status ?? "all"} search={search} />
        </CardContent>
      </Card>
    </div>
  );
}

import Link from "next/link";
import { fmtDate, fmtNumber, pageParam, Pagination, Pill, SearchForm, Table, Td, textParam } from "@/components/admin/admin-ui";
import { cn } from "@/lib/utils";
import { requireAdmin } from "@/server/admin/access";
import { adminWorkspaces, PAGE_SIZE, type WorkspaceFilter } from "@/server/admin/data";

export const metadata = { title: "Workspaces" };

const FILTERS: { id: WorkspaceFilter; label: string }[] = [
  { id: "all", label: "All" },
  { id: "paying", label: "Paying" },
  { id: "free", label: "Free" },
  { id: "issues", label: "Payment problems" },
];

export default async function AdminWorkspacesPage({ searchParams }: PageProps<"/admin/workspaces">) {
  await requireAdmin();
  const params = await searchParams;
  const q = textParam(params.q);
  const page = pageParam(params.page);
  const filter = FILTERS.find((f) => f.id === textParam(params.filter))?.id ?? "all";
  const { total, rows } = await adminWorkspaces({ q, filter, page });
  const href = (p: number, f = filter) => `/admin/workspaces?${new URLSearchParams({ ...(q && { q }), ...(f !== "all" && { filter: f }), page: String(p) })}`;

  return (
    <>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Workspaces</h1>
          <p className="text-sm text-muted-foreground">Every business on the service, its plan and subscription.</p>
        </div>
        <SearchForm q={q} placeholder="Name, website or owner email" hidden={filter !== "all" ? { filter } : undefined} />
      </div>

      <div className="flex flex-wrap gap-2">
        {FILTERS.map((f) => (
          <Link
            key={f.id}
            href={href(1, f.id)}
            className={cn("rounded-full border px-3 py-1 text-sm", f.id === filter ? "border-primary bg-primary text-primary-foreground" : "bg-background")}
          >
            {f.label}
          </Link>
        ))}
      </div>

      <Table head={["Workspace", "Owner", "Plan", "Subscription", "AI messages", "Team", "Sources", "Chats", "Leads", "Created"]} empty={rows.length === 0}>
        {rows.map((ws) => (
          <tr key={ws.id}>
            <Td>
              <p className="font-medium">{ws.name}</p>
              <p className="text-xs text-muted-foreground">
                {ws.industry}
                {ws.websiteUrl && (
                  <>
                    {" · "}
                    <a href={ws.websiteUrl} target="_blank" rel="noreferrer" className="hover:underline">
                      {ws.websiteUrl.replace(/^https?:\/\//, "")}
                    </a>
                  </>
                )}
              </p>
            </Td>
            <Td className="text-xs">{ws.ownerEmail ?? "—"}</Td>
            <Td>{ws.plan.name}</Td>
            <Td>
              {ws.billingStatus ? (
                <div className="flex flex-col items-start gap-1">
                  <Pill value={ws.cancelAtPeriodEnd && ws.billingStatus === "active" ? "cancelling" : ws.billingStatus} />
                  {ws.billingPeriodEnd && <span className="text-xs text-muted-foreground">{ws.cancelAtPeriodEnd ? "ends" : "renews"} {fmtDate(ws.billingPeriodEnd)}</span>}
                </div>
              ) : (
                <span className="text-muted-foreground">—</span>
              )}
            </Td>
            <Td className="whitespace-nowrap tabular-nums">
              {fmtNumber(ws.aiMessages)} <span className="text-xs text-muted-foreground">/ {fmtNumber(ws.plan.monthlyMessages)}</span>
            </Td>
            <Td className="tabular-nums">{ws._count.memberships}</Td>
            <Td className="tabular-nums">{ws._count.sources}</Td>
            <Td className="tabular-nums">{fmtNumber(ws._count.conversations)}</Td>
            <Td className="tabular-nums">{fmtNumber(ws._count.leads)}</Td>
            <Td className="whitespace-nowrap">{fmtDate(ws.createdAt)}</Td>
          </tr>
        ))}
      </Table>
      <Pagination page={page} total={total} pageSize={PAGE_SIZE} href={(p) => href(p)} />
    </>
  );
}

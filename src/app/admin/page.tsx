import Link from "next/link";
import { fmtDate, fmtEuro, fmtNumber, Pill, SectionTitle, StatCard, Table, Td } from "@/components/admin/admin-ui";
import { Card, CardContent } from "@/components/ui/card";
import { requireAdmin } from "@/server/admin/access";
import { adminOverview } from "@/server/admin/data";
import { listPlans } from "@/server/billing";

export const metadata = { title: "Overview" };

export default async function AdminOverviewPage() {
  await requireAdmin();
  const [o, plans] = await Promise.all([adminOverview(), listPlans()]);

  return (
    <>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Users" value={fmtNumber(o.users.total)} hint={`${o.users.last7} new this week · ${o.users.last30} in 30 days`} />
        <StatCard label="Workspaces" value={fmtNumber(o.workspaces.total)} hint={`${o.users.verified} users have confirmed their email`} />
        <StatCard label="Paying workspaces" value={fmtNumber(o.paying.total)} hint={o.paying.cancelling ? `${o.paying.cancelling} cancelling at period end` : "none cancelling"} />
        <StatCard label="Monthly recurring revenue" value={fmtEuro(o.paying.mrr)} hint="list price, before VAT and Dodo's fee" />
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="AI messages this month" value={fmtNumber(o.activity.aiMessagesThisMonth)} hint="all workspaces" />
        <StatCard label="Conversations, 30 days" value={fmtNumber(o.activity.conversations30)} hint="test chats excluded" />
        <StatCard label="Leads, 30 days" value={fmtNumber(o.activity.leads30)} />
      </div>

      <section className="flex flex-col gap-3">
        <SectionTitle>Plans</SectionTitle>
        <Table head={["Plan", "Workspaces", "Paying"]}>
          {plans.map((plan) => (
            <tr key={plan.id}>
              <Td className="font-medium">{plan.name}</Td>
              <Td className="tabular-nums">{fmtNumber(o.workspaces.byPlan[plan.id] ?? 0)}</Td>
              <Td className="tabular-nums">{plan.id === "free" ? "—" : fmtNumber(o.paying.byPlan[plan.id] ?? 0)}</Td>
            </tr>
          ))}
        </Table>
      </section>

      <section className="flex flex-col gap-3">
        <SectionTitle action={<Link href="/admin/workspaces?filter=issues" className="text-sm font-medium text-primary hover:underline">All</Link>}>Payment problems</SectionTitle>
        {o.issues.length === 0 ? (
          <Card>
            <CardContent className="text-sm text-muted-foreground">No subscription has a failed payment.</CardContent>
          </Card>
        ) : (
          <Table head={["Workspace", "Status", "Plan now", "Period ends"]}>
            {o.issues.map((ws) => (
              <tr key={ws.id}>
                <Td className="font-medium">{ws.name}</Td>
                <Td><Pill value={ws.billingStatus ?? ""} /></Td>
                <Td>{ws.planId}</Td>
                <Td>{fmtDate(ws.billingPeriodEnd)}</Td>
              </tr>
            ))}
          </Table>
        )}
      </section>

      <section className="flex flex-col gap-3">
        <SectionTitle action={<Link href="/admin/users" className="text-sm font-medium text-primary hover:underline">All users</Link>}>Latest sign-ups</SectionTitle>
        <Table head={["User", "Workspace", "Email confirmed", "Joined"]} empty={o.recentUsers.length === 0}>
          {o.recentUsers.map((user) => (
            <tr key={user.id}>
              <Td>
                <p className="font-medium">{user.name ?? "—"}</p>
                <p className="text-xs text-muted-foreground">{user.email}</p>
              </Td>
              <Td>{user.memberships.map((m) => m.workspace.name).join(", ") || <span className="text-muted-foreground">none yet</span>}</Td>
              <Td>{user.emailVerifiedAt ? "Yes" : <span className="text-muted-foreground">No</span>}</Td>
              <Td className="whitespace-nowrap">{fmtDate(user.createdAt)}</Td>
            </tr>
          ))}
        </Table>
      </section>
    </>
  );
}

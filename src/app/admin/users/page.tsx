import { fmtDate, pageParam, Pagination, Pill, SearchForm, Table, Td, textParam } from "@/components/admin/admin-ui";
import { requireAdmin } from "@/server/admin/access";
import { adminUsers, PAGE_SIZE } from "@/server/admin/data";

export const metadata = { title: "Users" };

export default async function AdminUsersPage({ searchParams }: PageProps<"/admin/users">) {
  await requireAdmin();
  const params = await searchParams;
  const q = textParam(params.q);
  const page = pageParam(params.page);
  const { total, rows } = await adminUsers({ q, page });
  const href = (p: number) => `/admin/users?${new URLSearchParams({ ...(q && { q }), page: String(p) })}`;

  return (
    <>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Users</h1>
          <p className="text-sm text-muted-foreground">Everyone with an account, newest first.</p>
        </div>
        <SearchForm q={q} placeholder="Email or name" />
      </div>

      <Table head={["User", "Signs in with", "Email confirmed", "Workspaces", "Joined"]} empty={rows.length === 0}>
        {rows.map((user) => (
          <tr key={user.id}>
            <Td>
              <p className="font-medium">{user.name ?? "—"}</p>
              <p className="text-xs text-muted-foreground">{user.email}</p>
            </Td>
            <Td className="capitalize">{user.signIn}</Td>
            <Td>{user.emailVerifiedAt ? fmtDate(user.emailVerifiedAt) : <span className="text-muted-foreground">No</span>}</Td>
            <Td>
              <ul className="flex flex-col gap-1">
                {user.memberships.map((m) => (
                  <li key={m.workspace.id} className="flex flex-wrap items-center gap-1.5">
                    <span>{m.workspace.name}</span>
                    <span className="text-xs text-muted-foreground">
                      {m.role} · {m.workspace.planId}
                    </span>
                    {m.workspace.billingStatus && <Pill value={m.workspace.billingStatus} />}
                  </li>
                ))}
                {user.memberships.length === 0 && <li className="text-muted-foreground">none</li>}
              </ul>
            </Td>
            <Td className="whitespace-nowrap">{fmtDate(user.createdAt)}</Td>
          </tr>
        ))}
      </Table>
      <Pagination page={page} total={total} pageSize={PAGE_SIZE} href={href} />
    </>
  );
}

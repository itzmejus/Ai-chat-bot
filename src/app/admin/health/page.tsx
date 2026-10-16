import Link from "next/link";
import { Pill, Table, Td } from "@/components/admin/admin-ui";
import { Card, CardContent } from "@/components/ui/card";
import { requireAdmin } from "@/server/admin/access";
import { runHealthChecks, serverInfo } from "@/server/admin/health";

export const metadata = { title: "Health" };

const LABEL = { ok: "OK", warn: "Attention", down: "Down", off: "Off" } as const;

/** Runs every check live on each visit; "Check again" simply reloads the page. */
export default async function AdminHealthPage() {
  await requireAdmin();
  const checks = await runHealthChecks();
  const info = serverInfo();
  const worst = checks.some((c) => c.status === "down") ? "down" : checks.some((c) => c.status === "warn") ? "warn" : "ok";

  return (
    <>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold">Health</h1>
          <Pill value={worst}>{worst === "ok" ? "All systems working" : worst === "warn" ? "Needs attention" : "Something is down"}</Pill>
        </div>
        <Link href="/admin/health" prefetch={false} className="rounded-lg border bg-background px-3 py-1.5 text-sm font-medium">
          Check again
        </Link>
      </div>

      <Table head={["Service", "Status", "Details", "Time"]}>
        {checks.map((check) => (
          <tr key={check.name}>
            <Td className="font-medium whitespace-nowrap">{check.name}</Td>
            <Td>
              <Pill value={check.status}>{LABEL[check.status]}</Pill>
            </Td>
            <Td className="text-muted-foreground">{check.detail}</Td>
            <Td className="whitespace-nowrap text-muted-foreground tabular-nums">{check.ms !== undefined ? `${check.ms} ms` : ""}</Td>
          </tr>
        ))}
      </Table>

      <Card>
        <CardContent className="grid gap-3 text-sm sm:grid-cols-5">
          {[
            ["Environment", info.environment],
            ["Node.js", info.node],
            ["Up for", info.uptime],
            ["Memory", info.memory],
            ["Commit", info.commit ?? "—"],
          ].map(([label, value]) => (
            <div key={label}>
              <p className="text-xs text-muted-foreground">{label}</p>
              <p className="font-medium">{value}</p>
            </div>
          ))}
        </CardContent>
      </Card>
    </>
  );
}

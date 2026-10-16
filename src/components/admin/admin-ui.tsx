import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

/** Building blocks shared by the admin pages. The admin area is English only. */

export function StatCard({ label, value, hint }: { label: string; value: React.ReactNode; hint?: React.ReactNode }) {
  return (
    <Card>
      <CardContent className="flex flex-col gap-1">
        <p className="text-sm text-muted-foreground">{label}</p>
        <p className="text-3xl font-bold tracking-tight tabular-nums">{value}</p>
        {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
      </CardContent>
    </Card>
  );
}

const PILL: Record<string, string> = {
  ok: "bg-emerald-100 text-emerald-800",
  active: "bg-emerald-100 text-emerald-800",
  warn: "bg-amber-100 text-amber-800",
  past_due: "bg-amber-100 text-amber-800",
  cancelling: "bg-amber-100 text-amber-800",
  down: "bg-red-100 text-red-800",
  on_hold: "bg-red-100 text-red-800",
  failed: "bg-red-100 text-red-800",
};

/** A small coloured label for a health result or a subscription status. */
export function Pill({ value, children }: { value: string; children?: React.ReactNode }) {
  return <span className={cn("inline-flex rounded-full px-2 py-0.5 text-xs font-semibold whitespace-nowrap", PILL[value] ?? "bg-muted text-muted-foreground")}>{children ?? value.replace("_", " ")}</span>;
}

export function SectionTitle({ children, action }: { children: React.ReactNode; action?: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <h2 className="text-lg font-semibold">{children}</h2>
      {action}
    </div>
  );
}

/** A table that scrolls sideways on narrow screens instead of widening the page. */
export function Table({ head, children, empty }: { head: string[]; children: React.ReactNode; empty?: boolean }) {
  return (
    <Card className="py-0">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="border-b bg-muted/50 text-left text-xs text-muted-foreground uppercase">
            <tr>
              {head.map((h) => (
                <th key={h} className="px-4 py-3 font-medium whitespace-nowrap">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y">{children}</tbody>
        </table>
        {empty && <p className="p-6 text-center text-sm text-muted-foreground">Nothing found.</p>}
      </div>
    </Card>
  );
}

export const Td = ({ children, className }: { children?: React.ReactNode; className?: string }) => <td className={cn("px-4 py-3 align-top", className)}>{children}</td>;

/** Search box that submits as a plain GET, so results are bookmarkable. */
export function SearchForm({ q, placeholder, hidden }: { q: string; placeholder: string; hidden?: Record<string, string> }) {
  return (
    <form className="flex gap-2" role="search">
      {Object.entries(hidden ?? {}).map(([name, value]) => (
        <input key={name} type="hidden" name={name} value={value} />
      ))}
      <input
        name="q"
        defaultValue={q}
        placeholder={placeholder}
        className="h-9 w-full min-w-0 rounded-lg border border-input bg-background px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring sm:w-72"
      />
      <button type="submit" className="h-9 shrink-0 rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground">
        Search
      </button>
    </form>
  );
}

export function Pagination({ page, total, pageSize, href }: { page: number; total: number; pageSize: number; href: (page: number) => string }) {
  const pages = Math.max(1, Math.ceil(total / pageSize));
  if (pages === 1) return <p className="text-xs text-muted-foreground">{total} in total</p>;
  const link = "rounded-lg border px-3 py-1.5 text-sm";
  return (
    <div className="flex items-center gap-3 text-sm">
      {page > 1 ? <Link href={href(page - 1)} className={link}>Previous</Link> : <span className={cn(link, "opacity-40")}>Previous</span>}
      <span className="text-muted-foreground">
        Page {page} of {pages} · {total} in total
      </span>
      {page < pages ? <Link href={href(page + 1)} className={link}>Next</Link> : <span className={cn(link, "opacity-40")}>Next</span>}
    </div>
  );
}

const DATE = new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" });
export const fmtDate = (date: Date | null | undefined) => (date ? DATE.format(date) : "—");
export const fmtNumber = (n: number) => new Intl.NumberFormat("en").format(n);
export const fmtEuro = (n: number) => new Intl.NumberFormat("en", { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format(n);

/** Read a positive page number from the query string. */
export const pageParam = (value: string | string[] | undefined) => Math.max(1, Number.parseInt(String(value ?? "1"), 10) || 1);
export const textParam = (value: string | string[] | undefined) => (Array.isArray(value) ? value[0] : value) ?? "";

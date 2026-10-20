import type { Metadata } from "next";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { AdminNav } from "@/components/admin/admin-nav";
import { Brand } from "@/components/brand";
import { requireAdmin } from "@/server/admin/access";

export const metadata: Metadata = { title: { template: "%s · Admin", default: "Admin" }, robots: { index: false, follow: false } };

/**
 * The admin area: everyone who signed up, every workspace and subscription, and the health of
 * the services the app depends on. Only for the addresses in ADMIN_EMAILS (see requireAdmin).
 */
export default async function AdminLayout({ children }: LayoutProps<"/admin">) {
  const admin = await requireAdmin();

  return (
    <div className="min-h-screen bg-muted" dir="ltr">
      <header className="sticky top-0 z-20 border-b border-border/70 bg-background/95 backdrop-blur">
        <div className="mx-auto flex max-w-7xl flex-col gap-1 px-2 pt-3 sm:px-4 md:px-8">
          <div className="flex items-center justify-between gap-3 px-2 sm:px-0">
            <div className="flex min-w-0 items-center gap-2 sm:gap-3">
              <Brand className="text-base sm:text-lg" />
              <span className="shrink-0 rounded-full bg-sidebar px-2 py-0.5 text-[11px] font-semibold tracking-wide text-sidebar-foreground uppercase">Admin</span>
            </div>
            <div className="flex shrink-0 items-center gap-4 text-sm">
              <span className="hidden max-w-56 truncate text-muted-foreground md:inline">{admin.email}</span>
              <Link href="/dashboard" className="flex items-center gap-1 font-medium text-primary hover:underline">
                <ArrowLeft className="size-4" />
                Dashboard
              </Link>
            </div>
          </div>
          <AdminNav />
        </div>
      </header>
      <main className="mx-auto flex max-w-7xl flex-col gap-6 p-4 md:p-8">{children}</main>
    </div>
  );
}

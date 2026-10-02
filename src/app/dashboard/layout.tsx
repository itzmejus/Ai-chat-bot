import { LogOut } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { Avatar, Brand } from "@/components/brand";
import { SidebarNav } from "@/components/dashboard/sidebar-nav";
import { WorkspaceSwitcher } from "@/components/dashboard/workspace-switcher";
import { LanguageSwitcher } from "@/components/language-switcher";
import { Meter } from "@/components/meter";
import { Button } from "@/components/ui/button";
import { signOutAction } from "@/server/actions/auth";
import { requireWorkspace } from "@/server/auth/session";
import { getAiMessagesUsed } from "@/server/limits/usage";

/**
 * Dashboard shell: dark sidebar, top bar, content canvas.
 * `requireWorkspace()` is the access gate: it redirects to /login or
 * /onboarding, so every page under /dashboard has a verified workspace.
 */
export default async function DashboardLayout({ children }: LayoutProps<"/dashboard">) {
  const { user, workspace, role, memberships, db } = await requireWorkspace();
  const t = await getTranslations();
  const messagesUsed = await getAiMessagesUsed(db);
  const displayName = user.name ?? user.email;

  return (
    <div className="flex min-h-screen bg-muted">
      {/* Sidebar (desktop) */}
      <aside className="sticky top-0 hidden h-screen w-64 shrink-0 flex-col gap-6 bg-sidebar p-4 text-sidebar-foreground md:flex">
        <Brand tone="light" className="px-2 pt-2" />

        <div className="flex flex-1 flex-col gap-2 overflow-y-auto">
          <p className="px-3 text-[11px] font-semibold tracking-wider text-sidebar-foreground/40 uppercase">{t("nav.menu")}</p>
          <SidebarNav />
        </div>

        {/* Monthly usage at a glance */}
        <div className="rounded-xl border border-white/10 bg-white/[0.04] p-4">
          <div className="flex items-center justify-between gap-2">
            <p className="text-sm font-medium">{t("nav.usageTitle")}</p>
            <span className="rounded-full bg-white/10 px-2 py-0.5 text-[11px] font-medium">{workspace.plan.name}</span>
          </div>
          <Meter value={messagesUsed} max={workspace.plan.monthlyMessages} tone="dark" className="mt-3" />
          <p className="mt-2 text-xs text-sidebar-foreground/55">
            {t("nav.usageText", { used: messagesUsed, max: workspace.plan.monthlyMessages })}
          </p>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        {/* Top bar */}
        <header className="sticky top-0 z-20 border-b border-border/70 bg-background/95 backdrop-blur">
          <div className="flex h-16 items-center justify-between gap-3 px-4 md:px-8">
            <div className="flex min-w-0 items-center gap-3">
              <Brand className="md:hidden" />
              <div className="hidden min-w-0 md:block">
                {memberships.length > 1 ? (
                  <WorkspaceSwitcher
                    current={workspace.id}
                    options={memberships.map((m) => ({ id: m.workspaceId, name: m.workspace.name }))}
                  />
                ) : (
                  <p className="truncate text-sm font-semibold" dir="auto">
                    {workspace.name}
                  </p>
                )}
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              <LanguageSwitcher />
              <div className="mx-1 hidden h-6 w-px bg-border sm:block" />
              <div className="hidden items-center gap-2.5 sm:flex">
                <Avatar name={displayName} />
                <div className="min-w-0 leading-tight">
                  <p className="max-w-40 truncate text-sm font-medium">{displayName}</p>
                  <p className="text-xs text-muted-foreground">{t(`roles.${role}`)}</p>
                </div>
              </div>
              <form action={signOutAction}>
                <Button type="submit" variant="ghost" size="icon" title={t("common.signOut")} aria-label={t("common.signOut")}>
                  <LogOut className="rtl:-scale-x-100" />
                </Button>
              </form>
            </div>
          </div>

          {/* Navigation tabs (mobile) */}
          <div className="overflow-x-auto px-1 md:hidden">
            <SidebarNav variant="tabs" />
          </div>
        </header>

        <main className="min-w-0 flex-1 p-4 md:p-8">{children}</main>
      </div>
    </div>
  );
}

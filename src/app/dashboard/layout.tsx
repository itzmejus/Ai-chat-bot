import { LogOut } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { Avatar, Brand } from "@/components/brand";
import { DotPattern } from "@/components/illustrations";
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
      <aside className="sticky top-0 hidden h-screen w-64 shrink-0 flex-col gap-6 overflow-hidden bg-sidebar p-4 text-sidebar-foreground md:flex">
        <DotPattern className="text-white/[0.07]" />
        <Brand tone="light" className="relative px-2 pt-2" />

        <div className="relative flex flex-1 flex-col gap-2 overflow-y-auto">
          <p className="px-3 text-[11px] font-semibold tracking-wider text-sidebar-foreground/40 uppercase">{t("nav.menu")}</p>
          <SidebarNav />
        </div>

        {/* Monthly usage at a glance */}
        <div className="relative rounded-xl border border-white/10 bg-gradient-to-br from-white/[0.09] to-white/[0.02] p-4">
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
          <div className="flex h-14 items-center justify-between gap-3 px-4 md:h-16 md:px-8">
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
              <div className="flex items-center gap-2.5">
                <Avatar name={displayName} className="size-8 md:size-9" />
                <div className="hidden min-w-0 leading-tight sm:block">
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

        </header>

        {/* Extra bottom padding on mobile keeps content clear of the bottom navigation bar. */}
        <main className="min-w-0 flex-1 p-4 pb-28 md:p-8">{children}</main>
        <SidebarNav variant="bottom" />
      </div>
    </div>
  );
}

import { LogOut } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { SidebarNav } from "@/components/dashboard/sidebar-nav";
import { WorkspaceSwitcher } from "@/components/dashboard/workspace-switcher";
import { LanguageSwitcher } from "@/components/language-switcher";
import { Button } from "@/components/ui/button";
import { APP_NAME } from "@/lib/config";
import { signOutAction } from "@/server/actions/auth";
import { requireWorkspace } from "@/server/auth/session";

/**
 * Dashboard shell. `requireWorkspace()` is the access gate: it redirects to
 * /login or /onboarding, so every page under /dashboard has a verified workspace.
 */
export default async function DashboardLayout({ children }: LayoutProps<"/dashboard">) {
  const { user, workspace, role, memberships } = await requireWorkspace();
  const t = await getTranslations();

  return (
    <div className="flex min-h-screen flex-col md:flex-row">
      <aside className="flex shrink-0 flex-col gap-4 border-b bg-muted/40 p-4 md:w-60 md:border-b-0 md:border-e">
        <div>
          <p className="text-lg font-semibold">{APP_NAME}</p>
          {memberships.length > 1 ? (
            <div className="mt-2">
              <WorkspaceSwitcher
                current={workspace.id}
                options={memberships.map((m) => ({ id: m.workspaceId, name: m.workspace.name }))}
              />
            </div>
          ) : (
            <p className="truncate text-sm text-muted-foreground">{workspace.name}</p>
          )}
        </div>

        <div className="overflow-x-auto md:flex-1">
          <SidebarNav />
        </div>

        <div className="flex items-center justify-between gap-2 md:flex-col md:items-stretch">
          <div className="min-w-0 text-sm">
            <p className="truncate font-medium">{user.name ?? user.email}</p>
            <p className="truncate text-muted-foreground">{t(`roles.${role}`)}</p>
          </div>
          <div className="flex items-center gap-1 md:justify-between">
            <LanguageSwitcher />
            <form action={signOutAction}>
              <Button type="submit" variant="ghost" size="sm">
                <LogOut className="rtl:-scale-x-100" />
                {t("common.signOut")}
              </Button>
            </form>
          </div>
        </div>
      </aside>

      <main className="min-w-0 flex-1 p-4 md:p-8">{children}</main>
    </div>
  );
}

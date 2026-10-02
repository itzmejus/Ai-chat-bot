"use client";

import { BookOpen, Inbox, LayoutDashboard, MessageSquareCode, UserPlus, type LucideIcon } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";

/** Dashboard sections. New pages are added here as each build phase lands. */
const NAV: { href: string; key: string; icon: LucideIcon }[] = [
  { href: "/dashboard", key: "overview", icon: LayoutDashboard },
  { href: "/dashboard/inbox", key: "inbox", icon: Inbox },
  { href: "/dashboard/leads", key: "leads", icon: UserPlus },
  { href: "/dashboard/knowledge", key: "knowledge", icon: BookOpen },
  { href: "/dashboard/widget", key: "widget", icon: MessageSquareCode },
];

/**
 * Main navigation. `sidebar` is the vertical list in the dark sidebar (desktop);
 * `bottom` is the app-style bar fixed to the bottom of the screen (mobile).
 */
export function SidebarNav({ variant = "sidebar" }: { variant?: "sidebar" | "bottom" }) {
  const pathname = usePathname();
  const t = useTranslations("nav");
  const isActive = (href: string) => (href === "/dashboard" ? pathname === href : pathname.startsWith(href));

  if (variant === "bottom") {
    return (
      <nav
        aria-label={t("menu")}
        className="fixed inset-x-0 bottom-0 z-30 border-t border-border/70 bg-background/95 pb-[env(safe-area-inset-bottom)] shadow-[0_-4px_24px_rgb(16_24_40/0.06)] backdrop-blur md:hidden"
      >
        <div className="mx-auto flex max-w-md">
          {NAV.map(({ href, key, icon: Icon }) => {
            const active = isActive(href);
            return (
              <Link
                key={href}
                href={href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "flex min-w-0 flex-1 flex-col items-center gap-1 px-1 pt-2 pb-2.5 text-[11px] font-medium transition-colors",
                  active ? "text-primary" : "text-muted-foreground",
                )}
              >
                <span className={cn("flex h-8 w-14 items-center justify-center rounded-full transition-colors", active && "bg-accent")}>
                  <Icon className="size-5" strokeWidth={active ? 2.4 : 2} />
                </span>
                {/* Shorter labels where the full one would not fit under an icon */}
                <span className="max-w-full truncate">{t.has(`short.${key}`) ? t(`short.${key}`) : t(key)}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    );
  }

  return (
    <nav aria-label={t("menu")} className="flex flex-col gap-1">
      {NAV.map(({ href, key, icon: Icon }) => {
        const active = isActive(href);
        return (
          <Link
            key={href}
            href={href}
            aria-current={active ? "page" : undefined}
            className={cn(
              "relative flex h-10 items-center gap-3 rounded-lg px-3 text-sm font-medium whitespace-nowrap transition-colors",
              active ? "bg-white/10 text-white" : "text-sidebar-foreground/60 hover:bg-white/5 hover:text-sidebar-foreground",
            )}
          >
            {/* Accent bar marking the current page */}
            {active && <span className="absolute inset-y-2 start-0 w-[3px] rounded-full bg-primary" aria-hidden />}
            <Icon className={cn("size-[18px]", active && "text-[#5c9dff]")} />
            {t(key)}
          </Link>
        );
      })}
    </nav>
  );
}

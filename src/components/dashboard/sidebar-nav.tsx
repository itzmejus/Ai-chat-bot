"use client";

import { BookOpen, Ellipsis, Inbox, LayoutDashboard, MessageSquareCode, Settings, UserPlus, Users, X, type LucideIcon } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

const NAV: { href: string; key: string; icon: LucideIcon }[] = [
  { href: "/dashboard", key: "overview", icon: LayoutDashboard },
  { href: "/dashboard/inbox", key: "inbox", icon: Inbox },
  { href: "/dashboard/leads", key: "leads", icon: UserPlus },
  { href: "/dashboard/knowledge", key: "knowledge", icon: BookOpen },
  { href: "/dashboard/widget", key: "widget", icon: MessageSquareCode },
  { href: "/dashboard/team", key: "team", icon: Users },
  { href: "/dashboard/settings", key: "settings", icon: Settings },
];
/** How many sections the phone bottom bar shows before "More". */
const BOTTOM_PRIMARY = 4;

/**
 * Main navigation. `sidebar` is the vertical list in the dark sidebar (desktop);
 * `bottom` is the app-style bar fixed to the bottom of the screen (phones), with
 * the less-used sections behind a "More" sheet.
 */
export function SidebarNav({ variant = "sidebar" }: { variant?: "sidebar" | "bottom" }) {
  const pathname = usePathname();
  const t = useTranslations("nav");
  const [moreOpen, setMoreOpen] = useState(false);
  const isActive = (href: string) => (href === "/dashboard" ? pathname === href : pathname.startsWith(href));

  // Close the sheet with Escape.
  useEffect(() => {
    if (!moreOpen) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setMoreOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [moreOpen]);

  if (variant === "bottom") {
    const primary = NAV.slice(0, BOTTOM_PRIMARY);
    const rest = NAV.slice(BOTTOM_PRIMARY);
    const restActive = rest.some((item) => isActive(item.href));
    const itemClass = (active: boolean) =>
      cn("flex min-w-0 flex-1 flex-col items-center gap-1 px-1 pt-2 pb-2.5 text-[11px] font-medium transition-colors", active ? "text-primary" : "text-muted-foreground");
    const pill = (active: boolean) => cn("flex h-8 w-14 items-center justify-center rounded-full transition-colors", active && "bg-accent");

    return (
      <>
        {moreOpen && (
          <div className="fixed inset-0 z-40 md:hidden">
            <button type="button" aria-label={t("closeMenu")} className="absolute inset-0 bg-black/40" onClick={() => setMoreOpen(false)} />
            <div
              role="dialog"
              aria-modal="true"
              aria-label={t("more")}
              className="absolute inset-x-0 bottom-0 rounded-t-3xl bg-background p-4 pb-[calc(1rem+env(safe-area-inset-bottom))] shadow-2xl"
            >
              <div className="mb-3 flex items-center justify-between">
                <p className="text-base font-semibold">{t("more")}</p>
                <button type="button" onClick={() => setMoreOpen(false)} aria-label={t("closeMenu")} className="flex size-9 items-center justify-center rounded-full bg-muted">
                  <X className="size-4" />
                </button>
              </div>
              <ul className="flex flex-col gap-1.5">
                {rest.map(({ href, key, icon: Icon }) => {
                  const active = isActive(href);
                  return (
                    <li key={href}>
                      <Link
                        href={href}
                        onClick={() => setMoreOpen(false)}
                        aria-current={active ? "page" : undefined}
                        className={cn(
                          "flex items-center gap-3 rounded-2xl border p-3.5 text-sm font-medium",
                          active ? "border-primary/30 bg-accent text-accent-foreground" : "border-border/70 bg-background",
                        )}
                      >
                        <span className={cn("flex size-10 items-center justify-center rounded-xl", active ? "bg-primary text-white" : "bg-muted text-muted-foreground")}>
                          <Icon className="size-5" />
                        </span>
                        {t(key)}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          </div>
        )}

        <nav
          aria-label={t("menu")}
          className="fixed inset-x-0 bottom-0 z-30 border-t border-border/70 bg-background/95 pb-[env(safe-area-inset-bottom)] shadow-[0_-4px_24px_rgb(16_24_40/0.06)] backdrop-blur md:hidden"
        >
          <div className="mx-auto flex max-w-md">
            {primary.map(({ href, key, icon: Icon }) => {
              const active = isActive(href);
              return (
                <Link key={href} href={href} aria-current={active ? "page" : undefined} className={itemClass(active)}>
                  <span className={pill(active)}>
                    <Icon className="size-5" strokeWidth={active ? 2.4 : 2} />
                  </span>
                  {/* Shorter labels where the full one would not fit under an icon */}
                  <span className="max-w-full truncate">{t.has(`short.${key}`) ? t(`short.${key}`) : t(key)}</span>
                </Link>
              );
            })}
            <button type="button" onClick={() => setMoreOpen(true)} aria-haspopup="dialog" aria-expanded={moreOpen} className={itemClass(restActive)}>
              <span className={pill(restActive)}>
                <Ellipsis className="size-5" />
              </span>
              <span className="max-w-full truncate">{t("more")}</span>
            </button>
          </div>
        </nav>
      </>
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
            <Icon className={cn("size-[18px]", active && "text-[#fca5a5]")} />
            {t(key)}
          </Link>
        );
      })}
    </nav>
  );
}

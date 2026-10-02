"use client";

import { BookOpen, LayoutDashboard, type LucideIcon } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";

/** Dashboard sections. New pages are added here as each build phase lands. */
const NAV: { href: string; key: string; icon: LucideIcon }[] = [
  { href: "/dashboard", key: "overview", icon: LayoutDashboard },
  { href: "/dashboard/knowledge", key: "knowledge", icon: BookOpen },
];

/**
 * Main navigation. `sidebar` is the vertical list in the dark sidebar;
 * `tabs` is the horizontal strip shown under the top bar on small screens.
 */
export function SidebarNav({ variant = "sidebar" }: { variant?: "sidebar" | "tabs" }) {
  const pathname = usePathname();
  const t = useTranslations("nav");

  return (
    <nav aria-label={t("menu")} className={variant === "sidebar" ? "flex flex-col gap-1" : "flex gap-1"}>
      {NAV.map(({ href, key, icon: Icon }) => {
        const active = href === "/dashboard" ? pathname === href : pathname.startsWith(href);
        return (
          <Link
            key={href}
            href={href}
            aria-current={active ? "page" : undefined}
            className={cn(
              "group relative flex items-center gap-3 text-sm font-medium whitespace-nowrap transition-colors",
              variant === "sidebar"
                ? cn(
                    "h-10 rounded-lg px-3",
                    active
                      ? "bg-white/10 text-white"
                      : "text-sidebar-foreground/60 hover:bg-white/5 hover:text-sidebar-foreground",
                  )
                : cn(
                    "h-11 border-b-2 px-3",
                    active ? "border-primary text-foreground" : "border-transparent text-muted-foreground hover:text-foreground",
                  ),
            )}
          >
            {/* Accent bar marking the current page */}
            {variant === "sidebar" && active && (
              <span className="absolute inset-y-2 start-0 w-[3px] rounded-full bg-primary" aria-hidden />
            )}
            <Icon className={cn("size-[18px]", variant === "sidebar" && active && "text-[#5c9dff]")} />
            {t(key)}
          </Link>
        );
      })}
    </nav>
  );
}

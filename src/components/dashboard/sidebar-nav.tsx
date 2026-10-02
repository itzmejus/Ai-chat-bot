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

export function SidebarNav() {
  const pathname = usePathname();
  const t = useTranslations("nav");

  return (
    <nav className="flex gap-1 md:flex-col">
      {NAV.map(({ href, key, icon: Icon }) => {
        const active = href === "/dashboard" ? pathname === href : pathname.startsWith(href);
        return (
          <Link
            key={href}
            href={href}
            aria-current={active ? "page" : undefined}
            className={cn(
              "flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium whitespace-nowrap transition-colors",
              active ? "bg-accent text-accent-foreground" : "text-muted-foreground hover:bg-accent/60 hover:text-foreground",
            )}
          >
            <Icon className="size-4" />
            {t(key)}
          </Link>
        );
      })}
    </nav>
  );
}

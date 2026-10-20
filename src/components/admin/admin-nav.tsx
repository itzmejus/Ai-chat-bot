"use client";

import { Activity, Building2, LayoutDashboard, Send, Users, type LucideIcon } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const LINKS: { href: string; label: string; icon: LucideIcon }[] = [
  { href: "/admin", label: "Overview", icon: LayoutDashboard },
  { href: "/admin/users", label: "Users", icon: Users },
  { href: "/admin/workspaces", label: "Workspaces", icon: Building2 },
  { href: "/admin/outreach", label: "Outreach", icon: Send },
  { href: "/admin/health", label: "Health", icon: Activity },
];

/**
 * The admin sections. On phones the five share the width evenly, each an icon over a short
 * label, so none is pushed off screen; from tablet width up they are underlined tabs in a row.
 */
export function AdminNav() {
  const pathname = usePathname();
  return (
    <nav className="-mb-px grid grid-cols-5 sm:flex sm:gap-1">
      {LINKS.map(({ href, label, icon: Icon }) => {
        const active = href === "/admin" ? pathname === href : pathname.startsWith(href);
        return (
          <Link
            key={href}
            href={href}
            aria-current={active ? "page" : undefined}
            className={cn(
              "flex min-w-0 flex-col items-center gap-1 border-b-2 px-1 pt-2 pb-2 text-[11px] font-medium transition-colors",
              "sm:flex-row sm:gap-1.5 sm:px-3 sm:py-2.5 sm:text-sm",
              active ? "border-primary text-foreground" : "border-transparent text-muted-foreground hover:text-foreground",
            )}
          >
            <Icon className={cn("size-[18px] shrink-0 sm:size-4", active && "text-primary")} />
            <span className="max-w-full truncate">{label}</span>
          </Link>
        );
      })}
    </nav>
  );
}

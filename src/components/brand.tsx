import { APP_NAME } from "@/lib/config";
import { LOGO_BUBBLE, LOGO_SPARK } from "@/lib/logo";
import { cn } from "@/lib/utils";

/** The brand mark: a speech bubble holding a spark, on a rounded brand-blue tile. */
export function LogoMark({ className }: { className?: string }) {
  return (
    <svg aria-hidden viewBox="0 0 32 32" className={cn("size-8 shrink-0", className)}>
      <rect width="32" height="32" rx="9" fill="var(--primary)" />
      <path d={LOGO_BUBBLE} fill="#fff" />
      <path d={LOGO_SPARK} fill="var(--primary)" />
    </svg>
  );
}

/** Product mark + name. `tone` picks colours for dark or light backgrounds. */
export function Brand({ tone = "dark", className }: { tone?: "dark" | "light"; className?: string }) {
  return (
    <span className={cn("flex items-center gap-2.5 text-lg font-bold tracking-tight", tone === "light" && "text-white", className)}>
      <LogoMark className="drop-shadow-[0_2px_6px_rgb(220_38_38/0.4)]" />
      {APP_NAME}
    </span>
  );
}

/** Round initials avatar. */
export function Avatar({ name, className }: { name: string; className?: string }) {
  const initials = name
    .split(/[\s@.]+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]!.toUpperCase())
    .join("");
  return (
    <span
      aria-hidden
      className={cn(
        "flex size-9 shrink-0 items-center justify-center rounded-full bg-accent text-xs font-semibold text-accent-foreground",
        className,
      )}
    >
      {initials || "?"}
    </span>
  );
}

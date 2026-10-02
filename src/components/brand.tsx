import { MessageCircle } from "lucide-react";
import { APP_NAME } from "@/lib/config";
import { cn } from "@/lib/utils";

/** Product mark + name. `tone` picks colours for dark or light backgrounds. */
export function Brand({ tone = "dark", className }: { tone?: "dark" | "light"; className?: string }) {
  return (
    <span className={cn("flex items-center gap-2.5 text-lg font-bold tracking-tight", tone === "light" && "text-white", className)}>
      <span className="flex size-8 items-center justify-center rounded-[10px] bg-primary text-primary-foreground shadow-[0_2px_8px_rgb(0_102_255/0.45)]">
        <MessageCircle className="size-[18px]" strokeWidth={2.5} />
      </span>
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

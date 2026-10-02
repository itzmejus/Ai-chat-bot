import { cn } from "@/lib/utils";

/** Thin progress bar for "used of max" figures. Turns amber near the limit and red at it. */
export function Meter({
  value,
  max,
  tone = "light",
  warn = true,
  className,
}: {
  value: number;
  max: number;
  tone?: "light" | "dark";
  /** Set to false for figures where reaching the maximum is not a problem. */
  warn?: boolean;
  className?: string;
}) {
  const ratio = max > 0 ? Math.min(1, value / max) : 0;
  return (
    <div
      role="progressbar"
      aria-valuenow={value}
      aria-valuemin={0}
      aria-valuemax={max}
      className={cn("h-1.5 w-full overflow-hidden rounded-full", tone === "dark" ? "bg-white/10" : "bg-secondary", className)}
    >
      <div
        className={cn("h-full rounded-full transition-[width]", !warn ? "bg-primary" : ratio >= 1 ? "bg-destructive" : ratio >= 0.8 ? "bg-[#f59e0b]" : "bg-primary")}
        style={{ width: `${Math.max(ratio * 100, value > 0 ? 3 : 0)}%` }}
      />
    </div>
  );
}

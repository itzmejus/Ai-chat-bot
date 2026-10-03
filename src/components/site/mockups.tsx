import { Check } from "lucide-react";
import type { ChatLine } from "@/content/site";
import { cn } from "@/lib/utils";

/**
 * Product pictures for the public site, drawn with HTML, CSS and inline SVG instead of
 * image files: they stay sharp at every size, weigh almost nothing, follow the page's
 * language and direction, and are hidden from screen readers (the surrounding
 * text already says what they show).
 */

/** One chat bubble. `tone` picks colours for a light or dark surface. */
export function Bubble({ line, tone = "light", accent = "var(--primary)" }: { line: ChatLine; tone?: "light" | "dark"; accent?: string }) {
  if (line.from === "note") {
    return (
      <p dir="auto" className={cn("self-center rounded-full px-3 py-1 text-[11px] font-medium", tone === "dark" ? "bg-white/10 text-white/70" : "bg-muted text-muted-foreground")}>
        {line.text}
      </p>
    );
  }
  const mine = line.from === "customer";
  return (
    <p
      dir="auto"
      style={mine ? { backgroundColor: accent } : undefined}
      className={cn(
        "max-w-[85%] rounded-2xl px-3.5 py-2.5 text-[13px] leading-relaxed",
        mine && "self-end rounded-ee-md text-white",
        !mine && tone === "light" && "self-start rounded-es-md bg-white text-foreground shadow-[0_1px_3px_rgb(27_27_32/0.1)]",
        !mine && tone === "dark" && "self-start rounded-es-md bg-white/10 text-white ring-1 ring-white/10",
        line.from === "agent" && tone === "dark" && "bg-[#1f3a2c] ring-[#00c057]/30",
      )}
    >
      {line.text}
    </p>
  );
}

/** Small tick list used inside cards. */
export function TickList({ items, tone = "light" }: { items: string[]; tone?: "light" | "dark" }) {
  return (
    <ul className="flex flex-col gap-3">
      {items.map((item) => (
        <li key={item} className={cn("flex items-start gap-3 text-[15px] leading-relaxed", tone === "dark" ? "text-white/85" : "text-foreground/85")}>
          <span className={cn("mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full", tone === "dark" ? "bg-primary text-white" : "bg-accent text-primary")}>
            <Check className="size-3" strokeWidth={3} />
          </span>
          {item}
        </li>
      ))}
    </ul>
  );
}

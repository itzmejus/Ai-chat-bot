import { useTranslations } from "next-intl";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

/** Label + control + translated validation error. `error` is a translation key. */
export function FormField({
  id,
  label,
  hint,
  error,
  children,
}: {
  id: string;
  label: string;
  hint?: string;
  error?: string;
  children: React.ReactNode;
}) {
  const t = useTranslations();
  return (
    <div className="flex flex-col gap-2">
      <Label htmlFor={id}>
        {label}
        {hint && <span className="font-normal text-muted-foreground">({hint})</span>}
      </Label>
      {children}
      {error && (
        <p id={`${id}-error`} className="text-sm text-destructive">
          {t(error)}
        </p>
      )}
    </div>
  );
}

/** Native <select> styled to match the shadcn Input. */
export function NativeSelect({ className, ...props }: React.ComponentProps<"select">) {
  return (
    <select
      {...props}
      className={cn(
        "h-10 w-full rounded-lg border border-input bg-background px-3 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-4 focus-visible:ring-ring/15",
        className,
      )}
    />
  );
}

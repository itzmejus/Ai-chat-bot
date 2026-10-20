"use client";

import { Languages } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { Button } from "@/components/ui/button";
import { setLocaleAction } from "@/server/actions/workspace";

/**
 * Toggles the dashboard between English and Arabic (RTL). `compact` shows a short label ("ع" /
 * "EN") on phones, for tight spaces such as the dashboard's top bar.
 */
export function LanguageSwitcher({ className, compact = false }: { className?: string; compact?: boolean }) {
  const locale = useLocale();
  const t = useTranslations("common");
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const next = locale === "ar" ? "en" : "ar";
  const label = next === "ar" ? t("arabic") : t("english");

  return (
    <Button
      variant="outline"
      size="sm"
      className={className}
      disabled={pending}
      aria-label={t("language")}
      onClick={() =>
        startTransition(async () => {
          await setLocaleAction(next);
          router.refresh();
        })
      }
    >
      <Languages />
      {compact ? (
        <>
          <span className="sm:hidden">{next === "ar" ? "ع" : "EN"}</span>
          <span className="hidden sm:inline">{label}</span>
        </>
      ) : (
        label
      )}
    </Button>
  );
}

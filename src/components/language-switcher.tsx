"use client";

import { Languages } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { Button } from "@/components/ui/button";
import { setLocaleAction } from "@/server/actions/workspace";

/** Toggles the dashboard between English and Arabic (RTL). */
export function LanguageSwitcher({ className }: { className?: string }) {
  const locale = useLocale();
  const t = useTranslations("common");
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const next = locale === "ar" ? "en" : "ar";

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
      {next === "ar" ? t("arabic") : t("english")}
    </Button>
  );
}

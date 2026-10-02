"use client";

import { useTranslations } from "next-intl";
import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { acceptInviteAction } from "@/server/actions/team";

/** Joins the workspace named in the invitation and opens its dashboard. */
export function AcceptInviteButton({ token }: { token: string }) {
  const t = useTranslations();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  return (
    <div className="flex w-full flex-col gap-2">
      <Button
        size="lg"
        className="w-full"
        disabled={pending}
        onClick={() =>
          startTransition(async () => {
            const result = await acceptInviteAction(token); // redirects on success
            if (result?.error) setError(result.error);
          })
        }
      >
        {pending ? t("common.saving") : t("invite.accept")}
      </Button>
      {error && (
        <p role="alert" className="text-sm text-destructive">
          {t(error)}
        </p>
      )}
    </div>
  );
}

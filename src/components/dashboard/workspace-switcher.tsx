"use client";

import { useTranslations } from "next-intl";
import { useTransition } from "react";
import { NativeSelect } from "@/components/form-field";
import { switchWorkspaceAction } from "@/server/actions/workspace";

/** Shown only when the user belongs to more than one workspace. */
export function WorkspaceSwitcher({ current, options }: { current: string; options: { id: string; name: string }[] }) {
  const t = useTranslations("nav");
  const [pending, startTransition] = useTransition();

  return (
    <NativeSelect
      aria-label={t("workspace")}
      value={current}
      disabled={pending}
      onChange={(e) => {
        const id = e.target.value;
        startTransition(() => switchWorkspaceAction(id));
      }}
    >
      {options.map((o) => (
        <option key={o.id} value={o.id}>
          {o.name}
        </option>
      ))}
    </NativeSelect>
  );
}

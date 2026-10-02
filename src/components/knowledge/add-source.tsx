"use client";

import { FileUp, Globe, MessageCircleQuestion, NotebookPen } from "lucide-react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { useActionState, useEffect, useRef, useState } from "react";
import { FormField } from "@/components/form-field";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import type { FormState } from "@/server/actions/auth";
import { addFaqAction, addUrlAction, saveNotesAction } from "@/server/actions/knowledge";

const TABS = ["url", "file", "faq", "notes"] as const;
type Tab = (typeof TABS)[number];
const TAB_ICONS = { url: Globe, file: FileUp, faq: MessageCircleQuestion, notes: NotebookPen } as const;

/** Shared footer: form-level error, success note, submit button. */
function FormFooter({ state, pending, label }: { state: FormState; pending: boolean; label: string }) {
  const t = useTranslations();
  return (
    <div className="flex flex-wrap items-center gap-3">
      <Button type="submit" disabled={pending}>
        {pending ? t("common.saving") : label}
      </Button>
      {state?.error && (
        <p role="alert" className="text-sm text-destructive">
          {t(state.error)}
        </p>
      )}
      {state?.ok && !pending && (
        <p role="status" className="text-sm text-muted-foreground">
          {t("knowledge.saved")}
        </p>
      )}
    </div>
  );
}

/** Clears the form after a successful submit. */
function useResetOnSuccess(state: FormState) {
  const ref = useRef<HTMLFormElement>(null);
  useEffect(() => {
    if (state?.ok) ref.current?.reset();
  }, [state]);
  return ref;
}

function UrlForm({ defaultUrl, maxPages }: { defaultUrl: string; maxPages: number }) {
  const t = useTranslations("knowledge");
  // Controlled: the suggested URL from the server changes once the site has been added,
  // and an uncontrolled input must not have its default value changed after mount.
  const [url, setUrl] = useState(defaultUrl);
  const [state, action, pending] = useActionState<FormState, FormData>(async (prev, formData) => {
    const result = await addUrlAction(prev, formData);
    if (result?.ok) setUrl("");
    return result;
  }, undefined);
  return (
    <form action={action} className="flex flex-col gap-4">
      <FormField id="url" label={t("urlLabel")} error={state?.fieldErrors?.url}>
        <Input
          id="url"
          name="url"
          dir="ltr"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="yourbusiness.ae"
          required
        />
      </FormField>
      <p className="text-sm text-muted-foreground">{t("urlHelp", { max: maxPages })}</p>
      <FormFooter state={state} pending={pending} label={t("urlSubmit")} />
    </form>
  );
}

function FaqForm() {
  const t = useTranslations("knowledge");
  const [state, action, pending] = useActionState<FormState, FormData>(addFaqAction, undefined);
  const ref = useResetOnSuccess(state);
  return (
    <form ref={ref} action={action} className="flex flex-col gap-4">
      <FormField id="question" label={t("question")} error={state?.fieldErrors?.question}>
        <Input id="question" name="question" dir="auto" placeholder={t("questionPlaceholder")} required />
      </FormField>
      <FormField id="answer" label={t("answer")} error={state?.fieldErrors?.answer}>
        <Textarea id="answer" name="answer" dir="auto" rows={4} required />
      </FormField>
      <FormFooter state={state} pending={pending} label={t("faqSubmit")} />
    </form>
  );
}

function NotesForm({ initial }: { initial: string }) {
  const t = useTranslations("knowledge");
  const [state, action, pending] = useActionState<FormState, FormData>(saveNotesAction, undefined);
  return (
    <form action={action} className="flex flex-col gap-4">
      <FormField id="notes" label={t("notesLabel")} error={state?.fieldErrors?.notes}>
        <Textarea id="notes" name="notes" dir="auto" rows={8} defaultValue={initial} />
      </FormField>
      <p className="text-sm text-muted-foreground">{t("notesHelp")}</p>
      <FormFooter state={state} pending={pending} label={t("notesSubmit")} />
    </form>
  );
}

/** File upload goes to a route handler (server actions have a small body limit). */
function FileForm() {
  const t = useTranslations();
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [state, setState] = useState<FormState>(undefined);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    setPending(true);
    setState(undefined);
    try {
      const res = await fetch("/api/sources/upload", { method: "POST", body: new FormData(form) });
      const body = await res.json().catch(() => ({}));
      if (res.ok) {
        form.reset();
        setState({ ok: true });
        router.refresh();
      } else {
        setState({ error: body.error ?? "errors.generic" });
      }
    } catch {
      setState({ error: "errors.generic" });
    } finally {
      setPending(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-4">
      <FormField id="file" label={t("knowledge.fileLabel")}>
        <Input id="file" name="file" type="file" accept=".pdf,.docx,.txt" required />
      </FormField>
      <p className="text-sm text-muted-foreground">{t("knowledge.fileHelp")}</p>
      <FormFooter state={state} pending={pending} label={pending ? t("knowledge.uploading") : t("knowledge.fileSubmit")} />
    </form>
  );
}

export function AddSource({ defaultUrl, notes, maxCrawlPages }: { defaultUrl: string; notes: string; maxCrawlPages: number }) {
  const t = useTranslations("knowledge");
  const [tab, setTab] = useState<Tab>("url");

  return (
    <div className="flex flex-col gap-5">
      <div role="tablist" className="flex w-fit max-w-full gap-1 overflow-x-auto rounded-xl bg-muted p-1">
        {TABS.map((key) => {
          const Icon = TAB_ICONS[key];
          return (
            <button
              key={key}
              type="button"
              role="tab"
              aria-selected={tab === key}
              onClick={() => setTab(key)}
              className={cn(
                "flex h-9 items-center gap-2 rounded-lg px-3.5 text-sm font-medium whitespace-nowrap transition-colors",
                tab === key ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground",
              )}
            >
              <Icon className={cn("size-4", tab === key && "text-primary")} />
              {t(`tabs.${key}`)}
            </button>
          );
        })}
      </div>

      <div role="tabpanel">
        {tab === "url" && <UrlForm defaultUrl={defaultUrl} maxPages={maxCrawlPages} />}
        {tab === "file" && <FileForm />}
        {tab === "faq" && <FaqForm />}
        {tab === "notes" && <NotesForm initial={notes} />}
      </div>
    </div>
  );
}

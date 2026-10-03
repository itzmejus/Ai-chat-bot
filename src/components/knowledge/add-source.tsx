"use client";

import { CheckCircle2, FileUp, Globe, Loader2, MessageCircleQuestion, NotebookPen, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { useActionState, useEffect, useRef, useState } from "react";
import { FormField } from "@/components/form-field";
import { UploadScene } from "@/components/illustrations";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import type { FormState } from "@/server/actions/auth";
import { addFaqAction, addUrlAction, saveNotesAction } from "@/server/actions/knowledge";

const TABS = ["url", "file", "faq", "notes"] as const;
type Tab = (typeof TABS)[number];
const TAB_ICONS = { url: Globe, file: FileUp, faq: MessageCircleQuestion, notes: NotebookPen } as const;

// Keep in step with the server-side limits in src/server/ingest/parsers.ts.
const FILE_TYPES = ["pdf", "docx", "txt"] as const;
const MAX_FILE_BYTES = 10 * 1024 * 1024;

function formatBytes(bytes: number) {
  return bytes < 1024 * 1024 ? `${Math.max(1, Math.round(bytes / 1024))} KB` : `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

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

function FaqForm({ question }: { question: string }) {
  const t = useTranslations("knowledge");
  const [state, action, pending] = useActionState<FormState, FormData>(addFaqAction, undefined);
  const ref = useResetOnSuccess(state);
  return (
    <form ref={ref} action={action} className="flex flex-col gap-4">
      <FormField id="question" label={t("question")} error={state?.fieldErrors?.question}>
        <Input id="question" name="question" dir="auto" defaultValue={question} placeholder={t("questionPlaceholder")} required />
      </FormField>
      {question && <p className="-mt-2 text-sm text-muted-foreground">{t("faqFromQuestion")}</p>}
      <FormField id="answer" label={t("answer")} error={state?.fieldErrors?.answer}>
        <Textarea id="answer" name="answer" dir="auto" rows={4} autoFocus={Boolean(question)} required />
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
  const [file, setFile] = useState<File | null>(null);
  const [dragging, setDragging] = useState(false);
  const input = useRef<HTMLInputElement>(null);

  /** Check type and size in the browser for instant feedback; the server checks again. */
  function choose(candidate: File | undefined) {
    if (!candidate) return;
    const extension = candidate.name.toLowerCase().split(".").pop() ?? "";
    if (!FILE_TYPES.includes(extension as (typeof FILE_TYPES)[number])) {
      setFile(null);
      setState({ error: "knowledge.errors.unsupported" });
    } else if (candidate.size > MAX_FILE_BYTES) {
      setFile(null);
      setState({ error: "knowledge.errors.tooLarge" });
    } else {
      setFile(candidate);
      setState(undefined);
    }
  }

  function clear() {
    setFile(null);
    if (input.current) input.current.value = "";
  }

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!file) {
      setState({ error: "knowledge.errors.noFile" });
      return;
    }
    setPending(true);
    setState(undefined);
    try {
      // Built by hand because a dropped file is not in the <input>.
      const body = new FormData();
      body.append("file", file);
      const res = await fetch("/api/sources/upload", { method: "POST", body });
      const json = await res.json().catch(() => ({}));
      if (res.ok) {
        clear();
        setState({ ok: true });
        router.refresh();
      } else {
        setState({ error: json.error ?? "errors.generic" });
      }
    } catch {
      setState({ error: "errors.generic" });
    } finally {
      setPending(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-4">
      {/* The whole zone is the label of the hidden file input, so clicking or pressing Enter opens the picker. */}
      <label
        htmlFor="file"
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragging(false);
          choose(e.dataTransfer.files[0]);
        }}
        className={cn(
          "relative flex cursor-pointer flex-col items-center gap-3 overflow-hidden rounded-2xl border-2 border-dashed px-4 py-8 text-center transition-all",
          "focus-within:border-primary focus-within:ring-4 focus-within:ring-ring/15",
          dragging
            ? "scale-[1.01] border-primary bg-accent"
            : "border-input bg-gradient-to-b from-accent/50 to-background hover:border-primary/60 hover:from-accent",
        )}
      >
        <input
          ref={input}
          id="file"
          name="file"
          type="file"
          accept=".pdf,.docx,.txt"
          className="sr-only"
          onChange={(e) => choose(e.target.files?.[0])}
        />
        <UploadScene className={cn("w-28 transition-transform", dragging && "-translate-y-1")} />
        <div>
          <p className="text-sm font-semibold">{dragging ? t("knowledge.dropActive") : t("knowledge.dropTitle")}</p>
          <p className="mt-1 text-xs text-muted-foreground">{t("knowledge.fileHelp")}</p>
        </div>
        <div className="flex flex-wrap items-center justify-center gap-1.5">
          {FILE_TYPES.map((type) => (
            <span key={type} className="rounded-md bg-background px-2 py-0.5 text-[11px] font-semibold tracking-wide text-muted-foreground uppercase ring-1 ring-border">
              {type}
            </span>
          ))}
          <span className="text-[11px] text-muted-foreground">· {t("knowledge.maxSize")}</span>
        </div>
      </label>

      {/* Chosen file */}
      {file && (
        <div className="flex items-center gap-3 rounded-xl border border-border/70 bg-background p-3">
          <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-accent text-[11px] font-bold tracking-wide text-primary uppercase">
            {file.name.split(".").pop()}
          </span>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium" dir="auto" title={file.name}>
              {file.name}
            </p>
            <p className="text-xs text-muted-foreground" dir="ltr">
              {formatBytes(file.size)}
            </p>
          </div>
          <Button type="button" variant="ghost" size="icon-sm" onClick={clear} disabled={pending} aria-label={t("knowledge.removeFile")} title={t("knowledge.removeFile")}>
            <X />
          </Button>
        </div>
      )}

      <div className="flex flex-wrap items-center gap-3">
        <Button type="submit" disabled={pending || !file}>
          {pending ? <Loader2 className="animate-spin" /> : <FileUp />}
          {pending ? t("knowledge.uploading") : t("knowledge.fileSubmit")}
        </Button>
        {state?.error && (
          <p role="alert" className="text-sm text-destructive">
            {t(state.error)}
          </p>
        )}
        {state?.ok && !pending && (
          <p role="status" className="flex items-center gap-1.5 text-sm text-success">
            <CheckCircle2 className="size-4" />
            {t("knowledge.saved")}
          </p>
        )}
      </div>
    </form>
  );
}

export function AddSource({
  defaultUrl,
  notes,
  maxCrawlPages,
  faqQuestion = "",
}: {
  defaultUrl: string;
  notes: string;
  maxCrawlPages: number;
  /** A customer question to answer: opens the FAQ tab with it filled in. */
  faqQuestion?: string;
}) {
  const t = useTranslations("knowledge");
  const [tab, setTab] = useState<Tab>(faqQuestion ? "faq" : "url");

  return (
    <div className="flex flex-col gap-5">
      {/* Source types as selectable tiles */}
      <div role="tablist" className="grid grid-cols-2 gap-2.5 lg:grid-cols-4">
        {TABS.map((key) => {
          const Icon = TAB_ICONS[key];
          const active = tab === key;
          return (
            <button
              key={key}
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() => setTab(key)}
              className={cn(
                "group relative flex flex-col items-start gap-2.5 rounded-xl border p-3.5 text-start transition-all outline-none focus-visible:ring-4 focus-visible:ring-ring/20",
                active
                  ? "border-primary bg-gradient-to-br from-accent to-white shadow-[0_4px_16px_-6px_rgb(220_38_38/0.45)]"
                  : "border-border/80 bg-background hover:border-primary/40 hover:bg-accent/40",
              )}
            >
              <span
                className={cn(
                  "flex size-9 items-center justify-center rounded-lg transition-colors",
                  active ? "bg-primary text-white shadow-[0_2px_8px_rgb(220_38_38/0.4)]" : "bg-muted text-muted-foreground group-hover:text-primary",
                )}
              >
                <Icon className="size-[18px]" />
              </span>
              <span className="min-w-0">
                <span className="block text-sm font-semibold">{t(`tabs.${key}`)}</span>
                <span className="block text-xs leading-snug text-muted-foreground">{t(`tabHints.${key}`)}</span>
              </span>
              {active && <span aria-hidden className="absolute end-3 top-3 size-2 rounded-full bg-primary ring-4 ring-primary/15" />}
            </button>
          );
        })}
      </div>

      <div role="tabpanel" className="rounded-xl border border-border/70 bg-background/70 p-4 sm:p-5">
        {tab === "url" && <UrlForm defaultUrl={defaultUrl} maxPages={maxCrawlPages} />}
        {tab === "file" && <FileForm />}
        {tab === "faq" && <FaqForm question={faqQuestion} />}
        {tab === "notes" && <NotesForm initial={notes} />}
      </div>
    </div>
  );
}

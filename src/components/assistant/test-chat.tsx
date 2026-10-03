"use client";

import { Bot, RotateCcw, SendHorizontal } from "lucide-react";
import { useTranslations } from "next-intl";
import { useEffect, useRef, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { readSse } from "@/lib/sse-client";
import { cn } from "@/lib/utils";

type Meta = {
  confidence: number;
  answered: boolean;
  needsHuman: boolean;
  skipped: string | null;
  sources: { title: string; url: string | null; similarity: number }[];
};
type ChatMessage = { id: number; role: "customer" | "assistant"; text: string; meta?: Meta; error?: boolean };

/**
 * "Test your assistant": a chat box wired to the same answering service the
 * public widget uses, plus the confidence signal and sources for each reply.
 */
export function TestChat({ assistantName, greeting }: { assistantName: string; greeting: string }) {
  const t = useTranslations();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const conversationId = useRef<string | undefined>(undefined);
  const nextId = useRef(1);
  const scroller = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scroller.current?.scrollTo({ top: scroller.current.scrollHeight });
  }, [messages]);

  const patchLast = (patch: (m: ChatMessage) => ChatMessage) =>
    setMessages((all) => all.map((m, i) => (i === all.length - 1 ? patch(m) : m)));

  async function send(e: React.FormEvent) {
    e.preventDefault();
    const text = input.trim();
    if (!text || busy) return;
    setInput("");
    setBusy(true);
    setMessages((all) => [
      ...all,
      { id: nextId.current++, role: "customer", text },
      { id: nextId.current++, role: "assistant", text: "" },
    ]);

    try {
      const res = await fetch("/api/assistant/test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text, conversationId: conversationId.current }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        patchLast((m) => ({ ...m, text: t(body.error ?? "errors.generic"), error: true }));
        return;
      }
      for await (const { event, data } of readSse(res)) {
        if (event === "conversation") conversationId.current = (data as { id: string }).id;
        else if (event === "token") patchLast((m) => ({ ...m, text: m.text + (data as { text: string }).text }));
        else if (event === "done") patchLast((m) => ({ ...m, meta: data as Meta }));
        else if (event === "error") patchLast((m) => ({ ...m, text: m.text || t("errors.generic"), error: true }));
      }
    } catch {
      patchLast((m) => ({ ...m, text: m.text || t("errors.generic"), error: true }));
    } finally {
      setBusy(false);
    }
  }

  function reset() {
    conversationId.current = undefined;
    setMessages([]);
  }

  return (
    <div className="flex h-[32rem] flex-col overflow-hidden rounded-2xl border border-border/70 bg-muted shadow-[0_8px_30px_-12px_rgb(16_24_40/0.25)]">
      {/* Header styled like the customer-facing widget */}
      <div className="hero-surface flex items-center justify-between gap-2 px-4 py-3 text-white">
        <div className="flex min-w-0 items-center gap-2.5">
          <span className="relative flex size-9 shrink-0 items-center justify-center rounded-full bg-primary shadow-[0_2px_8px_rgb(37_99_235/0.5)]">
            <Bot className="size-[18px]" />
            <span className="absolute -end-0.5 -bottom-0.5 size-3 rounded-full bg-[#00c057] ring-2 ring-[#1b1b20]" />
          </span>
          <div className="min-w-0 leading-tight">
            <p className="truncate text-sm font-semibold" dir="auto">
              {assistantName}
            </p>
            <p className="text-xs text-white/60">{t("assistant.online")}</p>
          </div>
        </div>
        <Button
          variant="ghost"
          size="sm"
          className="text-white/80 hover:bg-white/10 hover:text-white"
          onClick={reset}
          disabled={busy || messages.length === 0}
        >
          <RotateCcw />
          {t("assistant.reset")}
        </Button>
      </div>

      <div
        ref={scroller}
        className="flex flex-1 flex-col gap-3 overflow-y-auto bg-[radial-gradient(circle_at_1px_1px,rgb(27_27_32/0.07)_1px,transparent_0)] bg-[length:18px_18px] p-4"
        aria-live="polite"
      >
        <Bubble role="assistant" text={greeting} />
        {messages.length === 0 && <p className="mt-2 text-center text-sm text-muted-foreground">{t("assistant.empty")}</p>}
        {messages.map((m) => (
          <div key={m.id} className="flex flex-col gap-1.5">
            <Bubble role={m.role} text={m.text} error={m.error} typingLabel={t("assistant.typing")} />
            {m.meta && <MetaRow meta={m.meta} />}
          </div>
        ))}
      </div>

      <form onSubmit={send} className="flex items-center gap-2 border-t bg-background p-3">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          dir="auto"
          maxLength={2000}
          placeholder={t("assistant.placeholder")}
          aria-label={t("assistant.placeholder")}
          className="h-10 min-w-0 flex-1 rounded-full border border-input bg-background px-4 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/30"
        />
        <Button type="submit" size="icon-lg" className="rounded-full" disabled={busy || !input.trim()} aria-label={t("assistant.send")}>
          <SendHorizontal className="rtl:-scale-x-100" />
        </Button>
      </form>
    </div>
  );
}

/** Assistant bubbles are dark and customer bubbles white, following the reference design. */
function Bubble({ role, text, error, typingLabel }: { role: "customer" | "assistant"; text: string; error?: boolean; typingLabel?: string }) {
  const isAssistant = role === "assistant";
  return (
    <div
      dir="auto"
      className={cn(
        "max-w-[85%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed whitespace-pre-wrap shadow-sm",
        isAssistant ? "self-start rounded-ss-md bg-foreground text-background" : "self-end rounded-se-md bg-background",
        error && "bg-destructive/10 text-destructive shadow-none",
      )}
    >
      {text || (
        <span className="flex items-center gap-1 py-1.5" role="status" aria-label={typingLabel}>
          {[0, 150, 300].map((delay) => (
            <span key={delay} className="size-1.5 animate-bounce rounded-full bg-background/70" style={{ animationDelay: `${delay}ms` }} />
          ))}
        </span>
      )}
    </div>
  );
}

function MetaRow({ meta }: { meta: Meta }) {
  const t = useTranslations("assistant");
  if (meta.skipped === "usage_limit") return <Badge variant="destructive">{t("limitReached")}</Badge>;
  return (
    <div className="flex flex-wrap items-center gap-1.5 text-xs text-muted-foreground">
      <Badge variant="outline" className="bg-background">
        {t("confidence", { percent: Math.round(meta.confidence * 100) })}
      </Badge>
      <Badge variant="outline" className={cn("bg-background", meta.answered ? "text-success" : "text-destructive")}>
        {meta.answered ? t("answeredFromKb") : t("notInKb")}
      </Badge>
      {meta.needsHuman && (
        <Badge variant="outline" className="bg-background">
          {t("needsHuman")}
        </Badge>
      )}
      {meta.answered && meta.sources.length > 0 && (
        <span className="truncate" dir="auto">
          {t("sources")}: {[...new Set(meta.sources.map((s) => s.title))].slice(0, 2).join(", ")}
        </span>
      )}
    </div>
  );
}

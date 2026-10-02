"use client";

import {
  ArrowLeft,
  Bot,
  CheckCircle2,
  Hand,
  Headset,
  Loader2,
  type LucideIcon,
  Mail,
  MessagesSquare,
  Phone,
  RotateCcw,
  Search,
  SendHorizontal,
  Sparkles,
  UserRound,
} from "lucide-react";
import { useFormatter, useNow, useTranslations } from "next-intl";
import { useCallback, useEffect, useRef, useState } from "react";
import { ChatScene, DotPattern, InboxScene } from "@/components/illustrations";
import { Button } from "@/components/ui/button";
import { decodeSystemEvent } from "@/lib/system-events";
import { cn } from "@/lib/utils";

type Status = "ai" | "needs_human" | "human" | "closed";
type Filter = "all" | "needs_human" | "ai" | "closed";
type Role = "customer" | "assistant" | "agent" | "system";

type ListItem = {
  id: string;
  visitorId: string;
  visitorName: string | null;
  visitorPhone: string | null;
  status: Status;
  unread: boolean;
  lastMessageAt: string;
  preview: { role: Role; content: string } | null;
};
type Counts = Record<Filter, number> & { unread: number };
type Message = {
  id: string;
  role: Role;
  content: string;
  confidence: number | null;
  answered: boolean | null;
  createdAt: string;
  author: { name: string | null; email: string } | null;
};
type Detail = {
  id: string;
  visitorId: string;
  visitorName: string | null;
  visitorPhone: string | null;
  status: Status;
  assignedAgent: { name: string | null; email: string } | null;
  messages: Message[];
};

const FILTERS: Filter[] = ["all", "needs_human", "ai", "closed"];

/** Colour language used everywhere a status appears: pill, avatar ring, filter dot. */
const STATUS: Record<Status, { pill: string; avatar: string; dot: string }> = {
  ai: { pill: "bg-accent text-accent-foreground", avatar: "from-[#dbe9ff] to-[#f3f8ff] text-primary", dot: "bg-primary" },
  needs_human: { pill: "bg-[#fff1d6] text-[#9a5b00]", avatar: "from-[#ffe2a8] to-[#fff6e3] text-[#9a5b00]", dot: "bg-[#f59e0b]" },
  human: { pill: "bg-[#e7f8ee] text-success", avatar: "from-[#c4f0d6] to-[#effbf4] text-success", dot: "bg-[#00c057]" },
  closed: { pill: "bg-secondary text-muted-foreground", avatar: "from-[#e4e4e7] to-[#f6f6f7] text-muted-foreground", dot: "bg-[#a1a1aa]" },
};
const FILTER_DOT: Record<Filter, string> = { all: "bg-foreground", needs_human: STATUS.needs_human.dot, ai: STATUS.ai.dot, closed: STATUS.closed.dot };

function StatusPill({ status }: { status: Status }) {
  const t = useTranslations("inbox.status");
  return (
    <span className={cn("inline-flex h-6 shrink-0 items-center gap-1.5 rounded-full px-2.5 text-xs font-medium whitespace-nowrap", STATUS[status].pill)}>
      <span className={cn("size-1.5 rounded-full bg-current", status === "needs_human" && "animate-pulse")} />
      {t(status)}
    </span>
  );
}

/** Initials on a soft gradient tinted by the conversation's status. */
function VisitorAvatar({ label, status, anonymous, className }: { label: string; status: Status; anonymous: boolean; className?: string }) {
  const initials = label
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]!.toUpperCase())
    .join("");
  return (
    <span
      aria-hidden
      className={cn(
        "flex size-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br text-xs font-semibold ring-1 ring-black/5",
        STATUS[status].avatar,
        className,
      )}
    >
      {anonymous ? <UserRound className="size-[18px]" /> : initials}
    </span>
  );
}

/** One figure in the banner. */
function HeroStat({ icon: Icon, label, value, highlight }: { icon: LucideIcon; label: string; value: number | null; highlight?: boolean }) {
  return (
    <div className="flex min-w-0 items-center gap-2.5 rounded-2xl bg-white/[0.08] px-3 py-2 ring-1 ring-white/10 backdrop-blur sm:px-3.5 sm:py-2.5">
      <span className={cn("flex size-8 shrink-0 items-center justify-center rounded-full", highlight && value ? "bg-[#ffd000] text-[#1b1b20]" : "bg-white/10 text-white")}>
        <Icon className="size-4" />
      </span>
      <div className="min-w-0 leading-tight">
        <p className="text-lg font-bold tabular-nums">{value ?? "–"}</p>
        <p className="truncate text-[11px] text-white/60">{label}</p>
      </div>
    </div>
  );
}

/**
 * The inbox: conversation list, the selected conversation, and agent actions.
 * It keeps itself current through a Server-Sent Events connection: whenever the
 * server reports a change it re-fetches the list and the open conversation.
 */
export function Inbox({ initialConversationId }: { initialConversationId: string | null }) {
  const t = useTranslations();
  const format = useFormatter();
  const now = useNow({ updateInterval: 30_000 });

  const [filter, setFilter] = useState<Filter>("all");
  const [query, setQuery] = useState("");
  const [search, setSearch] = useState(""); // debounced `query`
  const [items, setItems] = useState<ListItem[] | null>(null);
  const [counts, setCounts] = useState<Counts | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(initialConversationId);
  const [detail, setDetail] = useState<Detail | null>(null);
  const [draft, setDraft] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [live, setLive] = useState(false);

  // Refs let the long-lived event stream see the latest values without reconnecting.
  const selectedRef = useRef(selectedId);
  const viewRef = useRef({ filter, search });
  const scroller = useRef<HTMLDivElement>(null);
  useEffect(() => {
    selectedRef.current = selectedId;
    viewRef.current = { filter, search };
  }, [selectedId, filter, search]);

  const visitorLabel = (c: { visitorName: string | null; visitorId: string }) =>
    c.visitorName ?? t("inbox.visitor", { id: c.visitorId.replace(/[^A-Za-z0-9]/g, "").slice(-4).toUpperCase() });
  // "now" only ticks every 30 seconds, so a brand-new message can be slightly ahead of it. Never show a future time.
  const ago = (iso: string) => {
    const date = new Date(iso);
    return format.relativeTime(date > now ? now : date, now);
  };

  const loadList = useCallback(async () => {
    const { filter: f, search: s } = viewRef.current;
    try {
      const res = await fetch(`/api/inbox/conversations?filter=${f}&q=${encodeURIComponent(s)}`);
      if (!res.ok) return;
      const body = (await res.json()) as { conversations: ListItem[]; counts: Counts };
      // Ignore a response that arrives after the view has changed.
      if (viewRef.current.filter !== f || viewRef.current.search !== s) return;
      setItems(body.conversations);
      setCounts(body.counts);
    } catch {
      // Offline: the stream's reconnect will trigger another load.
    }
  }, []);

  const loadDetail = useCallback(async (id: string) => {
    try {
      const res = await fetch(`/api/inbox/conversations/${id}`);
      if (selectedRef.current !== id) return;
      if (res.status === 404) {
        setDetail(null);
        setError("inbox.errors.not_found");
        return;
      }
      if (!res.ok) {
        setError("errors.generic");
        return;
      }
      setError(null);
      setDetail(((await res.json()) as { conversation: Detail }).conversation);
    } catch {
      // ignored, see loadList
    }
  }, []);

  // Debounce typing in the search box.
  useEffect(() => {
    const timer = setTimeout(() => setSearch(query.trim()), 300);
    return () => clearTimeout(timer);
  }, [query]);

  useEffect(() => {
    viewRef.current = { filter, search };
    void loadList();
  }, [filter, search, loadList]);

  // Live updates. This also performs the first load of a conversation opened by link (?c=…).
  // EventSource reconnects by itself; on every (re)connect we reload, in case something
  // changed while disconnected.
  useEffect(() => {
    const source = new EventSource("/api/inbox/stream");
    let listTimer: ReturnType<typeof setTimeout> | undefined;
    source.addEventListener("ready", () => {
      setLive(true);
      void loadList();
      if (selectedRef.current) void loadDetail(selectedRef.current);
    });
    source.addEventListener("change", (event) => {
      const { conversationId } = JSON.parse((event as MessageEvent<string>).data) as { conversationId: string };
      // Several events often arrive together (message + status): reload the list once.
      clearTimeout(listTimer);
      listTimer = setTimeout(() => void loadList(), 150);
      if (conversationId === selectedRef.current) void loadDetail(conversationId);
    });
    source.onerror = () => setLive(false);
    return () => {
      clearTimeout(listTimer);
      source.close();
    };
  }, [loadList, loadDetail]);

  // Keep the newest message in view.
  const messageCount = detail?.messages.length ?? 0;
  useEffect(() => {
    scroller.current?.scrollTo({ top: scroller.current.scrollHeight });
  }, [messageCount, detail?.id]);

  function select(id: string | null) {
    setSelectedId(id);
    setDetail(null);
    setDraft("");
    setError(null);
    // Keep the address shareable without a page navigation.
    window.history.replaceState(null, "", id ? `?c=${id}` : window.location.pathname);
    if (id) {
      // Opening a conversation reads it: clear the unread dot at once instead of waiting for the server.
      setItems((list) => list?.map((item) => (item.id === id ? { ...item, unread: false } : item)) ?? list);
      selectedRef.current = id; // loadDetail checks this before applying its result
      void loadDetail(id);
    }
  }

  async function act(action: "takeover" | "return" | "close" | "reopen" | "reply", text?: string) {
    if (!selectedId || busy) return;
    setBusy(true);
    setError(null);
    try {
      const res = await fetch(`/api/inbox/conversations/${selectedId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, text }),
      });
      if (!res.ok) {
        const body = (await res.json().catch(() => ({}))) as { error?: string };
        setError(body.error ?? "errors.generic");
      } else if (action === "reply") {
        setDraft("");
      }
    } catch {
      setError("errors.generic");
    } finally {
      // Release the controls as soon as the server has answered: the refresh below must not
      // stop the agent from typing and sending straight after taking over.
      setBusy(false);
    }
    void loadDetail(selectedId);
    void loadList();
  }

  const current = detail && detail.id === selectedId ? detail : null;
  const sendReply = () => {
    if (draft.trim()) void act("reply", draft.trim());
  };

  return (
    <div className="mx-auto flex h-[calc(100dvh-10.5rem)] min-h-[30rem] max-w-7xl flex-col gap-4 md:h-[calc(100dvh-8rem)]">
      {/* ------------------------------------------------ banner (hidden on phones while a chat is open) */}
      <section className={cn("hero-surface relative shrink-0 overflow-hidden rounded-3xl p-4 text-white shadow-xl sm:p-5", selectedId && "hidden md:block")}>
        <DotPattern className="text-white/10" />
        <ChatScene className="pointer-events-none absolute -end-16 -top-10 w-48 opacity-20 lg:end-[30rem] lg:-top-12 lg:w-52 lg:opacity-30" />
        <div className="relative flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2.5">
              <h1 className="text-2xl font-bold tracking-tight sm:text-[28px]">{t("inbox.title")}</h1>
              <span
                className={cn(
                  "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ring-1",
                  live ? "bg-[#00c057]/15 text-[#7ef0b0] ring-[#00c057]/30" : "bg-white/10 text-white/70 ring-white/15",
                )}
              >
                <span className={cn("size-1.5 rounded-full bg-current", live && "animate-pulse")} />
                {live ? t("inbox.live") : t("inbox.reconnecting")}
              </span>
            </div>
            <p className="mt-1 hidden text-sm text-white/60 sm:block">{t("inbox.subtitle")}</p>
          </div>
          <div className="grid grid-cols-3 gap-2 sm:gap-2.5 lg:w-[28rem] lg:shrink-0">
            <HeroStat icon={Mail} label={t("inbox.statUnread")} value={counts?.unread ?? null} highlight />
            <HeroStat icon={Headset} label={t("inbox.statWaiting")} value={counts?.needs_human ?? null} highlight />
            <HeroStat icon={MessagesSquare} label={t("inbox.statTotal")} value={counts?.all ?? null} />
          </div>
        </div>
      </section>

      {/* ------------------------------------------------ list + conversation */}
      <div className="card-surface grid min-h-0 flex-1 overflow-hidden rounded-2xl border border-border/70 shadow-[0_1px_2px_rgb(16_24_40/0.04),0_8px_24px_-8px_rgb(16_24_40/0.1)] md:grid-cols-[22rem_minmax(0,1fr)] lg:grid-cols-[24rem_minmax(0,1fr)]">
        {/* list */}
        <aside className={cn("flex min-h-0 min-w-0 flex-col border-border/70 md:border-e", selectedId && "hidden md:flex")}>
          <div className="flex flex-col gap-3 border-b border-border/70 p-3.5">
            <label className="relative block">
              <Search className="pointer-events-none absolute start-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                role="searchbox"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={t("inbox.search")}
                aria-label={t("inbox.search")}
                dir="auto"
                className="h-10 w-full min-w-0 rounded-full border border-input bg-background ps-10 pe-4 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-4 focus-visible:ring-ring/15"
              />
            </label>
            {/* A fixed two-by-two grid: the filters never need to scroll sideways. */}
            <div role="tablist" className="grid grid-cols-2 gap-1.5">
              {FILTERS.map((f) => (
                <button
                  key={f}
                  type="button"
                  role="tab"
                  aria-selected={filter === f}
                  onClick={() => setFilter(f)}
                  className={cn(
                    "flex h-9 min-w-0 items-center gap-2 rounded-xl border px-3 text-[13px] font-medium transition-colors",
                    filter === f
                      ? "border-foreground bg-foreground text-background shadow-sm"
                      : "border-border/80 bg-background text-muted-foreground hover:border-foreground/30 hover:text-foreground",
                  )}
                >
                  <span className={cn("size-2 shrink-0 rounded-full", filter === f && f === "all" ? "bg-background" : FILTER_DOT[f])} />
                  <span className="min-w-0 flex-1 truncate text-start">{t(`inbox.filters.${f}`)}</span>
                  <span className={cn("shrink-0 rounded-full px-1.5 text-[11px] tabular-nums", filter === f ? "bg-white/20" : "bg-muted")}>
                    {counts ? counts[f] : "–"}
                  </span>
                </button>
              ))}
            </div>
          </div>

          <div className="min-h-0 flex-1 overflow-x-hidden overflow-y-auto p-2">
            {items === null ? (
              <div className="flex justify-center p-8 text-muted-foreground">
                <Loader2 className="size-5 animate-spin" />
              </div>
            ) : items.length === 0 ? (
              <div className="flex flex-col items-center gap-1.5 px-4 py-8 text-center">
                <InboxScene className="w-40" />
                <p className="text-sm font-semibold">{search ? t("inbox.noResults") : t("inbox.emptyList")}</p>
                {!search && <p className="max-w-56 text-xs text-muted-foreground">{t("inbox.emptyListHint")}</p>}
              </div>
            ) : (
              <ul className="flex flex-col gap-1">
                {items.map((c) => {
                  const selected = selectedId === c.id;
                  const label = visitorLabel(c);
                  return (
                    <li key={c.id} className="min-w-0">
                      <button
                        type="button"
                        onClick={() => select(c.id)}
                        aria-current={selected}
                        className={cn(
                          "flex w-full min-w-0 items-start gap-3 rounded-xl border p-3 text-start transition-all outline-none focus-visible:ring-4 focus-visible:ring-ring/15",
                          selected
                            ? "border-primary/30 bg-gradient-to-br from-accent to-white shadow-[0_4px_14px_-6px_rgb(0_102_255/0.35)]"
                            : "border-transparent hover:border-border/80 hover:bg-background",
                        )}
                      >
                        <span className="relative shrink-0">
                          <VisitorAvatar label={label} status={c.status} anonymous={!c.visitorName} />
                          {c.unread && (
                            <span role="img" aria-label={t("inbox.unread")} className="absolute -end-0.5 -top-0.5 size-3 rounded-full bg-primary ring-2 ring-white" />
                          )}
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="flex items-baseline justify-between gap-2">
                            <span className={cn("truncate text-sm", c.unread ? "font-bold" : "font-semibold")} dir="auto">
                              {label}
                            </span>
                            <span className="shrink-0 text-[11px] text-muted-foreground">{ago(c.lastMessageAt)}</span>
                          </span>
                          <span className={cn("mt-0.5 flex items-center gap-1.5 text-[13px]", c.unread ? "text-foreground" : "text-muted-foreground")}>
                            {c.preview && c.preview.role !== "customer" && (
                              <span className="shrink-0 text-muted-foreground">{c.preview.role === "agent" ? <UserRound className="size-3.5" /> : <Bot className="size-3.5" />}</span>
                            )}
                            <span className="truncate" dir="auto">
                              {c.preview ? c.preview.content : t("inbox.noMessages")}
                            </span>
                          </span>
                          <span className="mt-2 block">
                            <StatusPill status={c.status} />
                          </span>
                        </span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </aside>

        {/* conversation */}
        <section className={cn("flex min-h-0 min-w-0 flex-col", !selectedId && "hidden md:flex")}>
          {!selectedId ? (
            <div className="flex flex-1 flex-col items-center justify-center gap-1.5 bg-muted/40 p-8 text-center">
              <InboxScene className="w-56" />
              <p className="text-lg font-semibold">{t("inbox.selectPrompt")}</p>
              <p className="max-w-xs text-sm text-muted-foreground">{t("inbox.selectHint")}</p>
            </div>
          ) : (
            <>
              <header className="flex min-w-0 flex-wrap items-center gap-x-3 gap-y-2 border-b border-border/70 bg-background/80 p-3 backdrop-blur md:px-5">
                <Button variant="ghost" size="icon" className="shrink-0 md:hidden" onClick={() => select(null)} aria-label={t("inbox.back")}>
                  <ArrowLeft className="rtl:-scale-x-100" />
                </Button>
                {current ? (
                  <>
                    <VisitorAvatar label={visitorLabel(current)} status={current.status} anonymous={!current.visitorName} />
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-semibold" dir="auto">
                        {visitorLabel(current)}
                      </p>
                      <p className="flex min-w-0 flex-wrap items-center gap-x-3 text-xs text-muted-foreground">
                        {current.visitorPhone && (
                          <a href={`tel:${current.visitorPhone}`} dir="ltr" className="inline-flex items-center gap-1 hover:text-foreground">
                            <Phone className="size-3" />
                            {current.visitorPhone}
                          </a>
                        )}
                        {current.status === "human" && current.assignedAgent ? (
                          <span className="truncate">{t("inbox.handledBy", { name: current.assignedAgent.name ?? current.assignedAgent.email })}</span>
                        ) : (
                          !current.visitorPhone && <span>{t("inbox.channelWeb")}</span>
                        )}
                      </p>
                    </div>
                    <StatusPill status={current.status} />
                    <div className="flex w-full flex-wrap gap-2 lg:w-auto">
                      {current.status === "human" && (
                        <Button size="sm" variant="outline" disabled={busy} onClick={() => act("return")}>
                          <Sparkles />
                          {t("inbox.returnToAi")}
                        </Button>
                      )}
                      {current.status === "closed" ? (
                        <Button size="sm" variant="outline" disabled={busy} onClick={() => act("reopen")}>
                          <RotateCcw />
                          {t("inbox.reopen")}
                        </Button>
                      ) : (
                        <Button size="sm" variant="ghost" disabled={busy} onClick={() => act("close")}>
                          <CheckCircle2 />
                          {t("inbox.close")}
                        </Button>
                      )}
                    </div>
                  </>
                ) : (
                  <div className="h-10 flex-1" />
                )}
              </header>

              <div
                ref={scroller}
                className="flex min-h-0 flex-1 flex-col gap-3 overflow-x-hidden overflow-y-auto bg-muted/50 bg-[radial-gradient(circle_at_1px_1px,rgb(27_27_32/0.06)_1px,transparent_0)] bg-[length:18px_18px] p-4 md:p-6"
                aria-live="polite"
              >
                {!current && !error && (
                  <div className="flex flex-1 items-center justify-center text-muted-foreground">
                    <Loader2 className="size-5 animate-spin" />
                  </div>
                )}
                {current?.messages.map((m) => (
                  <MessageRow key={m.id} message={m} time={format.dateTime(new Date(m.createdAt), { hour: "numeric", minute: "2-digit" })} />
                ))}
              </div>

              <footer className="border-t border-border/70 bg-background p-3 md:px-5 md:py-4">
                {error && (
                  <p role="alert" className="mb-2 rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">
                    {t(error)}
                  </p>
                )}
                {current?.status === "human" ? (
                  <form
                    className="flex items-end gap-2"
                    onSubmit={(e) => {
                      e.preventDefault();
                      sendReply();
                    }}
                  >
                    <textarea
                      value={draft}
                      onChange={(e) => setDraft(e.target.value)}
                      onKeyDown={(e) => {
                        // Enter sends; Shift+Enter makes a new line.
                        if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) {
                          e.preventDefault();
                          sendReply();
                        }
                      }}
                      rows={1}
                      maxLength={2000}
                      dir="auto"
                      placeholder={t("inbox.replyPlaceholder")}
                      aria-label={t("inbox.replyPlaceholder")}
                      className="field-sizing-content max-h-36 min-h-11 min-w-0 flex-1 resize-none rounded-3xl border border-input bg-background px-4 py-2.5 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-4 focus-visible:ring-ring/15"
                    />
                    <Button type="submit" size="icon-lg" className="shrink-0 rounded-full" disabled={busy || !draft.trim()} aria-label={t("inbox.send")}>
                      <SendHorizontal className="rtl:-scale-x-100" />
                    </Button>
                  </form>
                ) : current?.status === "closed" ? (
                  <p className="flex items-center gap-2 text-sm text-muted-foreground">
                    <CheckCircle2 className="size-4 shrink-0" />
                    {t("inbox.hintClosed")}
                  </p>
                ) : current ? (
                  // Not taken over yet: explain who is answering and offer the takeover.
                  <div
                    className={cn(
                      "flex flex-wrap items-center gap-3 rounded-2xl border p-3",
                      current.status === "needs_human" ? "border-[#f5c56b] bg-[#fff8e8]" : "border-border/70 bg-gradient-to-br from-accent/60 to-white",
                    )}
                  >
                    <span
                      className={cn(
                        "flex size-9 shrink-0 items-center justify-center rounded-full",
                        current.status === "needs_human" ? "bg-[#ffd98a] text-[#7a4700]" : "bg-primary/10 text-primary",
                      )}
                    >
                      {current.status === "needs_human" ? <Headset className="size-[18px]" /> : <Bot className="size-[18px]" />}
                    </span>
                    <p className="min-w-40 flex-1 text-sm">{t(current.status === "needs_human" ? "inbox.hintNeedsHuman" : "inbox.hintAi")}</p>
                    <Button disabled={busy} onClick={() => act("takeover")}>
                      <Hand />
                      {t("inbox.takeOver")}
                    </Button>
                  </div>
                ) : null}
              </footer>
            </>
          )}
        </section>
      </div>
    </div>
  );
}

/** One line of the conversation: customer on one side, the business (AI or agent) on the other. */
function MessageRow({ message, time }: { message: Message; time: string }) {
  const t = useTranslations("inbox");

  if (message.role === "system") {
    const event = decodeSystemEvent(message.content);
    if (!event) return null;
    return (
      <div className="flex items-center gap-3 py-1">
        <span className="h-px flex-1 bg-border" />
        <p className="max-w-[80%] rounded-full bg-background px-3 py-1 text-center text-xs text-muted-foreground shadow-xs ring-1 ring-border/70">
          {t(`events.${event.code}`, { name: event.detail ?? "" })} · {time}
        </p>
        <span className="h-px flex-1 bg-border" />
      </div>
    );
  }

  const fromBusiness = message.role !== "customer";
  const author = message.role === "agent" ? (message.author?.name ?? message.author?.email ?? t("roles.agent")) : t(`roles.${message.role}`);
  const Icon = message.role === "assistant" ? Bot : UserRound;

  return (
    <div className={cn("flex max-w-[88%] min-w-0 flex-col gap-1 md:max-w-[72%]", fromBusiness ? "items-end self-end" : "items-start self-start")}>
      <span className="flex items-center gap-1.5 px-1 text-[11px] text-muted-foreground">
        <Icon className="size-3" />
        {author} · {time}
      </span>
      {/* React escapes message text, so customer input cannot inject markup. Long words and links wrap. */}
      <p
        dir="auto"
        className={cn(
          "max-w-full rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed whitespace-pre-wrap [overflow-wrap:anywhere]",
          message.role === "customer" && "rounded-ss-md bg-background shadow-[0_1px_2px_rgb(16_24_40/0.08)] ring-1 ring-black/5",
          message.role === "assistant" && "rounded-se-md bg-gradient-to-br from-[#2a2a31] to-[#1b1b20] text-white shadow-sm",
          message.role === "agent" && "rounded-se-md bg-gradient-to-br from-[#2f7dff] to-[#0055d6] text-white shadow-[0_4px_12px_-4px_rgb(0_102_255/0.5)]",
        )}
      >
        {message.content}
      </p>
      {message.role === "assistant" && message.answered === false && (
        <span className="rounded-full bg-[#fff1d6] px-2 py-0.5 text-[11px] font-medium text-[#9a5b00]">{t("notInKb")}</span>
      )}
    </div>
  );
}

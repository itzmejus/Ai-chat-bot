/**
 * widget-app.js — the chat application that runs inside the iframe.
 *
 * Plain TypeScript and DOM APIs, no framework, so the bundle stays small.
 * All text from the server or the customer is inserted with `textContent`,
 * never as HTML.
 */
import { readSse } from "../src/lib/sse-client";
import { STYLES } from "./styles";

type Config = {
  key: string;
  token: string;
  businessName: string;
  assistantName: string;
  greeting: string;
  brandColor: string;
  logoUrl: string | null;
  position: "left" | "right";
  preChatForm: boolean;
  language: "en" | "ar" | "both";
  preview: boolean;
  previewOrigin: string | null;
};
type Role = "customer" | "assistant" | "agent";
type Locale = "en" | "ar";

const TEXT: Record<Locale, Record<string, string>> = {
  en: {
    online: "Online",
    placeholder: "Type a message…",
    send: "Send",
    open: "Open chat",
    close: "Close chat",
    human: "Talk to a human",
    humanRequested: "A team member has been notified",
    paused: "A team member is handling this chat and will reply here.",
    formIntro: "Please tell us who you are so we can help you better.",
    name: "Name",
    phone: "Phone number",
    start: "Start chat",
    formError: "Please enter your name and a valid phone number.",
    error: "Something went wrong. Please try again.",
    rateLimited: "You're sending messages too quickly. Please wait a moment.",
    typing: "Typing",
  },
  ar: {
    online: "متصل الآن",
    placeholder: "اكتب رسالة…",
    send: "إرسال",
    open: "فتح المحادثة",
    close: "إغلاق المحادثة",
    human: "التحدث مع موظف",
    humanRequested: "تم إبلاغ أحد أعضاء الفريق",
    paused: "أحد أعضاء الفريق يتابع هذه المحادثة وسيرد عليك هنا.",
    formIntro: "عرّفنا بنفسك لنتمكن من مساعدتك بشكل أفضل.",
    name: "الاسم",
    phone: "رقم الهاتف",
    start: "بدء المحادثة",
    formError: "يرجى إدخال اسمك ورقم هاتف صحيح.",
    error: "حدث خطأ ما. يرجى المحاولة مرة أخرى.",
    rateLimited: "أنت ترسل الرسائل بسرعة كبيرة. يرجى الانتظار قليلاً.",
    typing: "يكتب",
  },
};

const ICONS = {
  chat: '<svg class="i-chat" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 11.5a8.4 8.4 0 0 1-12.300 7.400L3 21l2.100-5.700A8.400 8.400 0 1 1 21 11.500Z"/></svg>',
  close: '<svg class="i-close" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><path d="M6 6l12 12M18 6 6 18"/></svg>',
  down: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="m6 9 6 6 6-6"/></svg>',
  send: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 12 20 4l-5 16-3.500-6.500L4 12Z"/></svg>',
  bot: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="4" y="8" width="16" height="11" rx="3"/><path d="M12 8V4M9 13v2M15 13v2"/></svg>',
  person: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/></svg>',
};

// ---------------------------------------------------------------- state

const config: Config = JSON.parse(document.getElementById("widget-config")!.textContent!);

/** sessionStorage keeps the conversation for this browser session only. The preview keeps nothing. */
const storage = {
  get(name: string): string | null {
    if (config.preview) return null;
    try {
      return sessionStorage.getItem(`cw:${config.key}:${name}`);
    } catch {
      return null; // storage blocked: the chat still works, it just is not remembered
    }
  },
  set(name: string, value: string) {
    if (config.preview) return;
    try {
      sessionStorage.setItem(`cw:${config.key}:${name}`, value);
    } catch {
      /* ignore */
    }
  },
};

function randomId(): string {
  const bytes = crypto.getRandomValues(new Uint8Array(18));
  return btoa(String.fromCharCode(...bytes)).replace(/\+/g, "-").replace(/\//g, "_");
}

const visitorId = storage.get("visitor") ?? randomId();
storage.set("visitor", visitorId);
let conversationId = storage.get("conversation") ?? undefined;

const hasArabic = (s: string) => /[؀-ۿ]/.test(s);
let locale: Locale =
  config.language === "ar" || (config.language === "both" && navigator.language.toLowerCase().startsWith("ar")) ? "ar" : "en";
const t = (key: string) => TEXT[locale][key];

let open = config.preview; // the dashboard preview shows the window straight away
let busy = false;
let needsForm = config.preChatForm && !conversationId;
let humanRequested = false;

// ---------------------------------------------------------------- DOM

function el<K extends keyof HTMLElementTagNameMap>(tag: K, className?: string, text?: string): HTMLElementTagNameMap[K] {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
}

document.head.appendChild(el("style", undefined, STYLES));

const root = el("div", "mw");
const panel = el("section", "mw-panel");
const header = el("header", "mw-header");
const avatar = el("div", "mw-avatar");
const title = el("div", "mw-title");
const titleName = el("b");
const titleStatus = el("span");
const closeButton = el("button", "mw-close");
const messages = el("div", "mw-messages");
const footer = el("div", "mw-footer");
const launcher = el("button", "mw-launcher");

closeButton.type = "button";
closeButton.innerHTML = ICONS.down;
launcher.type = "button";
launcher.innerHTML = ICONS.chat + ICONS.close;
messages.setAttribute("aria-live", "polite");
title.append(titleName, titleStatus);
header.append(avatar, title, closeButton);
panel.append(header, messages, footer);
root.append(panel, launcher);
document.body.appendChild(root);

/** Black or white, whichever reads better on the brand colour. */
function textOn(hex: string): string {
  const m = /^#?([0-9a-f]{6})$/i.exec(hex);
  if (!m) return "#fff";
  const n = parseInt(m[1], 16);
  const luminance = (0.299 * (n >> 16) + 0.587 * ((n >> 8) & 255) + 0.114 * (n & 255)) / 255;
  return luminance > 0.62 ? "#1b1b20" : "#fff";
}

/** Apply everything that depends on settings or language. Safe to call repeatedly. */
function render() {
  // Text direction applies inside the window only. The outer layout stays left-to-right so that
  // "left" and "right" keep their physical meaning for the bubble position.
  root.dir = "ltr";
  panel.dir = locale === "ar" ? "rtl" : "ltr";
  root.dataset.side = config.position;
  root.dataset.open = String(open);
  root.dataset.preview = String(config.preview);
  root.style.setProperty("--brand", config.brandColor);
  root.style.setProperty("--on-brand", textOn(config.brandColor));

  avatar.replaceChildren();
  if (config.logoUrl) {
    const img = el("img");
    img.src = config.logoUrl;
    img.alt = "";
    img.onerror = () => (avatar.innerHTML = ICONS.bot); // broken logo: fall back to the icon
    avatar.appendChild(img);
  } else {
    avatar.innerHTML = ICONS.bot;
  }
  titleName.textContent = config.assistantName;
  titleName.dir = "auto";
  titleStatus.textContent = `${t("online")} · ${config.businessName}`;
  closeButton.setAttribute("aria-label", t("close"));
  launcher.setAttribute("aria-label", open ? t("close") : t("open"));
  greetingBubble.textContent = config.greeting;
  greetingBubble.hidden = !config.greeting;
  renderFooter();
}

function scrollToEnd() {
  messages.scrollTop = messages.scrollHeight;
}

function addMessage(role: Role | "error", text: string): HTMLDivElement {
  const bubble = el("div", `mw-msg ${role}`, text);
  bubble.dir = "auto";
  messages.appendChild(bubble);
  scrollToEnd();
  return bubble;
}

function addNote(text: string) {
  messages.appendChild(el("div", "mw-note", text));
  scrollToEnd();
}

const greetingBubble = addMessage("assistant", config.greeting);

// ---------------------------------------------------------------- server calls

async function api(path: string, body: Record<string, unknown>): Promise<Response> {
  const res = await fetch(`/api/widget/${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${config.token}` },
    body: JSON.stringify({ visitorId, conversationId, ...body }),
  });
  // The token lasts 12 hours. If the page was left open longer, reload to get a new one.
  if (res.status === 401 && !sessionStorageFlag("reloaded")) location.reload();
  return res;
}

function sessionStorageFlag(name: string): boolean {
  const seen = storage.get(name) === "1";
  storage.set(name, "1");
  return seen;
}

function setConversation(id: string) {
  conversationId = id;
  storage.set("conversation", id);
}

function showError(code?: string) {
  addMessage("error", code === "rate_limited" ? t("rateLimited") : t("error"));
}

async function restore() {
  if (!conversationId) return;
  try {
    const res = await api("session", {});
    if (!res.ok) return;
    const data = (await res.json()) as { conversationId: string | null; status: string | null; messages: { role: Role; content: string }[] };
    if (!data.conversationId) {
      // Unknown or closed: start fresh next time.
      conversationId = undefined;
      needsForm = config.preChatForm;
      renderFooter();
      return;
    }
    for (const m of data.messages) addMessage(m.role, m.content);
    if (data.status === "needs_human" || data.status === "human") humanRequested = true;
    renderFooter();
  } catch {
    /* offline: the visitor can still type */
  }
}

async function sendMessage(text: string) {
  if (busy) return;
  busy = true;
  renderFooter();

  // Follow the customer's language: an Arabic message switches the widget to Arabic, and back.
  const next: Locale = hasArabic(text) ? "ar" : /[A-Za-z]{2,}/.test(text) ? "en" : locale;
  if (next !== locale) {
    locale = next;
    render();
  }

  addMessage("customer", text);
  const reply = addMessage("assistant", "");
  const typing = el("span", "mw-typing");
  typing.setAttribute("role", "status");
  typing.setAttribute("aria-label", t("typing"));
  typing.append(el("i"), el("i"), el("i"));
  reply.appendChild(typing);

  let received = "";
  try {
    const res = await api("message", { text });
    if (!res.ok) {
      const body = (await res.json().catch(() => ({}))) as { error?: string };
      reply.remove();
      if (body.error === "form_required") {
        needsForm = true;
      } else {
        showError(body.error);
      }
      return;
    }
    for await (const { event, data } of readSse(res)) {
      if (event === "conversation") setConversation((data as { id: string }).id);
      else if (event === "token") {
        received += (data as { text: string }).text;
        reply.textContent = received;
        scrollToEnd();
      } else if (event === "done") {
        const done = data as { needsHuman: boolean; paused: boolean };
        if (done.paused) {
          // An agent has taken over: the AI stays silent.
          reply.remove();
          addNote(t("paused"));
        }
      } else if (event === "error") {
        if (!received) reply.remove();
        showError();
      }
    }
    if (!received && reply.isConnected && reply.contains(typing)) reply.remove();
  } catch {
    if (!received) reply.remove();
    showError();
  } finally {
    busy = false;
    renderFooter();
  }
}

async function requestHuman() {
  if (busy || humanRequested) return;
  busy = true;
  renderFooter();
  try {
    const res = await api("human", { locale });
    const body = (await res.json().catch(() => ({}))) as { error?: string; conversationId?: string; message?: { content: string } };
    if (!res.ok) {
      if (body.error === "form_required") needsForm = true;
      else showError(body.error);
      return;
    }
    if (body.conversationId) setConversation(body.conversationId);
    humanRequested = true;
    if (body.message) addMessage("assistant", body.message.content);
  } catch {
    showError();
  } finally {
    busy = false;
    renderFooter();
  }
}

// ---------------------------------------------------------------- footer (form or composer)

function renderFooter() {
  footer.replaceChildren();

  if (needsForm) {
    const form = el("form", "mw-form");
    form.noValidate = true;
    const intro = el("p", undefined, t("formIntro"));
    const nameLabel = el("label", undefined, t("name"));
    const nameInput = el("input");
    nameInput.name = "name";
    nameInput.autocomplete = "name";
    nameInput.maxLength = 80;
    nameInput.dir = "auto";
    const phoneLabel = el("label", undefined, t("phone"));
    const phoneInput = el("input");
    phoneInput.name = "phone";
    phoneInput.type = "tel";
    phoneInput.autocomplete = "tel";
    phoneInput.dir = "ltr";
    phoneInput.placeholder = "+971 50 123 4567";
    const error = el("p", "err");
    error.hidden = true;
    const submit = el("button", undefined, t("start"));
    submit.type = "submit";
    nameLabel.appendChild(nameInput);
    phoneLabel.appendChild(phoneInput);
    form.append(intro, nameLabel, phoneLabel, error, submit);

    form.addEventListener("submit", async (event) => {
      event.preventDefault();
      const name = nameInput.value.trim();
      const phone = phoneInput.value.trim();
      if (!name || !/^\+?[0-9][0-9\s-]{6,20}$/.test(phone)) {
        error.textContent = t("formError");
        error.hidden = false;
        return;
      }
      submit.disabled = true;
      try {
        const res = await api("start", { name, phone });
        const body = (await res.json().catch(() => ({}))) as { error?: string; conversationId?: string };
        if (res.ok && body.conversationId) {
          setConversation(body.conversationId);
          needsForm = false;
          renderFooter();
        } else {
          error.textContent = body.error === "rate_limited" ? t("rateLimited") : body.error === "invalid" ? t("formError") : t("error");
          error.hidden = false;
          submit.disabled = false;
        }
      } catch {
        error.textContent = t("error");
        error.hidden = false;
        submit.disabled = false;
      }
    });
    footer.appendChild(form);
    return;
  }

  const human = el("button", "mw-human");
  human.type = "button";
  human.innerHTML = ICONS.person;
  human.appendChild(el("span", undefined, humanRequested ? t("humanRequested") : t("human")));
  human.disabled = busy || humanRequested;
  human.addEventListener("click", requestHuman);

  const composer = el("form", "mw-composer");
  const input = el("textarea");
  input.rows = 1;
  input.maxLength = 2000;
  input.dir = "auto";
  input.placeholder = t("placeholder");
  input.setAttribute("aria-label", t("placeholder"));
  const send = el("button", "mw-send");
  send.type = "submit";
  send.innerHTML = ICONS.send;
  send.setAttribute("aria-label", t("send"));
  send.disabled = true;

  const refresh = () => {
    send.disabled = busy || !input.value.trim();
    input.style.height = "auto";
    input.style.height = `${Math.min(input.scrollHeight, 110)}px`;
  };
  input.addEventListener("input", refresh);
  input.addEventListener("keydown", (event) => {
    // Enter sends; Shift+Enter makes a new line. Ignore Enter while an IME is composing.
    if (event.key === "Enter" && !event.shiftKey && !event.isComposing) {
      event.preventDefault();
      composer.requestSubmit();
    }
  });
  composer.addEventListener("submit", (event) => {
    event.preventDefault();
    const text = input.value.trim();
    if (!text || busy) return;
    void sendMessage(text);
  });
  composer.append(input, send);
  footer.append(human, composer);
  // Keep the cursor in the box between messages (not on first load, to avoid stealing focus from the host page).
  if (open && !busy && document.hasFocus()) input.focus();
}

// ---------------------------------------------------------------- open / close and host page messaging

const post = (message: Record<string, unknown>) => window.parent.postMessage(message, "*");

function setOpen(value: boolean) {
  open = value;
  if (value) {
    // Let the host page enlarge the iframe first, then show the window.
    post({ type: "chat-widget:state", open: true });
    requestAnimationFrame(() => {
      render();
      scrollToEnd();
      footer.querySelector<HTMLElement>("textarea, input")?.focus();
    });
  } else {
    render();
    // Shrink the iframe after the window has gone, so nothing is clipped mid-frame.
    requestAnimationFrame(() => post({ type: "chat-widget:state", open: false }));
  }
}

launcher.addEventListener("click", () => setOpen(!open));
closeButton.addEventListener("click", () => setOpen(false));
document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && open && !config.preview) setOpen(false);
});

window.addEventListener("message", (event) => {
  const data = event.data as { type?: string; mobile?: boolean; config?: Partial<Config> };
  if (event.source !== window.parent || !data?.type) return;

  if (data.type === "chat-widget:host") {
    root.dataset.mobile = String(Boolean(data.mobile));
  } else if (data.type === "chat-widget:preview" && config.preview && event.origin === config.previewOrigin && data.config) {
    // Unsaved settings pushed by the dashboard's live preview.
    const c = data.config;
    if (typeof c.assistantName === "string") config.assistantName = c.assistantName;
    if (typeof c.greeting === "string") config.greeting = c.greeting;
    if (typeof c.brandColor === "string" && /^#[0-9a-f]{6}$/i.test(c.brandColor)) config.brandColor = c.brandColor;
    if (c.logoUrl === null || typeof c.logoUrl === "string") config.logoUrl = c.logoUrl || null;
    if (c.position === "left" || c.position === "right") config.position = c.position;
    if (typeof c.preChatForm === "boolean") {
      config.preChatForm = c.preChatForm;
      needsForm = c.preChatForm && !conversationId;
    }
    render();
  }
});

render();
void restore();
post({ type: "chat-widget:ready", position: config.position });

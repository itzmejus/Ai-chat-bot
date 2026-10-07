/**
 * widget-app.js — the chat application that runs inside the iframe.
 *
 * Plain TypeScript and DOM APIs, no framework, so the bundle stays small.
 * All text from the server or the customer is inserted with `textContent`,
 * never as HTML.
 */
import { CHAT_LOCALES, chatLocaleFromTag, detectChatLocale, isRtlLocale, type ChatLocale } from "../src/lib/chat-locales";
import { LOGO_BUBBLE, LOGO_SPARK } from "../src/lib/logo";
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
  /** Show `featured` under the greeting when the chat opens. */
  showProducts: boolean;
  featured: Product[];
  language: "en" | "ar" | "both";
  /** The platform's name and site, for the small "Powered by" line. */
  poweredBy: { name: string; url: string } | null;
  preview: boolean;
  previewOrigin: string | null;
};
type Role = "customer" | "assistant" | "agent";
/** A product as the server sends it for a card (see ProductCard in src/server/products.ts). */
type Product = {
  id: string;
  name: string;
  description: string;
  category: string | null;
  price: number | null;
  currency: string;
  imageUrl: string | null;
  url: string | null;
  available: boolean;
};
type Locale = ChatLocale;

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
    agentJoined: "A team member joined the chat",
    returnedToAi: "You are chatting with the assistant again",
    chatClosed: "This chat has ended. Send a message to start a new one.",
    poweredBy: "Powered by",
    back: "Back to chat",
    askAbout: "Ask about this",
    interested: "I'm interested",
    interestedIn: "I'm interested in {name}",
    askingAbout: "Asking about",
    clearProduct: "Stop asking about this",
    unavailable: "Currently unavailable",
    viewOnSite: "View on website",
    viewDetails: "View details",
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
    agentJoined: "انضم أحد أعضاء الفريق إلى المحادثة",
    returnedToAi: "أنت تتحدث مع المساعد مرة أخرى",
    chatClosed: "انتهت هذه المحادثة. أرسل رسالة لبدء محادثة جديدة.",
    poweredBy: "بدعم من",
    back: "العودة إلى المحادثة",
    askAbout: "اسأل عنه",
    interested: "أنا مهتم",
    interestedIn: "أنا مهتم بـ {name}",
    askingAbout: "تسأل عن",
    clearProduct: "إيقاف السؤال عنه",
    unavailable: "غير متاح حالياً",
    viewOnSite: "عرض على الموقع",
    viewDetails: "عرض التفاصيل",
  },
  fr: {
    online: "En ligne",
    placeholder: "Écrivez un message…",
    send: "Envoyer",
    open: "Ouvrir le chat",
    close: "Fermer le chat",
    human: "Parler à un conseiller",
    humanRequested: "Un membre de l'équipe a été prévenu",
    paused: "Un membre de l'équipe s'occupe de cette conversation et vous répondra ici.",
    formIntro: "Dites-nous qui vous êtes pour que nous puissions mieux vous aider.",
    name: "Nom",
    phone: "Numéro de téléphone",
    start: "Démarrer le chat",
    formError: "Veuillez saisir votre nom et un numéro de téléphone valide.",
    error: "Une erreur s'est produite. Veuillez réessayer.",
    rateLimited: "Vous envoyez des messages trop rapidement. Veuillez patienter un instant.",
    typing: "Écrit",
    agentJoined: "Un membre de l'équipe a rejoint la conversation",
    returnedToAi: "Vous discutez de nouveau avec l'assistant",
    chatClosed: "Cette conversation est terminée. Envoyez un message pour en commencer une nouvelle.",
    poweredBy: "Propulsé par",
    back: "Retour au chat",
    askAbout: "Poser une question",
    interested: "Ça m'intéresse",
    interestedIn: "Je suis intéressé(e) par {name}",
    askingAbout: "À propos de",
    clearProduct: "Ne plus parler de ce produit",
    unavailable: "Indisponible pour le moment",
    viewOnSite: "Voir sur le site",
    viewDetails: "Voir les détails",
  },
  hi: {
    online: "ऑनलाइन",
    placeholder: "संदेश लिखें…",
    send: "भेजें",
    open: "चैट खोलें",
    close: "चैट बंद करें",
    human: "किसी व्यक्ति से बात करें",
    humanRequested: "टीम के एक सदस्य को सूचित कर दिया गया है",
    paused: "टीम का एक सदस्य यह चैट संभाल रहा है और यहीं जवाब देगा।",
    formIntro: "कृपया अपना परिचय दें ताकि हम आपकी बेहतर मदद कर सकें।",
    name: "नाम",
    phone: "फ़ोन नंबर",
    start: "चैट शुरू करें",
    formError: "कृपया अपना नाम और सही फ़ोन नंबर दर्ज करें।",
    error: "कुछ गड़बड़ हो गई। कृपया फिर से कोशिश करें।",
    rateLimited: "आप बहुत तेज़ी से संदेश भेज रहे हैं। कृपया थोड़ा रुकें।",
    typing: "लिख रहा है",
    agentJoined: "टीम का एक सदस्य चैट में शामिल हुआ",
    returnedToAi: "आप फिर से सहायक से बात कर रहे हैं",
    chatClosed: "यह चैट समाप्त हो गई है। नई चैट शुरू करने के लिए संदेश भेजें।",
    poweredBy: "द्वारा संचालित",
    back: "चैट पर वापस जाएँ",
    askAbout: "इसके बारे में पूछें",
    interested: "मुझे दिलचस्पी है",
    interestedIn: "मुझे {name} में दिलचस्पी है",
    askingAbout: "इस बारे में",
    clearProduct: "इसके बारे में पूछना बंद करें",
    unavailable: "फ़िलहाल उपलब्ध नहीं",
    viewOnSite: "वेबसाइट पर देखें",
    viewDetails: "विवरण देखें",
  },
  ur: {
    online: "آن لائن",
    placeholder: "پیغام لکھیں…",
    send: "بھیجیں",
    open: "چیٹ کھولیں",
    close: "چیٹ بند کریں",
    human: "کسی نمائندے سے بات کریں",
    humanRequested: "ٹیم کے ایک رکن کو اطلاع دے دی گئی ہے",
    paused: "ٹیم کا ایک رکن یہ چیٹ دیکھ رہا ہے اور یہیں جواب دے گا۔",
    formIntro: "براہِ کرم اپنا تعارف کرائیں تاکہ ہم آپ کی بہتر مدد کر سکیں۔",
    name: "نام",
    phone: "فون نمبر",
    start: "چیٹ شروع کریں",
    formError: "براہِ کرم اپنا نام اور درست فون نمبر درج کریں۔",
    error: "کچھ غلط ہو گیا۔ براہِ کرم دوبارہ کوشش کریں۔",
    rateLimited: "آپ بہت تیزی سے پیغامات بھیج رہے ہیں۔ براہِ کرم تھوڑا انتظار کریں۔",
    typing: "لکھ رہا ہے",
    agentJoined: "ٹیم کا ایک رکن چیٹ میں شامل ہو گیا",
    returnedToAi: "آپ دوبارہ معاون سے بات کر رہے ہیں",
    chatClosed: "یہ چیٹ ختم ہو گئی ہے۔ نئی چیٹ شروع کرنے کے لیے پیغام بھیجیں۔",
    poweredBy: "پیشکش",
    back: "چیٹ پر واپس جائیں",
    askAbout: "اس کے بارے میں پوچھیں",
    interested: "مجھے دلچسپی ہے",
    interestedIn: "مجھے {name} میں دلچسپی ہے",
    askingAbout: "اس بارے میں",
    clearProduct: "اس کے بارے میں پوچھنا بند کریں",
    unavailable: "فی الحال دستیاب نہیں",
    viewOnSite: "ویب سائٹ پر دیکھیں",
    viewDetails: "تفصیل دیکھیں",
  },
  ru: {
    online: "В сети",
    placeholder: "Введите сообщение…",
    send: "Отправить",
    open: "Открыть чат",
    close: "Закрыть чат",
    human: "Связаться с сотрудником",
    humanRequested: "Сотрудник уведомлён",
    paused: "Этим чатом занимается сотрудник, он ответит вам здесь.",
    formIntro: "Представьтесь, пожалуйста, чтобы мы могли лучше вам помочь.",
    name: "Имя",
    phone: "Номер телефона",
    start: "Начать чат",
    formError: "Введите имя и корректный номер телефона.",
    error: "Что-то пошло не так. Попробуйте ещё раз.",
    rateLimited: "Вы отправляете сообщения слишком быстро. Подождите немного.",
    typing: "Печатает",
    agentJoined: "К чату подключился сотрудник",
    returnedToAi: "Вы снова общаетесь с ассистентом",
    chatClosed: "Этот чат завершён. Отправьте сообщение, чтобы начать новый.",
    poweredBy: "Работает на",
    back: "Назад в чат",
    askAbout: "Спросить об этом",
    interested: "Мне интересно",
    interestedIn: "Меня интересует {name}",
    askingAbout: "Вопрос о",
    clearProduct: "Больше не спрашивать об этом",
    unavailable: "Сейчас недоступно",
    viewOnSite: "Открыть на сайте",
    viewDetails: "Подробнее",
  },
};

/** The brand mark without its tile: the bubble takes the text colour, the spark the colour behind it. */
const mark = (className: string) =>
  `<svg class="${className}" viewBox="5 6 22 20"><path fill="currentColor" d="${LOGO_BUBBLE}"/><path fill="var(--mark-spark,var(--brand))" d="${LOGO_SPARK}"/></svg>`;

const ICONS = {
  chat: mark("i-chat"),
  close: '<svg class="i-close" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><path d="M6 6l12 12M18 6 6 18"/></svg>',
  down: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="m6 9 6 6 6-6"/></svg>',
  send: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 12 20 4l-5 16-3.500-6.500L4 12Z"/></svg>',
  bot: mark("i-mark"),
  person: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/></svg>',
  back: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="m15 6-6 6 6 6"/></svg>',
  bag: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M6 8h12l1 12H5L6 8Z"/><path d="M9 8V7a3 3 0 0 1 6 0v1"/></svg>',
  link: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 5h5v5M19 5l-8 8M11 7H6v11h11v-5"/></svg>',
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
let conversationId = storage.get("conversation") || undefined;

// A business that serves one language starts in it. Otherwise start in the visitor's own
// language when the widget has it, trying each of the browser's preferred languages in turn.
let locale: Locale =
  config.language !== "both"
    ? config.language
    : ((navigator.languages?.length ? navigator.languages : [navigator.language]).map(chatLocaleFromTag).find(Boolean) ?? "en");
if (!CHAT_LOCALES.includes(locale)) locale = "en";
const t = (key: string) => TEXT[locale][key] ?? TEXT.en[key];

let open = config.preview; // the dashboard preview shows the window straight away
let busy = false;
let needsForm = config.preChatForm && !conversationId;
let humanRequested = false;
/** The product the visitor opened and is asking about; sent along with their next messages. */
let focusProduct: Product | null = null;

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
const detail = el("div", "mw-detail");
const footer = el("div", "mw-footer");
const credit = el("a", "mw-credit");
const launcher = el("button", "mw-launcher");

closeButton.type = "button";
closeButton.innerHTML = ICONS.down;
launcher.type = "button";
launcher.innerHTML = ICONS.chat + ICONS.close;
messages.setAttribute("aria-live", "polite");
title.append(titleName, titleStatus);
header.append(avatar, title, closeButton);
detail.hidden = true;
panel.append(header, messages, detail, footer);
if (config.poweredBy) {
  credit.href = config.poweredBy.url;
  credit.target = "_blank";
  credit.rel = "noopener";
  panel.appendChild(credit);
}
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
  panel.dir = isRtlLocale(locale) ? "rtl" : "ltr";
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
  if (featuredRow) featuredRow.hidden = !config.showProducts;
  if (config.poweredBy) {
    credit.innerHTML = mark("i-mark");
    credit.prepend(el("span", undefined, t("poweredBy")));
    credit.appendChild(el("b", undefined, config.poweredBy.name));
  }
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

// ---------------------------------------------------------------- product cards

function priceText(product: Product): string {
  if (product.price === null) return "";
  try {
    return new Intl.NumberFormat(locale, { style: "currency", currency: product.currency, minimumFractionDigits: Number.isInteger(product.price) ? 0 : 2 }).format(product.price);
  } catch {
    return `${product.currency} ${product.price}`; // a currency code the browser does not know
  }
}

/** The product's photo, or a neutral tile when there is none (or it fails to load). */
function productImage(product: Product, className: string): HTMLElement {
  const frame = el("div", className);
  const placeholder = () => {
    frame.classList.add("empty");
    frame.innerHTML = ICONS.bag;
  };
  if (product.imageUrl) {
    const img = el("img");
    img.src = product.imageUrl;
    img.alt = "";
    img.loading = "lazy";
    img.onerror = placeholder;
    frame.appendChild(img);
  } else {
    placeholder();
  }
  return frame;
}

/** A row of product cards under a reply. Each card opens the product. */
function addProducts(products: Product[]): HTMLDivElement | null {
  if (!products.length) return null;
  const row = el("div", "mw-cards");
  const track = el("div", "mw-cards-track");
  for (const product of products) {
    const card = el("button", "mw-card");
    card.type = "button";
    card.dataset.available = String(product.available);
    const name = el("b", undefined, product.name);
    name.dir = "auto";
    const price = el("span", "price", product.available ? priceText(product) : t("unavailable"));
    card.append(productImage(product, "mw-card-img"), name, price);
    card.setAttribute("aria-label", `${product.name}. ${t("viewDetails")}`);
    card.addEventListener("click", () => openProduct(product));
    track.appendChild(card);
  }

  // Arrows for mouse users, and soft fades at whichever edge has more cards beyond it.
  const arrow = (direction: 1 | -1) => {
    const button = el("button", `mw-cards-arrow ${direction === 1 ? "next" : "prev"}`);
    button.type = "button";
    button.tabIndex = -1; // the cards themselves are reachable with the keyboard
    button.setAttribute("aria-hidden", "true");
    button.innerHTML = ICONS.back;
    button.addEventListener("click", () => {
      // In a right-to-left panel "next" is towards the left.
      const sign = getComputedStyle(track).direction === "rtl" ? -1 : 1;
      track.scrollBy({ left: direction * sign * Math.max(160, track.clientWidth * 0.75), behavior: "smooth" });
    });
    return button;
  };
  const update = () => {
    const offset = Math.abs(track.scrollLeft); // negative in right-to-left layouts
    row.dataset.start = String(offset > 4);
    row.dataset.end = String(offset + track.clientWidth < track.scrollWidth - 4);
  };
  track.addEventListener("scroll", update, { passive: true });
  // The row may be built while the chat is closed (no size yet), and the window can be resized.
  if (typeof ResizeObserver !== "undefined") new ResizeObserver(update).observe(track);

  row.append(track, arrow(-1), arrow(1));
  messages.appendChild(row);
  update();
  scrollToEnd();
  return row;
}

/** Show one product in full over the conversation. */
function openProduct(product: Product) {
  const back = el("button", "mw-detail-back");
  back.type = "button";
  back.innerHTML = ICONS.back;
  back.appendChild(el("span", undefined, t("back")));
  back.addEventListener("click", closeProduct);

  const body = el("div", "mw-detail-body");
  if (product.category) {
    const category = el("span", "mw-detail-category", product.category);
    category.dir = "auto";
    body.appendChild(category);
  }
  const name = el("h2", undefined, product.name);
  name.dir = "auto";
  body.appendChild(name);
  const price = priceText(product);
  if (price) body.appendChild(el("p", "mw-detail-price", price));
  if (!product.available) body.appendChild(el("p", "mw-detail-off", t("unavailable")));
  if (product.description) {
    const description = el("p", "mw-detail-text", product.description);
    description.dir = "auto";
    body.appendChild(description);
  }
  // Only ordinary web links: the address was typed by the business, but check anyway.
  if (product.url && /^https?:\/\//i.test(product.url)) {
    const link = el("a", "mw-detail-link");
    link.href = product.url;
    link.target = "_blank";
    link.rel = "noopener";
    link.innerHTML = ICONS.link;
    link.prepend(el("span", undefined, t("viewOnSite")));
    body.appendChild(link);
  }

  const scroller = el("div", "mw-detail-scroll");
  scroller.append(productImage(product, "mw-detail-img"), body);

  const actions = el("div", "mw-detail-actions");
  const ask = el("button", "secondary", t("askAbout"));
  ask.type = "button";
  ask.addEventListener("click", () => {
    focusProduct = product;
    closeProduct();
  });
  actions.appendChild(ask);
  if (product.available) {
    const interested = el("button", "primary", t("interested"));
    interested.type = "button";
    interested.disabled = busy || needsForm;
    interested.addEventListener("click", () => {
      focusProduct = product;
      closeProduct();
      void sendMessage(t("interestedIn").replace("{name}", product.name));
    });
    actions.appendChild(interested);
  }

  detail.replaceChildren(back, scroller, actions);
  detail.hidden = false;
  panel.dataset.detail = "true";
  back.focus();
}

function closeProduct() {
  detail.hidden = true;
  detail.replaceChildren();
  delete panel.dataset.detail;
  renderFooter();
  scrollToEnd();
  footer.querySelector<HTMLElement>("textarea")?.focus();
}

const greetingBubble = addMessage("assistant", config.greeting);
// A few products straight under the greeting, so there is something to tap before typing.
const featuredRow = addProducts(config.featured ?? []);

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
  void listen();
}

function showError(code?: string) {
  addMessage("error", code === "rate_limited" ? t("rateLimited") : t("error"));
}

/** Message and event ids already shown, so the live stream never repeats one. */
const seen = new Set<string>();

/**
 * Load the conversation from the server and show it. Used when the widget loads
 * (same browser session) and again after the live connection drops, to catch up.
 */
async function sync() {
  if (!conversationId || busy) return;
  try {
    const res = await api("session", {});
    if (!res.ok) return;
    const data = (await res.json()) as { conversationId: string | null; status: string | null; messages: { id: string; role: Role; content: string; products?: Product[] }[] };
    if (!data.conversationId) {
      // Unknown or closed: start fresh next time.
      conversationId = undefined;
      storage.set("conversation", "");
      needsForm = config.preChatForm;
      renderFooter();
      return;
    }
    // Replace what is on screen with the server's record (the greeting stays).
    for (const node of [...messages.children]) if (node !== greetingBubble && node !== featuredRow) node.remove();
    for (const m of data.messages) {
      seen.add(m.id);
      addMessage(m.role, m.content);
      addProducts(m.products ?? []);
    }
    humanRequested = data.status === "needs_human" || data.status === "human";
    renderFooter();
    void listen();
  } catch {
    /* offline: the visitor can still type */
  }
}

// ---------------------------------------------------------------- live updates (agent replies)

let listeningTo: string | undefined;
let stopListening: AbortController | undefined;

/**
 * Keep a connection open for this conversation so replies typed by a team
 * member appear immediately. Reconnects by itself if the connection drops.
 */
async function listen() {
  const id = conversationId;
  if (!id || listeningTo === id) return;
  stopListening?.abort();
  listeningTo = id;
  const controller = (stopListening = new AbortController());
  let connectedBefore = false;

  while (!controller.signal.aborted && conversationId === id) {
    try {
      const res = await fetch(`/api/widget/stream?visitorId=${encodeURIComponent(visitorId)}&conversationId=${encodeURIComponent(id)}`, {
        headers: { Authorization: `Bearer ${config.token}` },
        signal: controller.signal,
      });
      if (res.status === 401 || res.status === 404) break; // token expired or conversation gone
      if (res.ok) {
        if (connectedBefore) void sync(); // catch up on anything missed while disconnected
        connectedBefore = true;
        for await (const { event, data } of readSse(res)) {
          if (event === "message") {
            const m = data as { id: string; content: string };
            if (seen.has(m.id)) continue;
            seen.add(m.id);
            addMessage("agent", m.content);
          } else if (event === "event") {
            const e = data as { id: string; code: string };
            if (seen.has(e.id)) continue;
            seen.add(e.id);
            if (e.code === "agent_joined") {
              humanRequested = true;
              addNote(t("agentJoined"));
            } else if (e.code === "returned_to_ai") {
              humanRequested = false;
              addNote(t("returnedToAi"));
            } else if (e.code === "closed") {
              addNote(t("chatClosed"));
              conversationId = undefined;
              storage.set("conversation", "");
              humanRequested = false;
              needsForm = config.preChatForm;
            }
            renderFooter();
          }
        }
      }
    } catch {
      /* dropped connection: retry below */
    }
    if (controller.signal.aborted || conversationId !== id) break;
    await new Promise((resolve) => setTimeout(resolve, 3000));
  }
  if (listeningTo === id) listeningTo = undefined;
}

async function sendMessage(text: string) {
  if (busy) return;
  busy = true;
  renderFooter();

  // Follow the customer's language: an Arabic message switches the widget to Arabic, and back.
  const next = detectChatLocale(text, locale);
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
    const res = await api("message", { text, productId: focusProduct?.id });
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
        const done = data as { needsHuman: boolean; paused: boolean; products?: Product[] };
        if (done.paused) {
          // An agent has taken over: the AI stays silent.
          reply.remove();
          addNote(t("paused"));
        } else {
          addProducts(done.products ?? []);
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
  footer.append(human);
  if (focusProduct) {
    // Shows which product the next question is about, with a way to drop it.
    const chip = el("div", "mw-focus");
    const label = el("span", undefined, `${t("askingAbout")}: `);
    const name = el("b", undefined, focusProduct.name);
    name.dir = "auto";
    label.appendChild(name);
    const clear = el("button");
    clear.type = "button";
    clear.innerHTML = ICONS.close;
    clear.setAttribute("aria-label", t("clearProduct"));
    clear.addEventListener("click", () => {
      focusProduct = null;
      renderFooter();
    });
    chip.append(label, clear);
    footer.appendChild(chip);
  }
  footer.appendChild(composer);
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
  if (event.key !== "Escape" || !open) return;
  // Escape leaves an open product first, then the chat.
  if (!detail.hidden) closeProduct();
  else if (!config.preview) setOpen(false);
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
    if (typeof c.showProducts === "boolean") config.showProducts = c.showProducts;
    if (typeof c.preChatForm === "boolean") {
      config.preChatForm = c.preChatForm;
      needsForm = c.preChatForm && !conversationId;
    }
    render();
  }
});

render();
void sync();
post({ type: "chat-widget:ready", position: config.position });

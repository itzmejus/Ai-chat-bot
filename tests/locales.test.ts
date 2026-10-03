import { afterEach, describe, expect, it, vi } from "vitest";
import { chatLocaleFromTag, detectChatLocale, isRtlLocale } from "@/lib/chat-locales";
import { sendWhatsAppTemplate, whatsappRecipient } from "@/server/whatsapp/client";

describe("chat widget languages", () => {
  it("maps a browser language to a widget language, or to nothing", () => {
    expect(chatLocaleFromTag("fr-CA")).toBe("fr");
    expect(chatLocaleFromTag("AR")).toBe("ar");
    expect(chatLocaleFromTag("ur-PK")).toBe("ur");
    expect(chatLocaleFromTag("zh-CN")).toBeNull();
    expect(chatLocaleFromTag(undefined)).toBeNull();
  });

  it("follows the script the customer types in", () => {
    expect(detectChatLocale("How much is cleaning?", "ar")).toBe("en");
    expect(detectChatLocale("كم سعر تنظيف الأسنان؟", "en")).toBe("ar");
    expect(detectChatLocale("آپ کے اوقات کیا ہیں؟", "en")).toBe("ur");
    expect(detectChatLocale("दाँतों की सफ़ाई कितने की है?", "en")).toBe("hi");
    expect(detectChatLocale("Сколько стоит чистка?", "en")).toBe("ru");
    expect(detectChatLocale("Vous êtes ouverts le vendredi ?", "en")).toBe("fr");
  });

  it("keeps the current language when the text does not point to another", () => {
    expect(detectChatLocale("👍", "ar")).toBe("ar");
    expect(detectChatLocale("0501234567", "hi")).toBe("hi");
    // No accents here, but the conversation is already in French.
    expect(detectChatLocale("Merci beaucoup", "fr")).toBe("fr");
    // Arabic-script text without Urdu-only letters, in a conversation that is already in Urdu.
    expect(detectChatLocale("شکریہ", "ur")).toBe("ur");
  });

  it("knows which languages are written right to left", () => {
    expect(["en", "ar", "fr", "hi", "ur", "ru"].filter((l) => isRtlLocale(l as "en"))).toEqual(["ar", "ur"]);
  });
});

describe("WhatsApp client", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
  });

  it("formats numbers the way the API expects", () => {
    expect(whatsappRecipient("+971 50 123-4567")).toBe("971501234567");
  });

  it("sends nothing until it is configured", async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);
    vi.spyOn(console, "log").mockImplementation(() => {});
    expect(await sendWhatsAppTemplate("+971501234567", "needs_human_alert", "en", ["Shop", "Ali", "Hello"])).toBe(false);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("sends a template message with cleaned-up variables", async () => {
    vi.stubEnv("WHATSAPP_ACCESS_TOKEN", "token");
    vi.stubEnv("WHATSAPP_PHONE_NUMBER_ID", "12345");
    const fetchMock = vi.fn<(url: string, init: RequestInit) => Promise<Response>>(async () => new Response("{}", { status: 200 }));
    vi.stubGlobal("fetch", fetchMock);

    expect(await sendWhatsAppTemplate("+971 50 123 4567", "needs_human_alert", "ar", ["Shop", "Ali", "line one\nline two\t  end", ""])).toBe(true);

    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toMatch(/^https:\/\/graph\.facebook\.com\/v[\d.]+\/12345\/messages$/);
    expect((init.headers as Record<string, string>).Authorization).toBe("Bearer token");
    const body = JSON.parse(init.body as string);
    expect(body).toMatchObject({ messaging_product: "whatsapp", to: "971501234567", type: "template", template: { name: "needs_human_alert", language: { code: "ar" } } });
    // No line breaks or tabs, and never an empty variable: WhatsApp rejects both.
    expect(body.template.components[0].parameters.map((p: { text: string }) => p.text)).toEqual(["Shop", "Ali", "line one line two end", "–"]);
  });

  it("reports a refusal instead of throwing", async () => {
    vi.stubEnv("WHATSAPP_ACCESS_TOKEN", "token");
    vi.stubEnv("WHATSAPP_PHONE_NUMBER_ID", "12345");
    vi.stubGlobal("fetch", vi.fn(async () => new Response('{"error":{"message":"template not found"}}', { status: 404 })));
    vi.spyOn(console, "error").mockImplementation(() => {});
    expect(await sendWhatsAppTemplate("+971501234567", "missing", "en", ["a", "b", "c"])).toBe(false);
  });
});

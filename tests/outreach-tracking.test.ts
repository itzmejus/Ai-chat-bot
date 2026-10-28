import { NextRequest } from "next/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

const create = vi.fn();
vi.mock("@/server/db/prisma", () => ({ prisma: { outreachClick: { create: (args: unknown) => create(args) } } }));
vi.mock("@/server/background", () => ({ inBackground: (_label: string, work: () => Promise<unknown>) => void work() }));

const { GET } = await import("@/app/go/route");
const { APP_URL, SITE_URL } = await import("@/lib/config");
const { businessSlug, trackedLink } = await import("@/lib/outreach-links");
const { outreachHtml, outreachText } = await import("@/lib/outreach-email");
const { isCountable, parseTrackRequest } = await import("@/server/outreach/tracking");

const CHROME = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0 Safari/537.36";
const go = (query: string, headers: Record<string, string> = { "user-agent": CHROME }) =>
  GET(new NextRequest(`${APP_URL}/go?${query}`, { headers }));

beforeEach(() => create.mockReset());

describe("outreach links", () => {
  it("turns business names into short, safe slugs", () => {
    expect(businessSlug("Bright Smile Dental")).toBe("bright-smile-dental");
    expect(businessSlug("  Café Déjà-Vu & Co.  ")).toBe("cafe-deja-vu-co");
    expect(businessSlug("")).toBe("general");
    expect(businessSlug("عيادة")).toBe("general");
  });

  it("sends every link in the email through /go when tracking is on", () => {
    const settings = { appName: "Selo Assist", siteUrl: "https://www.example.com", signupUrl: "https://app.example.com/signup", contactEmail: "hello@example.com", trackUrl: "https://app.example.com/go" };
    const fields = { firstName: "Sara", businessName: "Bright Smile", personalNote: "", senderName: "Justin", senderAddress: "Dubai", subject: "" };
    const html = outreachHtml(fields, settings);
    expect(html).toContain(`href="${trackedLink(settings.trackUrl, "signup", "Bright Smile", "start").replace(/&/g, "&amp;")}"`);
    expect(html).toContain("to=site&amp;b=bright-smile&amp;btn=image");
    expect(html).not.toContain('href="https://app.example.com/signup"');
    expect(html).toContain('src="https://www.example.com/images/email/hero.png"'); // images still load straight from the site
    expect(outreachText(fields, settings)).toContain("https://app.example.com/go?to=signup&b=bright-smile&btn=text");
  });
});

describe("/go", () => {
  it("only accepts known targets, so it can't redirect to other sites", () => {
    expect(parseTrackRequest(new URLSearchParams("to=https://evil.example&b=x"))).toBeNull();
    expect(parseTrackRequest(new URLSearchParams("b=x"))).toBeNull();
    expect(parseTrackRequest(new URLSearchParams("to=signup&b=Bright Smile&btn=weird"))).toEqual({ target: "signup", business: "bright-smile", button: "text" });
  });

  it("counts people, not link checkers or signed-in users", () => {
    const person = { userAgent: CHROME, signedIn: false };
    expect(isCountable(person)).toBe(true);
    expect(isCountable({ ...person, fetchMode: "navigate" })).toBe(true);
    expect(isCountable({ ...person, signedIn: true })).toBe(false);
    expect(isCountable({ ...person, userAgent: "Mozilla/5.0 (compatible; Microsoft Safe Links)" })).toBe(false);
    expect(isCountable({ ...person, userAgent: "python-requests/2.31" })).toBe(false);
    expect(isCountable({ ...person, userAgent: null })).toBe(false);
  });

  it("skips Instagram, Facebook and WhatsApp link previews", () => {
    for (const userAgent of [
      "facebookexternalhit/1.1 (+http://www.facebook.com/externalhit_uatext.php)",
      "meta-externalagent/1.1 (+https://developers.facebook.com/docs/sharing/webmasters/crawler)",
      "WhatsApp/2.24.6.77 A",
    ]) {
      expect(isCountable({ userAgent, signedIn: false })).toBe(false);
    }
    // The Instagram in-app browser is a real person opening the link.
    const instagramApp = "Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Instagram 350.0.0";
    expect(isCountable({ userAgent: instagramApp, signedIn: false, fetchMode: "navigate" })).toBe(true);
  });

  it("only counts real page opens, once per person per business", () => {
    const person = { userAgent: CHROME, signedIn: false };
    expect(isCountable({ ...person, method: "HEAD" })).toBe(false);
    expect(isCountable({ ...person, fetchMode: "no-cors" })).toBe(false);
    expect(isCountable({ ...person, seen: true })).toBe(false);
  });

  it("does not count the same browser twice within the window", () => {
    const first = go("to=site&b=flowers-ae&btn=site");
    expect(first.cookies.get("selo_seen_flowers-ae")?.value).toBe("1");
    go("to=site&b=flowers-ae&btn=site", { "user-agent": CHROME, cookie: "selo_seen_flowers-ae=1" });
    go("to=site&b=veneno&btn=site", { "user-agent": CHROME, cookie: "selo_seen_flowers-ae=1" });
    expect(create).toHaveBeenCalledTimes(2);
    expect(create).toHaveBeenLastCalledWith({ data: { target: "site", business: "veneno", button: "site" } });
  });

  it("counts the click, remembers the source and forwards with UTM tags", async () => {
    const res = go("to=signup&b=bright-smile&btn=start");
    expect(res.status).toBe(307);
    expect(res.headers.get("location")).toBe(`${APP_URL}/signup?utm_source=outreach&utm_medium=email&utm_campaign=bright-smile&utm_content=start`);
    expect(res.cookies.get("selo_ref")?.value).toBe("outreach:bright-smile");
    expect(create).toHaveBeenCalledWith({ data: { target: "signup", business: "bright-smile", button: "start" } });
  });

  it("sends site links to the public site", () => {
    expect(go("to=site&b=bright-smile&btn=image").headers.get("location")).toBe(
      `${SITE_URL}/?utm_source=outreach&utm_medium=email&utm_campaign=bright-smile&utm_content=image`,
    );
  });

  it("does not count bots or signed-in users, but still forwards them", () => {
    expect(go("to=signup&b=x", { "user-agent": "Mimecast URL scanner" }).status).toBe(307);
    expect(go("to=signup&b=x", { "user-agent": CHROME, cookie: "__Secure-authjs.session-token=abc" }).status).toBe(307);
    expect(create).not.toHaveBeenCalled();
  });

  it("sends anything else to the home page without counting", () => {
    const res = go("to=https://evil.example");
    expect(res.headers.get("location")).toBe(`${SITE_URL}/`);
    expect(res.cookies.get("selo_ref")).toBeUndefined();
    expect(create).not.toHaveBeenCalled();
  });
});

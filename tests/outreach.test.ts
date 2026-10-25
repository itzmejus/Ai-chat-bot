import { describe, expect, it } from "vitest";
import { outreachBody, outreachHtml, outreachSubject, outreachText, type OutreachFields } from "@/lib/outreach-email";
import { INSTAGRAM } from "@/lib/social";

const settings = { appName: "Selo Assist", siteUrl: "https://www.example.com", signupUrl: "https://app.example.com/signup", contactEmail: "hello@example.com" };
const fields: OutreachFields = {
  firstName: "Sara",
  businessName: "Bright Smile",
  personalNote: "",
  senderName: "Justin",
  senderAddress: "Business Bay, Dubai, UAE",
  subject: "{FirstName}, are after-hours enquiries going unanswered?",
};

describe("outreach email", () => {
  it("fills in the business and the sender", () => {
    const html = outreachHtml(fields, settings);
    expect(html).toContain("Hi Sara,");
    expect(html).toContain("could help Bright Smile.");
    expect(html).toContain("Justin");
    expect(html).toContain("Business Bay, Dubai, UAE");
    expect(html).toContain('href="https://app.example.com/signup"');
    expect(html).toContain('src="https://www.example.com/images/email/hero.png"');
    expect(html).toContain("mailto:hello@example.com?subject=Unsubscribe");
    expect(html).toContain(`href="${INSTAGRAM.url}"`);
    expect(outreachText(fields, settings)).toContain(INSTAGRAM.url);
    expect(html).not.toMatch(/\{\{|\{FirstName\}/);
  });

  it("puts the name in the subject, or drops it when there is none", () => {
    expect(outreachSubject(fields)).toBe("Sara, are after-hours enquiries going unanswered?");
    expect(outreachSubject({ ...fields, firstName: "" })).toBe("Are after-hours enquiries going unanswered?");
  });

  it("falls back to friendly defaults when fields are empty", () => {
    const empty = { ...fields, firstName: "", businessName: "" };
    expect(outreachBody(empty, settings)).toContain("Hi there,");
    expect(outreachText(empty, settings)).toContain("could help your business.");
  });

  it("escapes what is typed and keeps line breaks in the opening line", () => {
    const html = outreachBody({ ...fields, businessName: "<b>A&B</b>", personalNote: "Line one\nLine <two>" }, settings);
    expect(html).toContain("&lt;b&gt;A&amp;B&lt;/b&gt;");
    expect(html).toContain("Line one<br>Line &lt;two&gt;");
    expect(html).not.toContain("<b>A&B</b>");
  });
});

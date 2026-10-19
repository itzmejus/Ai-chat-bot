import { beforeEach, describe, expect, it, vi } from "vitest";

// Capture outgoing email instead of sending it.
const sent = vi.hoisted(() => [] as { to: string[]; subject: string; text: string }[]);
vi.mock("@/server/email/mailer", async (original) => {
  const actual = await original<typeof import("@/server/email/mailer")>();
  return {
    ...actual,
    sendEmail: vi.fn(async (to: string | string[], content: import("@/server/email/mailer").EmailContent) => {
      sent.push({ to: Array.isArray(to) ? to : [to], subject: content.subject, text: actual.renderEmail(content).text });
      return true;
    }),
  };
});

import { notifyAdminsOfSignup } from "@/server/admin/admins";
import { prisma } from "@/server/db/prisma";

beforeEach(() => {
  sent.length = 0;
  vi.stubEnv("ADMIN_EMAILS", "hello@example.com, ops@example.com");
});

describe("admin signup alert", () => {
  it("emails every admin with the new account's details", async () => {
    await prisma.user.create({ data: { email: "sara@clinic.example", name: "Sara" } });
    expect(await notifyAdminsOfSignup({ email: "sara@clinic.example", name: "Sara" }, "password")).toBe(true);

    expect(sent).toHaveLength(1);
    expect(sent[0].to).toEqual(["hello@example.com", "ops@example.com"]);
    expect(sent[0].subject).toContain("Sara");
    expect(sent[0].text).toContain("sara@clinic.example");
    expect(sent[0].text).toContain("Email and password");
    expect(sent[0].text).toContain("/admin/users");
  });

  it("says when the account came from Google or an invitation", async () => {
    await notifyAdminsOfSignup({ email: "agent@example.org", name: null }, "google", true);
    expect(sent[0].subject).toContain("agent@example.org");
    expect(sent[0].text).toContain("Google");
    expect(sent[0].text).toContain("From a team invitation");
  });

  it("sends nothing when no admin is listed", async () => {
    vi.stubEnv("ADMIN_EMAILS", "");
    expect(await notifyAdminsOfSignup({ email: "a@example.org", name: "A" }, "password")).toBe(false);
    expect(sent).toHaveLength(0);
  });
});

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

/**
 * Account security and abuse protection: who a visitor is for rate limits, which addresses
 * the crawler may reach, text that the database cannot store, password reset and change,
 * email confirmation, and signing out other devices.
 */

const mocks = vi.hoisted(() => ({ session: null as null | { user: { id: string; sv: number } }, sent: [] as { to: string; subject: string; url?: string }[] }));
vi.mock("@/auth", () => ({ auth: async () => mocks.session, signIn: vi.fn(), signOut: vi.fn(), TooManyAttempts: class extends Error {} }));
vi.mock("@/server/email/mailer", async (original) => ({
  ...(await original<typeof import("@/server/email/mailer")>()),
  sendEmail: async (to: string, content: { subject: string; action?: { url: string } }) => {
    mocks.sent.push({ to, subject: content.subject, url: content.action?.url });
    return true;
  },
}));

import bcrypt from "bcryptjs";
import { POST as startRoute } from "@/app/api/widget/start/route";
import { changePassword, issueToken, peekToken, requestPasswordReset, resetPassword, sendVerificationEmail, verifyEmail } from "@/server/auth/account";
import { getCurrentUser } from "@/server/auth/session";
import { prisma } from "@/server/db/prisma";
import { tenantDb } from "@/server/db/tenant";
import { isPrivateAddress } from "@/server/ingest/safe-fetch";
import { clientIpFrom } from "@/server/limits/client-ip";
import { conversationIdSchema, visitorText } from "@/server/widget/service";
import { createWidgetToken } from "@/server/widget/token";
import { createTenant } from "./helpers";

const tokenFrom = (url?: string) => url!.split("/").pop()!;

beforeEach(() => {
  mocks.sent.length = 0;
  mocks.session = null;
});

describe("visitor address for rate limits", () => {
  afterEach(() => vi.unstubAllEnvs());
  const headers = (h: Record<string, string>) => new Headers(h);

  it("ignores the first X-Forwarded-For value, which visitors can write themselves", () => {
    expect(clientIpFrom(headers({ "x-forwarded-for": "1.2.3.4, 203.0.113.9" }))).toBe("203.0.113.9");
    expect(clientIpFrom(headers({ "x-forwarded-for": "203.0.113.9" }))).toBe("203.0.113.9");
  });

  it("prefers the address the hosting provider sets (Cloudflare's CF-Connecting-IP by default)", () => {
    expect(clientIpFrom(headers({ "cf-connecting-ip": "198.51.100.7", "x-forwarded-for": "1.2.3.4, 10.0.0.1" }))).toBe("198.51.100.7");
    vi.stubEnv("CLIENT_IP_HEADER", "x-real-ip");
    expect(clientIpFrom(headers({ "x-real-ip": "198.51.100.8", "cf-connecting-ip": "1.1.1.1" }))).toBe("198.51.100.8");
  });

  it("refuses values that are not addresses", () => {
    expect(clientIpFrom(headers({ "cf-connecting-ip": "evil, value", "x-forwarded-for": "not an ip" }))).toBe("unknown");
    expect(clientIpFrom(headers({}))).toBe("unknown");
  });
});

describe("crawler address guard", () => {
  it("judges IPv6 forms that carry an IPv4 address by that address", () => {
    for (const ip of ["::ffff:127.0.0.1", "::ffff:7f00:1", "::127.0.0.1", "::7f00:1", "64:ff9b::7f00:1", "64:ff9b::a9fe:a9fe", "2002:7f00:1::", "2002:a9fe:a9fe::1"]) {
      expect(isPrivateAddress(ip), ip).toBe(true);
    }
    for (const ip of ["::ffff:8.8.8.8", "::ffff:808:808", "64:ff9b::808:808", "2002:808:808::1"]) {
      expect(isPrivateAddress(ip), ip).toBe(false);
    }
  });

  it("blocks special IPv6 ranges and lets public ones through", () => {
    for (const ip of ["::1", "::", "fec0::1", "fe80::1%eth0", "fd00::1", "2001::1", "2001:db8::1", "ff02::1"]) expect(isPrivateAddress(ip), ip).toBe(true);
    for (const ip of ["2606:4700:4700::1111", "2a00:1450:4001:80b::200e"]) expect(isPrivateAddress(ip), ip).toBe(false);
    expect(isPrivateAddress("not-an-ip")).toBe(true);
  });
});

describe("visitor text the database cannot store", () => {
  const nul = String.fromCharCode(0);

  it("strips null characters and refuses ids containing them", () => {
    expect(visitorText(100).parse(`hello${nul} there`)).toBe("hello there");
    expect(visitorText(100).safeParse(nul).success).toBe(false); // nothing left once removed
    expect(conversationIdSchema.safeParse(`abc${nul}`).success).toBe(false);
  });

  it("saves a pre-chat form with a hidden null character instead of failing", async () => {
    const { workspace } = await createTenant("Security Nul");
    const db = tenantDb(workspace.id);
    await db.widgetSettings.upsert({ where: { workspaceId: workspace.id }, update: { preChatForm: true }, create: { workspaceId: workspace.id, preChatForm: true } });
    const res = await startRoute(
      new Request("https://chat.example.com/api/widget/start", {
        method: "POST",
        headers: { "content-type": "application/json", authorization: `Bearer ${createWidgetToken(workspace.id)}` },
        body: JSON.stringify({ visitorId: "visitor_security_00000001", name: `Lay${nul}la`, phone: "+44 20 7946 0958" }),
      }),
    );
    expect(res.status).toBe(200);
    expect((await db.lead.findFirstOrThrow()).name).toBe("Layla");
  });
});

describe("password reset and email confirmation", () => {
  async function user(email: string, password = "old-password-1", verified = false) {
    return prisma.user.create({
      data: { email, name: "Test", passwordHash: await bcrypt.hash(password, 4), emailVerifiedAt: verified ? new Date() : null },
    });
  }

  it("emails a one-hour, single-use reset link, and says nothing for unknown addresses", async () => {
    const u = await user("reset-me@example.com");
    await requestPasswordReset("nobody@example.com");
    expect(mocks.sent).toHaveLength(0);

    await requestPasswordReset(u.email);
    expect(mocks.sent).toHaveLength(1);
    const token = tokenFrom(mocks.sent[0].url);
    expect(mocks.sent[0].url).toContain("/reset-password/");

    // Only a hash is stored.
    expect(await prisma.authToken.count({ where: { tokenHash: token } })).toBe(0);
    expect(await peekToken(token, "reset_password")).toBe(u.id);
    expect(await peekToken(token, "verify_email")).toBeNull();

    expect(await resetPassword(token, "brand-new-password")).toBe(true);
    const after = await prisma.user.findUniqueOrThrow({ where: { id: u.id } });
    expect(await bcrypt.compare("brand-new-password", after.passwordHash!)).toBe(true);
    expect(after.sessionVersion).toBe(1); // every other device is signed out
    expect(after.emailVerifiedAt).not.toBeNull(); // the link proved they read that inbox

    expect(await resetPassword(token, "another-password")).toBe(false); // used up
  });

  it("refuses expired, replaced and made-up links", async () => {
    const u = await user("expired@example.com");
    const first = await issueToken(u.id, "reset_password");
    const second = await issueToken(u.id, "reset_password");
    expect(await resetPassword(first, "brand-new-password")).toBe(false); // replaced by the newer link

    await prisma.authToken.updateMany({ where: { userId: u.id }, data: { expiresAt: new Date(Date.now() - 1000) } });
    expect(await resetPassword(second, "brand-new-password")).toBe(false);
    expect(await resetPassword("x".repeat(43), "brand-new-password")).toBe(false);
    expect(await resetPassword("../../etc", "brand-new-password")).toBe(false);
  });

  it("confirms an email address from its link", async () => {
    const u = await user("confirm@example.com");
    await sendVerificationEmail(u);
    const token = tokenFrom(mocks.sent[0].url);
    expect(mocks.sent[0].url).toContain("/verify-email/");
    expect(await verifyEmail(token)).toBe(true);
    expect((await prisma.user.findUniqueOrThrow({ where: { id: u.id } })).emailVerifiedAt).not.toBeNull();
    expect(await verifyEmail(token)).toBe(false);
  });
});

describe("changing the password and signing out other devices", () => {
  it("needs the current password, then ends every existing session", async () => {
    const u = await prisma.user.create({ data: { email: "change@example.com", passwordHash: await bcrypt.hash("current-pass-1", 4), emailVerifiedAt: new Date() } });
    mocks.session = { user: { id: u.id, sv: 0 } };
    expect((await getCurrentUser())?.id).toBe(u.id);

    expect(await changePassword(u.id, "wrong-guess", "new-password-22")).toBe("wrong_password");
    expect(await changePassword(u.id, "current-pass-1", "new-password-22")).toBe("ok");

    // The session from before the change no longer counts.
    expect(await getCurrentUser()).toBeNull();
    // A login made after it (carrying the new version) does.
    mocks.session = { user: { id: u.id, sv: 1 } };
    expect((await getCurrentUser())?.id).toBe(u.id);
  });

  it("has no password to change on Google-only accounts", async () => {
    const u = await prisma.user.create({ data: { email: "google-only@example.com", emailVerifiedAt: new Date() } });
    expect(await changePassword(u.id, "", "new-password-22")).toBe("no_password");
  });
});

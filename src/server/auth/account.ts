import { createHash, randomBytes } from "node:crypto";
import bcrypt from "bcryptjs";
import { APP_NAME, APP_URL } from "@/lib/config";
import type { AuthTokenKind } from "@/generated/prisma/client";
import { prisma } from "@/server/db/prisma";
import { sendEmail } from "@/server/email/mailer";

/**
 * Account security: confirming an email address, resetting a forgotten password and changing
 * a password.
 *
 * Links in emails carry a random token; only its SHA-256 hash is stored, so a copy of the
 * database cannot be used to reset anyone's password. A token works once. A password change
 * or reset raises the user's session version, which signs the account out on every other
 * device (see getCurrentUser in ./session.ts).
 */

export const AUTH_TOKEN_PATTERN = /^[A-Za-z0-9_-]{43}$/;
const LIFETIME_MS: Record<AuthTokenKind, number> = {
  verify_email: 7 * 24 * 3600_000,
  reset_password: 3600_000,
};
const BCRYPT_ROUNDS = 12;

const hashToken = (token: string) => createHash("sha256").update(token).digest("hex");

export const verifyEmailUrl = (token: string) => `${APP_URL}/verify-email/${token}`;
export const resetPasswordUrl = (token: string) => `${APP_URL}/reset-password/${token}`;

/** Make a fresh one-time token, replacing any earlier one of the same kind for this user. */
export async function issueToken(userId: string, kind: AuthTokenKind): Promise<string> {
  const token = randomBytes(32).toString("base64url");
  await prisma.$transaction([
    prisma.authToken.deleteMany({ where: { userId, kind } }),
    prisma.authToken.create({ data: { userId, kind, tokenHash: hashToken(token), expiresAt: new Date(Date.now() + LIFETIME_MS[kind]) } }),
  ]);
  return token;
}

/** The user a token belongs to, if it is valid and unused; it stays usable. */
export async function peekToken(token: string, kind: AuthTokenKind): Promise<string | null> {
  if (!AUTH_TOKEN_PATTERN.test(token)) return null;
  const row = await prisma.authToken.findUnique({ where: { tokenHash: hashToken(token) }, select: { userId: true, kind: true, expiresAt: true } });
  return row && row.kind === kind && row.expiresAt > new Date() ? row.userId : null;
}

/** Use a token up. Returns its user, or null when it is wrong, expired or already used. */
async function consumeToken(token: string, kind: AuthTokenKind): Promise<string | null> {
  if (!AUTH_TOKEN_PATTERN.test(token)) return null;
  const tokenHash = hashToken(token);
  const row = await prisma.authToken.findUnique({ where: { tokenHash }, select: { userId: true, kind: true, expiresAt: true } });
  if (!row || row.kind !== kind) return null;
  // deleteMany reports how many rows it removed, so two requests racing with the same token cannot both win.
  const { count } = await prisma.authToken.deleteMany({ where: { tokenHash } });
  return count === 1 && row.expiresAt > new Date() ? row.userId : null;
}

// ---------------------------------------------------------------- email verification

export async function sendVerificationEmail(user: { id: string; email: string; name: string | null }) {
  const token = await issueToken(user.id, "verify_email");
  return sendEmail(user.email, {
    subject: `Confirm your email for ${APP_NAME}`,
    heading: "Confirm your email address",
    lines: [
      `Hi${user.name ? ` ${user.name}` : ""}, please confirm that ${user.email} is your email address.`,
      "This keeps your account safe and makes sure notifications about new leads and customers reach you.",
      "The link works for 7 days. If you did not create an account, you can ignore this email.",
    ],
    action: { label: "Confirm email address", url: verifyEmailUrl(token) },
  });
}

/** Mark the address confirmed. True when the link was valid. */
export async function verifyEmail(token: string): Promise<boolean> {
  const userId = await consumeToken(token, "verify_email");
  if (!userId) return false;
  await prisma.user.updateMany({ where: { id: userId, emailVerifiedAt: null }, data: { emailVerifiedAt: new Date() } });
  return true;
}

// ---------------------------------------------------------------- forgotten password

/**
 * Email a reset link if an account with this address exists. Says nothing either way, so the
 * form cannot be used to find out who has an account.
 */
export async function requestPasswordReset(email: string): Promise<void> {
  const user = await prisma.user.findUnique({ where: { email }, select: { id: true, email: true, name: true } });
  if (!user) return;
  const token = await issueToken(user.id, "reset_password");
  await sendEmail(user.email, {
    subject: `Reset your ${APP_NAME} password`,
    heading: "Reset your password",
    lines: [
      `Someone asked to reset the password for ${user.email}. If it was you, choose a new password with the button below.`,
      "The link works for one hour and only once. If you did not ask for this, ignore this email: your password stays the same.",
    ],
    action: { label: "Choose a new password", url: resetPasswordUrl(token) },
  });
}

/**
 * Set a new password from a reset link. Also confirms the email address (the link proves the
 * person reads that inbox) and signs the account out everywhere else.
 */
export async function resetPassword(token: string, password: string): Promise<boolean> {
  const userId = await consumeToken(token, "reset_password");
  if (!userId) return false;
  const passwordHash = await bcrypt.hash(password, BCRYPT_ROUNDS);
  const user = await prisma.user.findUniqueOrThrow({ where: { id: userId }, select: { emailVerifiedAt: true } });
  await prisma.user.update({
    where: { id: userId },
    data: { passwordHash, sessionVersion: { increment: 1 }, emailVerifiedAt: user.emailVerifiedAt ?? new Date() },
  });
  return true;
}

// ---------------------------------------------------------------- changing the password

export type ChangePasswordResult = "ok" | "wrong_password" | "no_password";

/** Change the password of a signed-in user, who must know the current one. Signs out other devices. */
export async function changePassword(userId: string, current: string, next: string): Promise<ChangePasswordResult> {
  const user = await prisma.user.findUniqueOrThrow({ where: { id: userId }, select: { passwordHash: true } });
  // Google-only accounts have no password to check; they set one through "Forgot password".
  if (!user.passwordHash) return "no_password";
  if (!(await bcrypt.compare(current, user.passwordHash))) return "wrong_password";
  await prisma.user.update({
    where: { id: userId },
    data: { passwordHash: await bcrypt.hash(next, BCRYPT_ROUNDS), sessionVersion: { increment: 1 } },
  });
  return "ok";
}

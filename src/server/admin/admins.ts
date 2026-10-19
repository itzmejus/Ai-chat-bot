import { APP_NAME, APP_URL } from "@/lib/config";
import { prisma } from "@/server/db/prisma";
import { sendEmail } from "@/server/email/mailer";

/**
 * The people who run the service, listed by email in ADMIN_EMAILS (comma separated).
 * Kept apart from ./access.ts, which depends on the session, so src/auth.ts can use it too.
 */
export function adminEmails(): string[] {
  return (process.env.ADMIN_EMAILS ?? "")
    .split(",")
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean);
}

export type SignupMethod = "password" | "google";

/**
 * Tells the admins someone has just created an account. Runs in the background of a signup,
 * so it never throws: a mail problem must not stop anyone signing up.
 */
export async function notifyAdminsOfSignup(user: { email: string; name: string | null }, method: SignupMethod, viaInvite = false): Promise<boolean> {
  const to = adminEmails();
  if (to.length === 0) return false;
  try {
    const total = await prisma.user.count();
    const when = new Intl.DateTimeFormat("en-GB", { dateStyle: "medium", timeStyle: "short", timeZone: "Asia/Dubai" }).format(new Date());
    return await sendEmail(to, {
      subject: `New ${APP_NAME} signup: ${user.name || user.email}`,
      heading: "Someone just created an account",
      lines: [`${user.name || user.email} signed up${viaInvite ? " to join a team they were invited to" : ""}. You now have ${total} account${total === 1 ? "" : "s"}.`],
      details: [
        ["Name", user.name || "Not given"],
        ["Email", user.email],
        ["Signed up with", method === "google" ? "Google" : "Email and password"],
        ["Joined", viaInvite ? "From a team invitation" : "New account"],
        ["Time (UAE)", when],
      ],
      action: { label: "Open users in admin", url: `${APP_URL}/admin/users` },
    });
  } catch (err) {
    console.error("[admin] signup notification failed", (err as Error).message);
    return false;
  }
}

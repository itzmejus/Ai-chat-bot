import { notFound } from "next/navigation";
import { getCurrentUser } from "@/server/auth/session";
import { adminEmails } from "./admins";

/*
 * The admin area (/admin) is for the people who run the service, not for workspace owners.
 * Admins are listed by email in ADMIN_EMAILS (comma separated). The address must also be
 * confirmed, so nobody can claim it by signing up with an admin's email before they do.
 */
export { adminEmails };

export const isAdmin = (user: { email: string; emailVerifiedAt: Date | null } | null): boolean =>
  Boolean(user?.emailVerifiedAt) && adminEmails().includes(user!.email.toLowerCase());

/** For admin pages and actions. Anyone else gets a plain 404, so the area does not reveal itself. */
export async function requireAdmin() {
  const user = await getCurrentUser();
  if (!isAdmin(user)) notFound();
  return user!;
}

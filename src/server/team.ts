import { randomBytes } from "node:crypto";
import { APP_NAME, APP_URL } from "@/lib/config";
import { prisma } from "@/server/db/prisma";
import type { TenantDb } from "@/server/db/tenant";
import { sendEmail } from "@/server/email/mailer";

/**
 * Team management: members, roles and email invitations.
 * Functions that take `db` are workspace-scoped. `findInvite` and `acceptInvite`
 * work from the secret token in the invitation link, before the person is a member.
 */

export const TEAM_ROLES = ["agent", "owner"] as const;
export type TeamRole = (typeof TEAM_ROLES)[number];

const INVITE_DAYS = 7;
export const inviteUrl = (token: string) => `${APP_URL}/invite/${token}`;
export const INVITE_TOKEN_PATTERN = /^[A-Za-z0-9_-]{24,64}$/;

export class TeamError extends Error {
  constructor(public code: "limit" | "already_member" | "last_owner" | "not_found") {
    super(code);
    this.name = "TeamError";
  }
}

type Scope = { db: TenantDb; workspaceId: string; maxAgents: number };

export function listMembers(db: TenantDb) {
  return db.membership.findMany({
    orderBy: { createdAt: "asc" },
    select: { id: true, role: true, createdAt: true, userId: true, user: { select: { name: true, email: true } } },
  });
}

export function listPendingInvites(db: TenantDb) {
  return db.invite.findMany({
    where: { acceptedAt: null, expiresAt: { gt: new Date() } },
    orderBy: { createdAt: "desc" },
    select: { id: true, email: true, role: true, token: true, expiresAt: true },
  });
}

/** Seats in use: current members plus invitations that could still be accepted. */
export async function seatsUsed(db: TenantDb): Promise<number> {
  const [members, invites] = await Promise.all([db.membership.count(), db.invite.count({ where: { acceptedAt: null, expiresAt: { gt: new Date() } } })]);
  return members + invites;
}

/**
 * Invite someone by email. Counts against the plan's team size. Inviting the
 * same address again replaces the earlier invitation (new link, new expiry).
 */
export async function inviteMember(scope: Scope, email: string, role: TeamRole, invitedBy: { name: string | null; email: string }) {
  const { db, workspaceId, maxAgents } = scope;

  const existingMember = await db.membership.findFirst({ where: { user: { email } }, select: { id: true } });
  if (existingMember) throw new TeamError("already_member");

  const previous = await db.invite.findFirst({ where: { email, acceptedAt: null }, select: { id: true, expiresAt: true } });
  const previousHoldsSeat = previous && previous.expiresAt > new Date();
  if (!previousHoldsSeat && (await seatsUsed(db)) >= maxAgents) throw new TeamError("limit");
  if (previous) await db.invite.delete({ where: { id: previous.id } });

  const invite = await db.invite.create({
    data: {
      workspaceId,
      email,
      role,
      token: randomBytes(24).toString("base64url"),
      expiresAt: new Date(Date.now() + INVITE_DAYS * 86_400_000),
    },
  });

  const workspace = await db.workspace.findFirstOrThrow({ select: { name: true } });
  const inviter = invitedBy.name ?? invitedBy.email;
  const emailed = await sendEmail(email, {
    subject: `${inviter} invited you to ${workspace.name} on ${APP_NAME}`,
    heading: `Join ${workspace.name}`,
    lines: [
      `${inviter} has invited you to help answer customer chats for ${workspace.name}.`,
      `The invitation is for ${email} and expires in ${INVITE_DAYS} days.`,
    ],
    action: { label: "Accept invitation", url: inviteUrl(invite.token) },
  });
  return { invite, emailed };
}

export async function revokeInvite(db: TenantDb, inviteId: string) {
  await db.invite.deleteMany({ where: { id: inviteId, acceptedAt: null } });
}

async function assertNotLastOwner(db: TenantDb, membershipId: string) {
  const membership = await db.membership.findFirst({ where: { id: membershipId }, select: { role: true } });
  if (!membership) throw new TeamError("not_found");
  if (membership.role === "owner" && (await db.membership.count({ where: { role: "owner" } })) <= 1) throw new TeamError("last_owner");
}

/** A workspace must always keep at least one owner. */
export async function setMemberRole(db: TenantDb, membershipId: string, role: TeamRole) {
  if (role !== "owner") await assertNotLastOwner(db, membershipId);
  const { count } = await db.membership.updateMany({ where: { id: membershipId }, data: { role } });
  if (count === 0) throw new TeamError("not_found");
}

export async function removeMember(db: TenantDb, membershipId: string) {
  await assertNotLastOwner(db, membershipId);
  const membership = await db.membership.findFirst({ where: { id: membershipId }, select: { userId: true } });
  if (!membership) throw new TeamError("not_found");
  // Conversations they were handling go back to "needs human" so nothing is left unattended.
  await db.conversation.updateMany({ where: { assignedAgentId: membership.userId, status: "human" }, data: { status: "needs_human", assignedAgentId: null } });
  await db.membership.delete({ where: { id: membershipId } });
}

// ---------------------------------------------------------------- accepting an invitation

/** Look an invitation up by its link token. The token is the credential here. */
export async function findInvite(token: string) {
  if (!INVITE_TOKEN_PATTERN.test(token)) return null;
  const invite = await prisma.invite.findUnique({
    where: { token },
    select: { id: true, email: true, role: true, workspaceId: true, acceptedAt: true, expiresAt: true, workspace: { select: { name: true } } },
  });
  if (!invite) return null;
  return { ...invite, state: invite.acceptedAt ? ("accepted" as const) : invite.expiresAt < new Date() ? ("expired" as const) : ("pending" as const) };
}

/**
 * Accept an invitation. Only the person it was sent to can accept it: the
 * signed-in user's email must match the invited address.
 */
export async function acceptInvite(token: string, user: { id: string; email: string }): Promise<{ ok: true; workspaceId: string } | { ok: false; reason: "invalid" | "expired" | "wrong_account" }> {
  const invite = await findInvite(token);
  if (!invite || invite.state === "accepted") return { ok: false, reason: "invalid" };
  if (invite.state === "expired") return { ok: false, reason: "expired" };
  if (invite.email.toLowerCase() !== user.email.toLowerCase()) return { ok: false, reason: "wrong_account" };

  await prisma.$transaction([
    prisma.membership.upsert({
      where: { userId_workspaceId: { userId: user.id, workspaceId: invite.workspaceId } },
      update: {},
      create: { userId: user.id, workspaceId: invite.workspaceId, role: invite.role },
    }),
    prisma.invite.update({ where: { id: invite.id }, data: { acceptedAt: new Date() } }),
  ]);
  return { ok: true, workspaceId: invite.workspaceId };
}

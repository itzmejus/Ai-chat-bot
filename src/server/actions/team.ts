"use server";

import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { z } from "zod";
import { WORKSPACE_COOKIE } from "@/lib/config";
import { requireUser, requireWorkspace } from "@/server/auth/session";
import { acceptInvite, inviteMember, inviteUrl, removeMember, revokeInvite, setMemberRole, TEAM_ROLES, TeamError, type TeamRole } from "@/server/team";
import type { FormState } from "./auth";

const PAGE = "/dashboard/team";

const inviteSchema = z.object({
  email: z
    .string()
    .trim()
    .toLowerCase()
    .pipe(z.email({ error: "errors.email" })),
  role: z.enum(TEAM_ROLES, "errors.required"),
});

/** Only owners manage the team. Returns the scope, or null for agents. */
async function ownerScope() {
  const ctx = await requireWorkspace();
  if (ctx.role !== "owner") return null;
  return { ctx, scope: { db: ctx.db, workspaceId: ctx.workspace.id, maxAgents: ctx.workspace.plan.maxAgents } };
}

export type InviteState = (FormState & { link?: string; emailed?: boolean }) | undefined;

export async function inviteMemberAction(_prev: InviteState, formData: FormData): Promise<InviteState> {
  const owner = await ownerScope();
  if (!owner) return { error: "errors.ownerOnly" };

  const parsed = inviteSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { fieldErrors: { email: parsed.error.issues[0]?.message ?? "errors.email" } };

  try {
    const { invite, emailed } = await inviteMember(owner.scope, parsed.data.email, parsed.data.role, owner.ctx.user);
    revalidatePath(PAGE);
    // The link is returned too, so it can be copied and sent by hand if email is not set up.
    return { ok: true, link: inviteUrl(invite.token), emailed };
  } catch (err) {
    if (err instanceof TeamError) return { error: `team.errors.${err.code}` };
    console.error("[team] invite failed", err);
    return { error: "errors.generic" };
  }
}

async function ownerAction(run: (scope: NonNullable<Awaited<ReturnType<typeof ownerScope>>>["scope"]) => Promise<void>): Promise<{ error?: string }> {
  const owner = await ownerScope();
  if (!owner) return { error: "errors.ownerOnly" };
  try {
    await run(owner.scope);
  } catch (err) {
    if (err instanceof TeamError) return { error: `team.errors.${err.code}` };
    console.error("[team] action failed", err);
    return { error: "errors.generic" };
  }
  revalidatePath(PAGE);
  return {};
}

export async function revokeInviteAction(inviteId: string) {
  return ownerAction(({ db }) => revokeInvite(db, inviteId));
}

export async function removeMemberAction(membershipId: string) {
  return ownerAction(({ db }) => removeMember(db, membershipId));
}

export async function setMemberRoleAction(membershipId: string, role: string) {
  if (!(TEAM_ROLES as readonly string[]).includes(role)) return { error: "errors.generic" };
  return ownerAction(({ db }) => setMemberRole(db, membershipId, role as TeamRole));
}

/** Accept an invitation as the signed-in user, then open that workspace. */
export async function acceptInviteAction(token: string): Promise<{ error: string } | undefined> {
  const user = await requireUser();
  const result = await acceptInvite(token, user);
  if (!result.ok) return { error: `invite.${result.reason}` };

  (await cookies()).set(WORKSPACE_COOKIE, result.workspaceId, { httpOnly: true, sameSite: "lax", maxAge: 60 * 60 * 24 * 365, path: "/" });
  redirect("/dashboard");
}

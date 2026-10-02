import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { cache } from "react";
import { auth } from "@/auth";
import { WORKSPACE_COOKIE } from "@/lib/config";
import { prisma } from "@/server/db/prisma";
import { tenantDb } from "@/server/db/tenant";

/**
 * The signed-in user, verified against the database (a JWT can outlive its user).
 * Cached per request.
 */
export const getCurrentUser = cache(async () => {
  const session = await auth();
  const id = session?.user?.id;
  if (!id) return null;
  return prisma.user.findUnique({
    where: { id },
    select: { id: true, email: true, name: true, image: true },
  });
});

export async function requireUser() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  return user;
}

/**
 * Resolve the workspace for this request and return a database client locked to it.
 *
 * The "current workspace" cookie is only a preference: it is honoured solely if
 * the user really is a member, so editing the cookie cannot grant access.
 */
export const requireWorkspace = cache(async () => {
  const user = await requireUser();

  const memberships = await prisma.membership.findMany({
    where: { userId: user.id },
    include: { workspace: { include: { plan: true } } },
    orderBy: { createdAt: "asc" },
  });
  if (memberships.length === 0) redirect("/onboarding");

  const preferred = (await cookies()).get(WORKSPACE_COOKIE)?.value;
  const current = memberships.find((m) => m.workspaceId === preferred) ?? memberships[0];

  return {
    user,
    workspace: current.workspace,
    role: current.role,
    memberships,
    db: tenantDb(current.workspaceId),
  };
});

/** Same as requireWorkspace, but only for owners. */
export async function requireOwner() {
  const ctx = await requireWorkspace();
  if (ctx.role !== "owner") redirect("/dashboard");
  return ctx;
}

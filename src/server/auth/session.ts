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
 * Resolve the workspace for this request and build a database client locked to it.
 *
 * The "current workspace" cookie is only a preference: it is honoured solely if
 * the user really is a member, so editing the cookie cannot grant access.
 */
const resolveWorkspace = cache(async () => {
  const user = await getCurrentUser();
  if (!user) return { status: "anonymous" as const };

  const memberships = await prisma.membership.findMany({
    where: { userId: user.id },
    include: { workspace: { include: { plan: true } } },
    orderBy: { createdAt: "asc" },
  });
  if (memberships.length === 0) return { status: "no-workspace" as const };

  const preferred = (await cookies()).get(WORKSPACE_COOKIE)?.value;
  const current = memberships.find((m) => m.workspaceId === preferred) ?? memberships[0];

  return {
    status: "ok" as const,
    ctx: {
      user,
      workspace: current.workspace,
      role: current.role,
      memberships,
      db: tenantDb(current.workspaceId),
    },
  };
});

export type WorkspaceContext = Extract<Awaited<ReturnType<typeof resolveWorkspace>>, { status: "ok" }>["ctx"];

/** For pages and server actions: redirects to /login or /onboarding when there is no workspace. */
export async function requireWorkspace(): Promise<WorkspaceContext> {
  const result = await resolveWorkspace();
  if (result.status === "anonymous") redirect("/login");
  if (result.status === "no-workspace") redirect("/onboarding");
  return result.ctx;
}

/** For API route handlers: returns null instead of redirecting, so the route can answer 401. */
export async function getWorkspaceContext(): Promise<WorkspaceContext | null> {
  const result = await resolveWorkspace();
  return result.status === "ok" ? result.ctx : null;
}

/** Same as requireWorkspace, but only for owners. */
export async function requireOwner() {
  const ctx = await requireWorkspace();
  if (ctx.role !== "owner") redirect("/dashboard");
  return ctx;
}

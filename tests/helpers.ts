import { randomUUID } from "node:crypto";
import { DEFAULT_WORKING_HOURS } from "@/lib/validation";
import { prisma } from "@/server/db/prisma";
import { createWorkspaceForUser } from "@/server/workspaces";

/** Create a user who owns a brand-new workspace. */
export async function createTenant(name: string) {
  const user = await prisma.user.create({ data: { email: `${randomUUID()}@test.local`, name: `${name} owner` } });
  const workspace = await createWorkspaceForUser(user, {
    name,
    industry: "clinic",
    websiteUrl: `https://www.${name.toLowerCase().replace(/\W+/g, "-")}.ae`,
    defaultLanguage: "both",
    phone: null,
    whatsapp: null,
    workingHours: DEFAULT_WORKING_HOURS,
  });
  return { user, workspace };
}

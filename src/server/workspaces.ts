import { randomBytes } from "node:crypto";
import type { WorkspaceInput } from "@/lib/validation";
import { prisma } from "@/server/db/prisma";

/** Public workspace key used in the widget embed code. Not a secret. */
export function generatePublicKey() {
  return `pk_${randomBytes(16).toString("hex")}`;
}

const DEFAULT_GREETING = {
  en: "Hi! How can I help you today?",
  ar: "مرحباً! كيف يمكنني مساعدتك اليوم؟",
  both: "Hi! How can I help you today?\nمرحباً! كيف يمكنني مساعدتك اليوم؟",
} as const;

/**
 * Create a workspace with its owner membership and default settings in one
 * transaction, so a workspace can never exist half-configured.
 */
export async function createWorkspaceForUser(user: { id: string; email: string }, input: WorkspaceInput) {
  // The business's own website is whitelisted for the widget from the start.
  const allowedDomains = input.websiteUrl ? [new URL(input.websiteUrl).hostname.replace(/^www\./, "")] : [];

  return prisma.$transaction(async (tx) => {
    const workspace = await tx.workspace.create({
      data: { ...input, publicKey: generatePublicKey() },
    });
    const workspaceId = workspace.id;

    await tx.membership.create({ data: { userId: user.id, workspaceId, role: "owner" } });
    await tx.assistantSettings.create({
      data: { workspaceId, greeting: DEFAULT_GREETING[input.defaultLanguage] },
    });
    await tx.widgetSettings.create({ data: { workspaceId, allowedDomains } });
    await tx.notificationSettings.create({ data: { workspaceId, emails: [user.email] } });

    return workspace;
  });
}

import { getTranslations } from "next-intl/server";
import { ChatScene } from "@/components/illustrations";
import { PageHero } from "@/components/page-hero";
import { TeamManager } from "@/components/team/team-manager";
import { requireWorkspace } from "@/server/auth/session";
import { inviteUrl, listMembers, listPendingInvites } from "@/server/team";

export const metadata = { title: "Team" };

/** Team: members, their roles, and email invitations. Only owners can change anything. */
export default async function TeamPage() {
  const { db, workspace, role, user } = await requireWorkspace();
  const t = await getTranslations("team");
  const [members, invites] = await Promise.all([listMembers(db), listPendingInvites(db)]);
  const canManage = role === "owner";

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-6">
      <PageHero
        title={t("title")}
        subtitle={t("subtitle")}
        illustration={<ChatScene className="pointer-events-none absolute -end-24 -top-8 w-56 opacity-20 sm:-end-2 sm:top-1/2 sm:w-64 sm:-translate-y-1/2 sm:opacity-60 lg:end-8" />}
      />
      <TeamManager
        members={members}
        // Invitation links are only handed to owners.
        invites={invites.map(({ token, ...invite }) => ({ ...invite, link: canManage ? inviteUrl(token) : "" }))}
        currentUserId={user.id}
        canManage={canManage}
        seats={members.length + invites.length}
        maxSeats={workspace.plan.maxAgents}
      />
    </div>
  );
}

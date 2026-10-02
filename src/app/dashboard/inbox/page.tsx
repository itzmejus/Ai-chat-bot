import { Inbox } from "@/components/inbox/inbox";
import { requireWorkspace } from "@/server/auth/session";

export const metadata = { title: "Inbox" };

/**
 * Inbox: every customer conversation, live. The list, the open conversation and
 * the agent actions are all in the client component; `?c=<id>` opens one directly.
 */
export default async function InboxPage({ searchParams }: PageProps<"/dashboard/inbox">) {
  await requireWorkspace();
  const { c } = await searchParams;
  return <Inbox initialConversationId={typeof c === "string" ? c : null} />;
}

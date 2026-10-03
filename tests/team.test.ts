import { beforeEach, describe, expect, it, vi } from "vitest";

// Capture outgoing email instead of sending it.
const sent = vi.hoisted(() => [] as { to: string[]; subject: string; text: string; html: string }[]);
vi.mock("@/server/email/mailer", async (original) => {
  const actual = await original<typeof import("@/server/email/mailer")>();
  return {
    ...actual,
    emailConfigured: () => true,
    sendEmail: vi.fn(async (to: string | string[], content: import("@/server/email/mailer").EmailContent) => {
      sent.push({ to: Array.isArray(to) ? to : [to], subject: content.subject, ...actual.renderEmail(content) });
      return true;
    }),
  };
});

// Capture outgoing WhatsApp alerts too.
const whatsapp = vi.hoisted(() => [] as { to: string; template: string; language: string; params: string[] }[]);
vi.mock("@/server/whatsapp/client", async (original) => ({
  ...(await original<typeof import("@/server/whatsapp/client")>()),
  sendWhatsAppTemplate: vi.fn(async (to: string, template: string, language: string, params: string[]) => {
    whatsapp.push({ to, template, language, params });
    return true;
  }),
}));

const mocks = vi.hoisted(() => ({ embedTexts: vi.fn(), streamChat: vi.fn(), header: {} as Record<string, unknown> }));
vi.mock("@/server/ai/openai", async (original) => ({
  ...(await original<typeof import("@/server/ai/openai")>()),
  embedTexts: mocks.embedTexts,
  streamChat: mocks.streamChat,
}));
vi.mock("@/server/jobs/queue", () => ({ enqueueIngest: vi.fn(async () => {}) }));

import { POST as humanRoute } from "@/app/api/widget/human/route";
import { POST as startRoute } from "@/app/api/widget/start/route";
import { answerMessage } from "@/server/ai/answer";
import { setWorkspacePlan } from "@/server/billing";
import { prisma } from "@/server/db/prisma";
import { tenantDb } from "@/server/db/tenant";
import { renderEmail } from "@/server/email/mailer";
import { acceptInvite, findInvite, inviteMember, listPendingInvites, removeMember, revokeInvite, seatsUsed, setMemberRole, TeamError } from "@/server/team";
import { createWidgetToken } from "@/server/widget/token";
import { createTenant } from "./helpers";

beforeEach(() => {
  sent.length = 0;
  whatsapp.length = 0;
  mocks.header = { answered: true, wants_human: false, name: null, phone: null, email: null };
  mocks.embedTexts.mockReset().mockImplementation(async (texts: string[]) => texts.map(() => Array(1536).fill(0.01)));
  mocks.streamChat.mockReset().mockImplementation(async function* () {
    yield JSON.stringify(mocks.header) + "\n";
    yield "Reply.";
  });
});

/** Emails are sent without being awaited by the chat; give them a moment to land. */
const settle = () => new Promise((resolve) => setTimeout(resolve, 60));

async function setup(name: string, plan = "starter") {
  const t = await createTenant(name);
  await prisma.workspace.update({ where: { id: t.workspace.id }, data: { planId: plan } });
  const { maxAgents } = await prisma.plan.findUniqueOrThrow({ where: { id: plan } });
  const db = tenantDb(t.workspace.id);
  return { ...t, workspaceId: t.workspace.id, db, scope: { db, workspaceId: t.workspace.id, maxAgents }, inviter: { name: "Owner", email: t.user.email } };
}
const newUser = (email: string) => prisma.user.create({ data: { email, name: email.split("@")[0] } });
const unique = (prefix: string) => `${prefix}-${Math.random().toString(36).slice(2, 8)}@example.com`;

describe("team invitations", () => {
  it("emails an invitation link and lets only the invited address accept it", async () => {
    const t = await setup("Team Invite");
    const email = unique("sara");
    const { invite, emailed } = await inviteMember(t.scope, email, "agent", t.inviter);

    expect(emailed).toBe(true);
    expect(sent).toHaveLength(1);
    expect(sent[0].to).toEqual([email]);
    expect(sent[0].subject).toContain("Team Invite");
    expect(sent[0].text).toContain(`/invite/${invite.token}`);
    expect(invite.token).toMatch(/^[A-Za-z0-9_-]{32}$/);
    expect(await seatsUsed(t.db)).toBe(2); // owner + the pending invitation

    // Someone else who got hold of the link cannot use it.
    const stranger = await newUser(unique("stranger"));
    expect(await acceptInvite(invite.token, stranger)).toEqual({ ok: false, reason: "wrong_account" });
    expect(await t.db.membership.count()).toBe(1);

    // The invited person can, even with different capitalisation in their email.
    const sara = await newUser(email);
    expect(await acceptInvite(invite.token, { id: sara.id, email: email.toUpperCase() })).toEqual({ ok: true, workspaceId: t.workspaceId });
    expect(await t.db.membership.findFirst({ where: { userId: sara.id } })).toMatchObject({ role: "agent" });
    expect(await listPendingInvites(t.db)).toEqual([]);
    expect(await seatsUsed(t.db)).toBe(2);

    // A used link is dead.
    expect(await acceptInvite(invite.token, sara)).toEqual({ ok: false, reason: "invalid" });
    expect((await findInvite(invite.token))?.state).toBe("accepted");
  });

  it("rejects expired, unknown and malformed tokens", async () => {
    const t = await setup("Team Expired");
    const email = unique("late");
    const { invite } = await inviteMember(t.scope, email, "agent", t.inviter);
    await prisma.invite.update({ where: { id: invite.id }, data: { expiresAt: new Date(Date.now() - 1000) } });
    const user = await newUser(email);

    expect(await acceptInvite(invite.token, user)).toEqual({ ok: false, reason: "expired" });
    expect(await acceptInvite("a".repeat(32), user)).toEqual({ ok: false, reason: "invalid" });
    expect(await findInvite("../../etc/passwd")).toBeNull();
    expect(await t.db.membership.count()).toBe(1);
    expect(await seatsUsed(t.db)).toBe(1); // an expired invitation no longer holds a seat
  });

  it("enforces the plan's team size, counting pending invitations", async () => {
    const free = await setup("Team Free", "free"); // 1 seat: the owner
    await expect(inviteMember(free.scope, unique("a"), "agent", free.inviter)).rejects.toMatchObject({ code: "limit" });
    expect(sent).toHaveLength(0);

    const starter = await setup("Team Starter", "starter"); // 3 seats
    await inviteMember(starter.scope, unique("a"), "agent", starter.inviter);
    const second = unique("b");
    await inviteMember(starter.scope, second, "agent", starter.inviter);
    await expect(inviteMember(starter.scope, unique("c"), "agent", starter.inviter)).rejects.toBeInstanceOf(TeamError);

    // Re-inviting the same address replaces its invitation instead of using another seat.
    const again = await inviteMember(starter.scope, second, "owner", starter.inviter);
    expect(await seatsUsed(starter.db)).toBe(3);
    expect((await listPendingInvites(starter.db)).find((i) => i.email === second)).toMatchObject({ role: "owner", token: again.invite.token });

    // Cancelling one frees its seat.
    await revokeInvite(starter.db, again.invite.id);
    await inviteMember(starter.scope, unique("c"), "agent", starter.inviter);
    expect(await seatsUsed(starter.db)).toBe(3);
  });

  it("does not invite someone who is already a member", async () => {
    const t = await setup("Team Dup");
    await expect(inviteMember(t.scope, t.user.email, "agent", t.inviter)).rejects.toMatchObject({ code: "already_member" });
  });

  it("always keeps one owner, and hands back chats when a member is removed", async () => {
    const t = await setup("Team Roles");
    const ownerMembership = await t.db.membership.findFirstOrThrow();
    await expect(setMemberRole(t.db, ownerMembership.id, "agent")).rejects.toMatchObject({ code: "last_owner" });
    await expect(removeMember(t.db, ownerMembership.id)).rejects.toMatchObject({ code: "last_owner" });

    const agent = await newUser(unique("agent"));
    const agentMembership = await t.db.membership.create({ data: { workspaceId: t.workspaceId, userId: agent.id, role: "agent" } });
    const chat = await t.db.conversation.create({ data: { workspaceId: t.workspaceId, visitorId: "visitor-team-000001", status: "human", assignedAgentId: agent.id } });

    await setMemberRole(t.db, agentMembership.id, "owner");
    await setMemberRole(t.db, ownerMembership.id, "agent"); // fine now: another owner exists
    await setMemberRole(t.db, agentMembership.id, "agent").catch((e) => expect(e).toMatchObject({ code: "last_owner" }));

    await setMemberRole(t.db, ownerMembership.id, "owner");
    await removeMember(t.db, agentMembership.id);
    expect(await t.db.membership.count()).toBe(1);
    expect(await t.db.conversation.findUniqueOrThrow({ where: { id: chat.id } })).toMatchObject({ status: "needs_human", assignedAgentId: null });
  });

  it("cannot touch another workspace's members or invitations", async () => {
    const a = await setup("Team Iso A");
    const b = await setup("Team Iso B");
    const bOwner = await b.db.membership.findFirstOrThrow();
    const { invite } = await inviteMember(b.scope, unique("b-invitee"), "agent", b.inviter);

    await expect(setMemberRole(a.db, bOwner.id, "agent")).rejects.toMatchObject({ code: "not_found" });
    await expect(removeMember(a.db, bOwner.id)).rejects.toMatchObject({ code: "not_found" });
    await revokeInvite(a.db, invite.id);
    expect(await listPendingInvites(a.db)).toEqual([]);
    expect(await listPendingInvites(b.db)).toHaveLength(1);
    expect(await b.db.membership.count()).toBe(1);
  });
});

describe("email notifications", () => {
  async function chat(t: Awaited<ReturnType<typeof setup>>, text: string, opts: { isTest?: boolean; conversationId?: string } = {}) {
    const conversationId = opts.conversationId ?? (await t.db.conversation.create({ data: { workspaceId: t.workspaceId, visitorId: `v-${Math.random().toString(36).slice(2)}-000000`, isTest: opts.isTest ?? false } })).id;
    const stream = answerMessage({ workspaceId: t.workspaceId, conversationId, text });
    while (!(await stream.next()).done);
    await settle();
    return conversationId;
  }

  it("emails the business when a lead is captured, with a link to the chat", async () => {
    const t = await setup("Notify Lead");
    mocks.header = { answered: true, wants_human: false, name: "Omar <b>Haddad</b>", phone: "+971501234567", email: null };
    const conversationId = await chat(t, "I'm Omar, call me on 0501234567");

    expect(sent).toHaveLength(1);
    expect(sent[0].to).toEqual([t.user.email]);
    expect(sent[0].subject).toBe("New lead for Notify Lead");
    expect(sent[0].text).toContain("+971501234567");
    expect(sent[0].text).toContain(`/dashboard/inbox?c=${conversationId}`);
    // Visitor-supplied text is escaped in the HTML version.
    expect(sent[0].html).toContain("Omar &lt;b&gt;Haddad&lt;/b&gt;");
    expect(sent[0].html).not.toContain("<b>Haddad</b>");

    // More details for the same lead do not send a second email.
    mocks.header = { ...mocks.header, email: "omar@example.com" };
    await chat(t, "my email is omar@example.com", { conversationId });
    expect(sent).toHaveLength(1);
  });

  it("emails once when a chat starts needing a person, not on every later message", async () => {
    const t = await setup("Notify Human");
    mocks.header = { answered: false, wants_human: false, name: null, phone: null, email: null };
    const conversationId = await chat(t, "Do you have parking?");

    expect(sent).toHaveLength(1);
    expect(sent[0].subject).toBe("A customer is waiting for Notify Human");
    expect(sent[0].text).toContain("Do you have parking?");

    await chat(t, "Hello? Anyone?", { conversationId });
    expect(sent).toHaveLength(1);
  });

  it("also alerts the team's WhatsApp numbers when a chat needs a person, but not for leads", async () => {
    const t = await setup("Notify WhatsApp");
    await t.db.notificationSettings.updateMany({ data: { whatsappNumbers: ["+971501112222", "+971503334444"] } });

    // A lead on its own is an email only.
    mocks.header = { answered: true, wants_human: false, name: "Omar", phone: "+971501234567", email: null };
    const conversationId = await chat(t, "I'm Omar, call me on 0501234567");
    expect(sent).toHaveLength(1);
    expect(whatsapp).toHaveLength(0);

    mocks.header = { answered: false, wants_human: true, name: "Omar", phone: "+971501234567", email: null };
    await chat(t, "I want to talk\nto a person", { conversationId });
    expect(whatsapp.map((m) => m.to)).toEqual(["+971501112222", "+971503334444"]);
    expect(whatsapp[0]).toMatchObject({ template: "needs_human_alert", language: "en" });
    expect(whatsapp[0].params[0]).toBe("Notify WhatsApp");
    expect(whatsapp[0].params[2]).toContain("I want to talk");

    // Still waiting: no second alert.
    await chat(t, "Hello?", { conversationId });
    expect(whatsapp).toHaveLength(2);

    // WhatsApp alone is enough: no email addresses, the alert still goes out.
    const solo = await setup("Notify WhatsApp Only");
    await solo.db.notificationSettings.updateMany({ data: { emails: [], whatsappNumbers: ["+971505556666"] } });
    sent.length = 0;
    whatsapp.length = 0;
    mocks.header = { answered: false, wants_human: false, name: null, phone: null, email: null };
    await chat(solo, "Do you have parking?");
    expect(sent).toHaveLength(0);
    expect(whatsapp.map((m) => m.to)).toEqual(["+971505556666"]);
  });

  it("covers the Talk-to-a-human button and the pre-chat form", async () => {
    const t = await setup("Notify Widget");
    const token = createWidgetToken(t.workspaceId);
    const call = (route: (r: Request) => Promise<Response>, body: unknown) =>
      route(new Request("https://chat.example.com/api/widget/x", { method: "POST", headers: { "content-type": "application/json", authorization: `Bearer ${token}` }, body: JSON.stringify(body) }));

    await call(startRoute, { visitorId: "visitor_notify_000000001", name: "Layla", phone: "+971 55 111 2222" });
    await settle();
    expect(sent.map((m) => m.subject)).toEqual(["New lead for Notify Widget"]);

    await call(humanRoute, { visitorId: "visitor_notify_000000002" });
    await settle();
    expect(sent.map((m) => m.subject)).toEqual(["New lead for Notify Widget", "A customer is waiting for Notify Widget"]);
  });

  it("respects the notification settings, and stays silent for test chats", async () => {
    const t = await setup("Notify Off");
    mocks.header = { answered: false, wants_human: true, name: "X", phone: "+971500000000", email: null };

    await chat(t, "test chat with a number 0500000000", { isTest: true });
    expect(sent).toHaveLength(0);

    await t.db.notificationSettings.updateMany({ data: { notifyOnLead: false, notifyOnNeedsHuman: false } });
    await chat(t, "real chat, call me on 0500000000");
    expect(sent).toHaveLength(0);

    await t.db.notificationSettings.updateMany({ data: { notifyOnLead: true, notifyOnNeedsHuman: false, emails: ["a@example.com", "b@example.com"] } });
    await chat(t, "another real chat, 0500000000");
    expect(sent.map((m) => [m.subject, m.to])).toEqual([["New lead for Notify Off", ["a@example.com", "b@example.com"]]]);

    sent.length = 0;
    await t.db.notificationSettings.updateMany({ data: { emails: [] } });
    await chat(t, "nobody to tell, 0500000000");
    expect(sent).toHaveLength(0);
  });

  it("writes Arabic, right-to-left emails for Arabic businesses", async () => {
    const t = await setup("عيادة النور");
    await prisma.workspace.update({ where: { id: t.workspaceId }, data: { defaultLanguage: "ar" } });
    mocks.header = { answered: true, wants_human: false, name: "فاطمة", phone: "0559876543", email: null };
    await chat(t, "اسمي فاطمة ورقمي 0559876543");

    expect(sent[0].subject).toBe("عميل محتمل جديد لـ عيادة النور");
    expect(sent[0].html).toContain('dir="rtl"');
    expect(sent[0].text).toContain("فاطمة");
  });

  it("renders a plain-text version alongside the HTML", () => {
    const { text, html } = renderEmail({ subject: "s", heading: "Heading", lines: ["One & two"], details: [["Phone", "+971"]], action: { label: "Open", url: "https://app.example.com/x?a=1&b=2" } });
    expect(text).toBe("Heading\n\nOne & two\n\nPhone: +971\n\nOpen: https://app.example.com/x?a=1&b=2");
    expect(html).toContain("One &amp; two");
    expect(html).toContain('href="https://app.example.com/x?a=1&amp;b=2"');
  });
});

describe("plans", () => {
  it("changes a workspace's plan only to a plan that exists", async () => {
    const t = await setup("Plans", "free");
    expect(await setWorkspacePlan(t.workspaceId, "pro")).toBe(true);
    expect((await prisma.workspace.findUniqueOrThrow({ where: { id: t.workspaceId } })).planId).toBe("pro");
    expect(await setWorkspacePlan(t.workspaceId, "enterprise-unlimited")).toBe(false);
    expect((await prisma.workspace.findUniqueOrThrow({ where: { id: t.workspaceId } })).planId).toBe("pro");
  });
});

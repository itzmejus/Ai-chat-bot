"use client";

import { Check, CheckCircle2, Copy, MailPlus, Trash2, UserPlus, X } from "lucide-react";
import { useFormatter, useTranslations } from "next-intl";
import { useActionState, useState, useTransition } from "react";
import { Avatar } from "@/components/brand";
import { FormField, NativeSelect } from "@/components/form-field";
import { Meter } from "@/components/meter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { inviteMemberAction, removeMemberAction, revokeInviteAction, setMemberRoleAction, type InviteState } from "@/server/actions/team";

type Role = "owner" | "agent";
export type MemberRow = { id: string; userId: string; role: Role; createdAt: Date; user: { name: string | null; email: string } };
export type InviteRow = { id: string; email: string; role: Role; link: string; expiresAt: Date };

const ROLE_STYLE: Record<Role, string> = { owner: "bg-[#f1ebff] text-[#5b34c4]", agent: "bg-accent text-accent-foreground" };

function CopyButton({ text, label, copiedLabel }: { text: string; label: string; copiedLabel: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(text);
          setCopied(true);
          setTimeout(() => setCopied(false), 2000);
        } catch {
          // Clipboard blocked: the link is shown as text and can be selected by hand.
        }
      }}
    >
      {copied ? <Check className="text-success" /> : <Copy />}
      {copied ? copiedLabel : label}
    </Button>
  );
}

/** Team page body: seats, invite form, members and pending invitations. */
export function TeamManager({
  members,
  invites,
  currentUserId,
  canManage,
  seats,
  maxSeats,
}: {
  members: MemberRow[];
  invites: InviteRow[];
  currentUserId: string;
  canManage: boolean;
  seats: number;
  maxSeats: number;
}) {
  const t = useTranslations();
  const format = useFormatter();
  const [state, inviteAction, inviting] = useActionState<InviteState, FormData>(inviteMemberAction, undefined);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const full = seats >= maxSeats;

  const run = (action: () => Promise<{ error?: string }>) =>
    startTransition(async () => {
      const result = await action();
      setError(result.error ?? null);
    });

  return (
    <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_22rem]">
      <div className="flex min-w-0 flex-col gap-6">
        {/* Members */}
        <Card>
          <CardHeader>
            <CardTitle>{t("team.membersTitle")}</CardTitle>
            <CardDescription>{t("team.membersSubtitle")}</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            {error && (
              <p role="alert" className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">
                {t(error)}
              </p>
            )}
            <ul className="flex flex-col gap-2.5">
              {members.map((m) => {
                const name = m.user.name ?? m.user.email;
                const self = m.userId === currentUserId;
                return (
                  <li key={m.id} className="flex flex-wrap items-center gap-3 rounded-xl border border-border/70 bg-background p-3">
                    <Avatar name={name} />
                    <div className="min-w-0 flex-1 basis-[calc(100%-3.25rem)] sm:basis-0">
                      <p className="flex items-center gap-2 truncate font-medium">
                        <span className="truncate" dir="auto">
                          {name}
                        </span>
                        {self && <span className="shrink-0 rounded-full bg-muted px-2 py-0.5 text-[11px] font-medium text-muted-foreground">{t("team.you")}</span>}
                      </p>
                      <p className="truncate text-xs text-muted-foreground" dir="ltr">
                        {m.user.email}
                      </p>
                    </div>
                    {canManage ? (
                      <div className="flex w-full items-center gap-1.5 sm:w-auto">
                        <NativeSelect
                          aria-label={t("team.role")}
                          value={m.role}
                          disabled={pending}
                          onChange={(e) => run(() => setMemberRoleAction(m.id, e.target.value))}
                          className="h-9 flex-1 sm:w-28 sm:flex-none"
                        >
                          <option value="owner">{t("roles.owner")}</option>
                          <option value="agent">{t("roles.agent")}</option>
                        </NativeSelect>
                        <Button
                          variant="ghost"
                          size="icon"
                          disabled={pending}
                          title={t("team.remove")}
                          aria-label={t("team.removeNamed", { name })}
                          onClick={() => {
                            if (window.confirm(t("team.confirmRemove", { name }))) run(() => removeMemberAction(m.id));
                          }}
                        >
                          <Trash2 className="text-destructive" />
                        </Button>
                      </div>
                    ) : (
                      <span className={cn("rounded-full px-2.5 py-1 text-xs font-semibold", ROLE_STYLE[m.role])}>{t(`roles.${m.role}`)}</span>
                    )}
                  </li>
                );
              })}
            </ul>
          </CardContent>
        </Card>

        {/* Pending invitations */}
        {invites.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>{t("team.pendingTitle")}</CardTitle>
              <CardDescription>{t("team.pendingSubtitle")}</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="flex flex-col gap-2.5">
                {invites.map((invite) => (
                  <li key={invite.id} className="flex flex-wrap items-center gap-3 rounded-xl border border-dashed border-border bg-background p-3">
                    <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-[#fff1d6] text-[#9a5b00]">
                      <MailPlus className="size-4" />
                    </span>
                    <div className="min-w-0 flex-1 basis-[calc(100%-3.25rem)] sm:basis-0">
                      <p className="truncate font-medium" dir="ltr">
                        {invite.email}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {t(`roles.${invite.role}`)} · {t("team.expires", { date: format.dateTime(invite.expiresAt, { dateStyle: "medium" }) })}
                      </p>
                    </div>
                    {canManage && (
                      <div className="flex items-center gap-1.5">
                        <CopyButton text={invite.link} label={t("team.copyLink")} copiedLabel={t("widget.copied")} />
                        <Button
                          variant="ghost"
                          size="icon"
                          disabled={pending}
                          title={t("team.revoke")}
                          aria-label={t("team.revokeNamed", { email: invite.email })}
                          onClick={() => run(() => revokeInviteAction(invite.id))}
                        >
                          <X />
                        </Button>
                      </div>
                    )}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Invite + seats */}
      <Card className="lg:sticky lg:top-24">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserPlus className="size-5 text-primary" />
            {t("team.inviteTitle")}
          </CardTitle>
          <CardDescription>{t("team.inviteSubtitle")}</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <div>
            <div className="mb-1.5 flex items-baseline justify-between text-sm">
              <span className="text-muted-foreground">{t("team.seats")}</span>
              <span className="font-medium tabular-nums">
                {seats} <span className="font-normal text-muted-foreground">{t("overview.ofMax", { max: maxSeats })}</span>
              </span>
            </div>
            <Meter value={seats} max={maxSeats} warn={false} />
          </div>

          {!canManage ? (
            <p className="text-sm text-muted-foreground">{t("team.ownerOnlyNote")}</p>
          ) : full ? (
            <p className="rounded-xl bg-[#fff8e8] p-3 text-sm text-[#7a4700] ring-1 ring-[#f5c56b]">{t("team.errors.limit")}</p>
          ) : (
            <form action={inviteAction} className="flex flex-col gap-3">
              <FormField id="invite-email" label={t("auth.email")} error={state?.fieldErrors?.email}>
                <Input id="invite-email" name="email" type="email" dir="ltr" placeholder="name@example.com" required />
              </FormField>
              <FormField id="invite-role" label={t("team.role")}>
                <NativeSelect id="invite-role" name="role" defaultValue="agent">
                  <option value="agent">{t("roles.agent")}</option>
                  <option value="owner">{t("roles.owner")}</option>
                </NativeSelect>
              </FormField>
              <p className="text-xs text-muted-foreground">{t("team.roleHelp")}</p>
              <Button type="submit" disabled={inviting}>
                <MailPlus />
                {inviting ? t("common.saving") : t("team.sendInvite")}
              </Button>
            </form>
          )}

          {state?.error && (
            <p role="alert" className="text-sm text-destructive">
              {t(state.error)}
            </p>
          )}
          {state?.ok && state.link && !inviting && (
            <div role="status" className="flex flex-col gap-2 rounded-xl bg-[#e7f8ee] p-3 text-sm text-success">
              <p className="flex items-center gap-1.5 font-medium">
                <CheckCircle2 className="size-4 shrink-0" />
                {state.emailed ? t("team.inviteSent") : t("team.inviteCreated")}
              </p>
              {!state.emailed && <p className="text-xs text-[#0b5e31]">{t("team.inviteNoEmail")}</p>}
              <code dir="ltr" className="rounded-md bg-white/70 px-2 py-1 text-[11px] break-all text-foreground">
                {state.link}
              </code>
              <div>
                <CopyButton text={state.link} label={t("team.copyLink")} copiedLabel={t("widget.copied")} />
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

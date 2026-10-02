import { MailCheck, MailWarning } from "lucide-react";
import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { Brand } from "@/components/brand";
import { ChatScene, DotPattern } from "@/components/illustrations";
import { AcceptInviteButton } from "@/components/team/accept-invite";
import { LanguageSwitcher } from "@/components/language-switcher";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { signOutAction } from "@/server/actions/auth";
import { getCurrentUser } from "@/server/auth/session";
import { findInvite } from "@/server/team";

export const metadata = { title: "Invitation" };

/**
 * The page behind an invitation link. It shows which workspace the invitation is
 * for and walks the person to accepting it: sign up or log in first if needed,
 * and only the invited email address can accept.
 */
export default async function InvitePage({ params }: PageProps<"/invite/[token]">) {
  const { token } = await params;
  const [invite, user, t] = await Promise.all([findInvite(token), getCurrentUser(), getTranslations()]);
  const usable = invite?.state === "pending";
  const rightAccount = usable && user?.email.toLowerCase() === invite.email.toLowerCase();

  return (
    <div className="relative flex min-h-screen flex-col overflow-hidden bg-muted">
      <div aria-hidden className="hero-surface absolute inset-x-0 top-0 h-72 overflow-hidden rounded-b-[2rem]">
        <DotPattern className="text-white/10" />
        <ChatScene className="absolute -end-10 top-6 w-56 opacity-30 md:end-[10%] md:w-72 md:opacity-80" />
      </div>
      <header className="relative flex items-center justify-between p-4 md:px-8">
        <Brand tone="light" />
        <LanguageSwitcher className="border-white/20 bg-white/10 text-white hover:bg-white/20 hover:text-white" />
      </header>

      <main className="relative mx-auto flex w-full max-w-md flex-1 flex-col justify-center p-4 pb-20">
        <Card className="shadow-xl">
          <CardContent className="flex flex-col items-center gap-4 text-center">
            <span className={`flex size-14 items-center justify-center rounded-full ${usable ? "bg-accent text-primary" : "bg-[#fff1d6] text-[#9a5b00]"}`}>
              {usable ? <MailCheck className="size-6" /> : <MailWarning className="size-6" />}
            </span>

            {!invite || invite.state === "accepted" ? (
              <>
                <h1 className="text-xl font-bold">{t("invite.invalidTitle")}</h1>
                <p className="text-sm text-muted-foreground">{t("invite.invalid")}</p>
              </>
            ) : invite.state === "expired" ? (
              <>
                <h1 className="text-xl font-bold">{t("invite.expiredTitle")}</h1>
                <p className="text-sm text-muted-foreground">{t("invite.expired")}</p>
              </>
            ) : (
              <>
                <h1 className="text-xl font-bold" dir="auto">
                  {t("invite.title", { business: invite.workspace.name })}
                </h1>
                <p className="text-sm text-muted-foreground">
                  {t("invite.body", { role: t(`roles.${invite.role}`) })} <span dir="ltr" className="font-medium text-foreground">{invite.email}</span>
                </p>

                {rightAccount ? (
                  <AcceptInviteButton token={token} />
                ) : user ? (
                  // Signed in, but as someone else.
                  <>
                    <p className="rounded-xl bg-[#fff8e8] p-3 text-sm text-[#7a4700] ring-1 ring-[#f5c56b]">
                      {t("invite.wrong_account")} <span dir="ltr" className="font-medium">{user.email}</span>
                    </p>
                    <form action={signOutAction} className="w-full">
                      <button type="submit" className={buttonVariants({ variant: "outline", size: "lg", className: "w-full" })}>
                        {t("common.signOut")}
                      </button>
                    </form>
                  </>
                ) : (
                  <div className="flex w-full flex-col gap-2">
                    <Link href={`/signup?invite=${token}`} className={buttonVariants({ size: "lg", className: "w-full" })}>
                      {t("invite.signup")}
                    </Link>
                    <Link href={`/login?invite=${token}`} className={buttonVariants({ variant: "outline", size: "lg", className: "w-full" })}>
                      {t("invite.login")}
                    </Link>
                  </div>
                )}
              </>
            )}

            {(!usable || !invite) && (
              <Link href={user ? "/dashboard" : "/login"} className={buttonVariants({ variant: "outline", className: "mt-1" })}>
                {t(user ? "invite.toDashboard" : "auth.login")}
              </Link>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}

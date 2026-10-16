import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { ResetPasswordForm } from "@/components/auth/account-forms";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { peekToken } from "@/server/auth/account";

export const metadata = { title: "Choose a new password" };

/** The link from a password-reset email. A dead link gets a way to ask for a new one instead of a form. */
export default async function ResetPasswordPage({ params }: PageProps<"/reset-password/[token]">) {
  const { token } = await params;
  if (await peekToken(token, "reset_password")) return <ResetPasswordForm token={token} />;
  const t = await getTranslations();
  return (
    <Card className="shadow-xl">
      <CardHeader>
        <CardTitle className="text-2xl font-bold">{t("auth.resetTitle")}</CardTitle>
        <CardDescription className="text-[15px]">{t("auth.resetInvalid")}</CardDescription>
      </CardHeader>
      <CardContent>
        <Link href="/forgot-password" className="font-medium underline underline-offset-4">
          {t("auth.requestNewLink")}
        </Link>
      </CardContent>
    </Card>
  );
}

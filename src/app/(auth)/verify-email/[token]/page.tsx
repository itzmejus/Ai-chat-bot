import { CircleCheck, CircleX } from "lucide-react";
import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { verifyEmail } from "@/server/auth/account";

export const metadata = { title: "Confirm your email" };

/** The link from the confirmation email. Works whether or not the person is logged in on this device. */
export default async function VerifyEmailPage({ params }: PageProps<"/verify-email/[token]">) {
  const { token } = await params;
  const ok = await verifyEmail(token);
  const t = await getTranslations();
  const Icon = ok ? CircleCheck : CircleX;
  return (
    <Card className="shadow-xl">
      <CardHeader>
        <Icon className={ok ? "size-10 text-success" : "size-10 text-destructive"} />
        <CardTitle className="text-2xl font-bold">{t(ok ? "auth.verifyOkTitle" : "auth.verifyBadTitle")}</CardTitle>
        <CardDescription className="text-[15px]">{t(ok ? "auth.verifyOkText" : "auth.verifyBadText")}</CardDescription>
      </CardHeader>
      <CardContent>
        <Link href="/dashboard" className="font-medium underline underline-offset-4">
          {t("auth.goToDashboard")}
        </Link>
      </CardContent>
    </Card>
  );
}

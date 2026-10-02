import { getTranslations } from "next-intl/server";
import { LanguageSwitcher } from "@/components/language-switcher";
import { OnboardingForm } from "@/components/onboarding-form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { APP_NAME } from "@/lib/config";
import { requireUser } from "@/server/auth/session";

export const metadata = { title: "Set up your business" };

/** Step after signup: create the workspace. Also used to add another workspace. */
export default async function OnboardingPage() {
  await requireUser();
  const t = await getTranslations("onboarding");

  return (
    <div className="flex min-h-screen flex-col bg-muted/40">
      <header className="flex items-center justify-between p-4">
        <span className="text-lg font-semibold">{APP_NAME}</span>
        <LanguageSwitcher />
      </header>
      <main className="mx-auto w-full max-w-2xl flex-1 p-4 pb-12">
        <Card>
          <CardHeader>
            <CardTitle className="text-xl">{t("title")}</CardTitle>
            <CardDescription>{t("subtitle")}</CardDescription>
          </CardHeader>
          <CardContent>
            <OnboardingForm />
          </CardContent>
        </Card>
      </main>
    </div>
  );
}

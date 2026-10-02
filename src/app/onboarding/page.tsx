import { getTranslations } from "next-intl/server";
import { Brand } from "@/components/brand";
import { ChatScene, DotPattern } from "@/components/illustrations";
import { LanguageSwitcher } from "@/components/language-switcher";
import { OnboardingForm } from "@/components/onboarding-form";
import { Card, CardContent } from "@/components/ui/card";
import { requireUser } from "@/server/auth/session";

export const metadata = { title: "Set up your business" };

/** Step after signup: create the workspace. Also used to add another workspace. */
export default async function OnboardingPage() {
  await requireUser();
  const t = await getTranslations("onboarding");

  return (
    <div className="relative flex min-h-screen flex-col overflow-hidden bg-muted">
      {/* Dark band behind the top of the form, echoing the dashboard sidebar */}
      <div aria-hidden className="hero-surface absolute inset-x-0 top-0 h-72 overflow-hidden rounded-b-[2rem]">
        <DotPattern className="text-white/10" />
        <ChatScene className="absolute -end-8 top-6 w-56 opacity-40 md:end-[8%] md:w-72 md:opacity-90" />
      </div>

      <header className="relative flex items-center justify-between p-4 md:px-8">
        <Brand tone="light" />
        <LanguageSwitcher className="border-white/20 bg-white/10 text-white hover:bg-white/20 hover:text-white" />
      </header>

      <main className="relative mx-auto w-full max-w-2xl flex-1 p-4 pb-16">
        <div className="mb-6 max-w-[85%] px-1 text-white md:max-w-md">
          <h1 className="text-2xl font-bold tracking-tight md:text-3xl">{t("title")}</h1>
          <p className="mt-2 max-w-xl text-white/65">{t("subtitle")}</p>
        </div>
        <Card className="shadow-xl">
          <CardContent>
            <OnboardingForm />
          </CardContent>
        </Card>
      </main>
    </div>
  );
}

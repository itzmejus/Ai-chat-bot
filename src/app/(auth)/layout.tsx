import { Check } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { Brand } from "@/components/brand";
import { LanguageSwitcher } from "@/components/language-switcher";

/** A short sample conversation that shows what the product does, in both languages. */
const SAMPLE_CHAT: { from: "customer" | "assistant"; text: string }[] = [
  { from: "customer", text: "Hi, how much is teeth cleaning?" },
  { from: "assistant", text: "Teeth cleaning is AED 250 and takes about 45 minutes. Would you like to book?" },
  { from: "customer", text: "هل تقبلون تأمين ضمان؟" },
  { from: "assistant", text: "نعم، نقبل تأمين ضمان. هل تودّ حجز موعد؟" },
];

/** Login and signup: brand panel on one side (desktop), form on the other. */
export default async function AuthLayout({ children }: LayoutProps<"/">) {
  const t = await getTranslations("auth");

  return (
    <div className="grid min-h-screen lg:grid-cols-[minmax(0,5fr)_minmax(0,6fr)]">
      {/* Brand panel */}
      <aside className="relative hidden flex-col justify-between overflow-hidden bg-sidebar p-10 text-sidebar-foreground lg:flex">
        {/* Soft colour glows behind the content */}
        <div aria-hidden className="pointer-events-none absolute -start-32 -top-32 size-96 rounded-full bg-primary/35 blur-3xl" />
        <div aria-hidden className="pointer-events-none absolute -end-24 bottom-0 size-80 rounded-full bg-[#ffd000]/15 blur-3xl" />

        <Brand tone="light" className="relative" />

        <div className="relative flex flex-col gap-8">
          <h1 className="max-w-md text-4xl leading-[1.15] font-bold tracking-tight text-white">{t("tagline")}</h1>
          <ul className="flex flex-col gap-3 text-[15px] text-sidebar-foreground/80">
            {(["point1", "point2", "point3"] as const).map((key) => (
              <li key={key} className="flex items-center gap-3">
                <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-primary text-white">
                  <Check className="size-3" strokeWidth={3} />
                </span>
                {t(key)}
              </li>
            ))}
          </ul>
        </div>

        <div aria-hidden className="relative flex max-w-md flex-col gap-2.5">
          {SAMPLE_CHAT.map((m) => (
            <p
              key={m.text}
              dir="auto"
              className={
                m.from === "customer"
                  ? "max-w-[80%] self-end rounded-2xl rounded-ee-md bg-white px-4 py-2.5 text-sm text-[#1b1b20] shadow-lg"
                  : "max-w-[80%] self-start rounded-2xl rounded-es-md bg-white/10 px-4 py-2.5 text-sm text-white ring-1 ring-white/15 backdrop-blur"
              }
            >
              {m.text}
            </p>
          ))}
        </div>
      </aside>

      {/* Form */}
      <div className="flex flex-col bg-muted">
        <header className="flex items-center justify-between p-4 md:px-8">
          <Brand className="lg:invisible" />
          <LanguageSwitcher />
        </header>
        <main className="flex flex-1 items-center justify-center p-4 pb-16">
          <div className="w-full max-w-md">{children}</div>
        </main>
      </div>
    </div>
  );
}

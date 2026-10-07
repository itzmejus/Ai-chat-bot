import { Check } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { Brand } from "@/components/brand";
import { ChatScene, DotPattern } from "@/components/illustrations";
import { LanguageSwitcher } from "@/components/language-switcher";

/** A short sample conversation that shows what the product does, in both languages. */
const SAMPLE_CHAT: { from: "customer" | "assistant"; text: string }[] = [
  { from: "customer", text: "Hi, how much is teeth cleaning?" },
  { from: "assistant", text: "Teeth cleaning is $80 and takes about 45 minutes. Would you like to book?" },
  { from: "customer", text: "¿Aceptan mi seguro dental?" },
  { from: "assistant", text: "Sí, trabajamos con la mayoría de los seguros. ¿Quiere reservar una cita?" },
];

const darkSwitcher = "border-white/20 bg-white/10 text-white hover:bg-white/20 hover:text-white";

/**
 * Login and signup.
 * Desktop: brand panel on one side, form on the other.
 * Mobile: a dark illustrated header with the form card overlapping it.
 */
export default async function AuthLayout({ children }: LayoutProps<"/">) {
  const t = await getTranslations("auth");

  return (
    <div className="grid min-h-screen lg:grid-cols-[minmax(0,5fr)_minmax(0,6fr)]">
      {/* Brand panel (desktop) */}
      <aside className="hero-surface relative hidden flex-col justify-between overflow-hidden p-10 text-sidebar-foreground lg:flex">
        <DotPattern className="text-white/10" />
        <Brand tone="light" className="relative" />

        <div className="relative flex flex-col gap-8">
          <ChatScene className="-ms-6 w-80" />
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
          {SAMPLE_CHAT.slice(0, 2).map((m) => (
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

      <div className="relative flex flex-col bg-muted">
        {/* Illustrated header (mobile and tablet) */}
        <div className="hero-surface absolute inset-x-0 top-0 h-80 overflow-hidden rounded-b-[2rem] lg:hidden">
          <DotPattern className="text-white/10" />
          <ChatScene className="absolute -end-20 top-4 w-56 opacity-30" />
        </div>

        <header className="relative flex items-center justify-between p-4 md:px-8">
          <Brand tone="light" className="lg:invisible" />
          <LanguageSwitcher className={`lg:hidden ${darkSwitcher}`} />
          <LanguageSwitcher className="hidden lg:inline-flex" />
        </header>

        <main className="relative flex flex-1 flex-col items-center p-4 pb-16 lg:justify-center">
          <p className="mt-4 mb-6 w-full max-w-md px-1 text-2xl leading-snug font-bold tracking-tight text-white lg:hidden">{t("tagline")}</p>
          <div className="w-full max-w-md">{children}</div>
        </main>
      </div>
    </div>
  );
}

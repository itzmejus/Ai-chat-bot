import { LanguageSwitcher } from "@/components/language-switcher";
import { APP_NAME } from "@/lib/config";

/** Centered card layout for login and signup. */
export default function AuthLayout({ children }: LayoutProps<"/">) {
  return (
    <div className="flex min-h-screen flex-col bg-muted/40">
      <header className="flex items-center justify-between p-4">
        <span className="text-lg font-semibold">{APP_NAME}</span>
        <LanguageSwitcher />
      </header>
      <main className="flex flex-1 items-center justify-center p-4">
        <div className="w-full max-w-sm">{children}</div>
      </main>
    </div>
  );
}

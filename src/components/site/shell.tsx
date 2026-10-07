import { ArrowRight, Languages } from "lucide-react";
import Link from "next/link";
import { Brand } from "@/components/brand";
import { DotPattern } from "@/components/illustrations";
import { getSiteContent } from "@/content/site";
import { APP_NAME, CONTACT_EMAIL } from "@/lib/config";
import { INDUSTRY_SLUGS, sitePath, type SiteLang } from "@/lib/site-routes";
import { appLink } from "@/lib/site-seo";
import { cn } from "@/lib/utils";
import { GlobeMark } from "./art";
import { MobileMenu } from "./mobile-menu";

/** Button-styled link used across the site. */
export function CtaLink({
  href,
  children,
  variant = "primary",
  size = "md",
  className,
  arrow = false,
}: {
  href: string;
  children: React.ReactNode;
  variant?: "primary" | "dark" | "outline" | "light" | "ghost-light";
  size?: "md" | "lg";
  className?: string;
  arrow?: boolean;
}) {
  return (
    <a
      href={href}
      className={cn(
        "group inline-flex items-center justify-center gap-2 rounded-xl font-semibold whitespace-nowrap transition-[background-color,box-shadow,transform] active:translate-y-px",
        size === "lg" ? "h-13 px-7 text-base" : "h-11 px-5 text-[15px]",
        variant === "primary" && "bg-primary text-white shadow-[0_8px_24px_-8px_rgb(220_38_38/0.7),inset_0_1px_0_rgb(255_255_255/0.2)] hover:bg-[#b91c1c]",
        variant === "dark" && "bg-foreground text-white hover:bg-foreground/85",
        variant === "outline" && "border border-border bg-white text-foreground hover:bg-muted",
        variant === "light" && "bg-white text-foreground hover:bg-white/90",
        variant === "ghost-light" && "border border-white/25 bg-white/10 text-white hover:bg-white/20",
        className,
      )}
    >
      {children}
      {arrow && <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5 rtl:rotate-180 rtl:group-hover:-translate-x-0.5" />}
    </a>
  );
}

/**
 * Header, main and footer for every public page.
 * `page` is the page's path without language ("" for home), used for the language link.
 */
export function SiteShell({ lang, page, children }: { lang: SiteLang; page: string; children: React.ReactNode }) {
  const t = getSiteContent(lang);
  const other: SiteLang = lang === "en" ? "ar" : "en";
  const href = (p: string) => sitePath(lang, p);

  const nav = [
    { href: href("/features"), label: t.nav.features },
    { href: href("/industries"), label: t.nav.industries },
    { href: href("/pricing"), label: t.nav.pricing },
  ];
  const login = { href: appLink("/login"), label: t.nav.login };
  const start = { href: appLink("/signup"), label: t.nav.start };
  const language = { href: sitePath(other, page), label: t.nav.otherLanguage, lang: other };

  return (
    <div className="flex min-h-screen flex-col overflow-x-clip bg-white text-foreground">
      <a href="#content" className="sr-only focus:not-sr-only focus:fixed focus:start-4 focus:top-4 focus:z-50 focus:rounded-lg focus:bg-primary focus:px-4 focus:py-2 focus:text-white">
        {t.nav.skip}
      </a>

      <header className="sticky top-0 z-40 border-b border-border/60 bg-white/85 backdrop-blur-md">
        <div className="relative mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
          <Link href={href("")} aria-label={APP_NAME} className="shrink-0">
            <Brand />
          </Link>

          <nav aria-label={t.nav.menu} className="hidden items-center gap-1 lg:flex">
            {nav.map((item) => (
              <Link key={item.href} href={item.href} className="rounded-lg px-3.5 py-2 text-[15px] font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground">
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="hidden items-center gap-2 lg:flex">
            <a href={language.href} lang={other} hrefLang={other} className="flex h-10 items-center gap-1.5 rounded-lg px-3 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground">
              <Languages className="size-4" />
              {language.label}
            </a>
            <a href={login.href} className="flex h-10 items-center rounded-lg px-3.5 text-[15px] font-medium transition-colors hover:bg-muted">
              {login.label}
            </a>
            <CtaLink href={start.href}>{start.label}</CtaLink>
          </div>

          <MobileMenu label={t.nav.menu} items={nav} login={login} start={start} language={language} />
        </div>
      </header>

      <main id="content" className="flex-1">
        {children}
      </main>

      <footer className="relative overflow-hidden bg-sidebar text-white">
        <DotPattern className="text-white/[0.06]" />
        {/* Compact on phones: short paddings, the two buttons side by side, and the links in two
            columns with the long industries list beside the two short ones. */}
        <div className="relative mx-auto grid max-w-6xl gap-8 px-4 pt-9 pb-8 sm:gap-10 sm:px-6 sm:pt-12 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,2fr)] lg:gap-16 lg:pt-14 lg:pb-12">
          <div className="flex flex-col items-start gap-4">
            <Link href={href("")} aria-label={APP_NAME}>
              <Brand tone="light" className="text-xl" />
            </Link>
            <p className="max-w-sm text-sm leading-relaxed text-white/65 sm:text-[15px]">{t.footer.tagline}</p>
            <div className="flex w-full gap-2.5 sm:w-auto sm:gap-3">
              <CtaLink href={start.href} arrow className="max-sm:flex-1 max-sm:px-3">
                {start.label}
              </CtaLink>
              <CtaLink href={login.href} variant="ghost-light" className="max-sm:flex-1 max-sm:px-3">
                {login.label}
              </CtaLink>
            </div>
          </div>

          <nav aria-label={t.footer.product} className="grid grid-cols-2 gap-x-6 gap-y-7 sm:grid-cols-3 sm:gap-y-10">
            <FooterColumn title={t.footer.product}>
              <FooterLink href={href("/features")}>{t.nav.features}</FooterLink>
              <FooterLink href={href("/pricing")}>{t.nav.pricing}</FooterLink>
              <FooterLink href={href("/industries")}>{t.nav.industries}</FooterLink>
            </FooterColumn>
            <FooterColumn title={t.footer.industries} className="max-sm:row-span-2">
              {INDUSTRY_SLUGS.map((slug) => (
                <FooterLink key={slug} href={href(`/industries/${slug}`)}>
                  {t.industries[slug].name}
                </FooterLink>
              ))}
            </FooterColumn>
            <FooterColumn title={t.footer.company}>
              <FooterLink href={href("/privacy")}>{t.footer.privacy}</FooterLink>
              <FooterLink href={href("/terms")}>{t.footer.terms}</FooterLink>
              {CONTACT_EMAIL && (
                <FooterLink href={`mailto:${CONTACT_EMAIL}`} external>
                  {t.footer.contact}
                </FooterLink>
              )}
            </FooterColumn>
          </nav>
        </div>

        <div className="relative border-t border-white/10">
          <div className="mx-auto flex max-w-6xl flex-col gap-3 px-4 py-4 text-[13px] text-white/55 sm:flex-row sm:items-center sm:justify-between sm:px-6 sm:py-5 sm:text-sm">
            <p>
              © {new Date().getFullYear()} {APP_NAME}. {t.footer.rights}
            </p>
            <div className="flex flex-wrap items-center justify-between gap-x-5 gap-y-3">
              <p className="flex items-center gap-2">
                <GlobeMark />
                {t.footer.madeIn}
              </p>
              <a
                href={language.href}
                lang={other}
                hrefLang={other}
                className="flex h-9 items-center gap-1.5 rounded-full border border-white/15 bg-white/5 px-3.5 font-medium text-white/85 transition-colors hover:bg-white/10 hover:text-white"
              >
                <Languages className="size-4" />
                {language.label}
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

function FooterColumn({ title, children, className }: { title: string; children: React.ReactNode; className?: string }) {
  return (
    <div className={cn("flex min-w-0 flex-col gap-2.5 sm:gap-3.5", className)}>
      <h2 className="text-xs font-semibold tracking-wider text-white/45 uppercase">{title}</h2>
      {children}
    </div>
  );
}

function FooterLink({ href, children, external }: { href: string; children: React.ReactNode; external?: boolean }) {
  const className = "w-fit text-sm text-white/75 transition-colors hover:text-white sm:text-[15px]";
  return external ? (
    <a href={href} className={className}>
      {children}
    </a>
  ) : (
    <Link href={href} className={className}>
      {children}
    </Link>
  );
}

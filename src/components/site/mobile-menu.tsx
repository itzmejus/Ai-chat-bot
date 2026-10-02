"use client";

import { Menu, X } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

type Item = { href: string; label: string };

/** Phone navigation: a button that opens a full-width panel under the header. */
export function MobileMenu({ label, items, login, start, language }: { label: string; items: Item[]; login: Item; start: Item; language: Item & { lang: string } }) {
  const [open, setOpen] = useState(false);

  // Close with Escape.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <div className="lg:hidden">
      <button
        type="button"
        aria-label={label}
        aria-expanded={open}
        aria-controls="site-mobile-menu"
        onClick={() => setOpen((v) => !v)}
        className="flex size-11 items-center justify-center rounded-xl border border-border bg-white text-foreground"
      >
        {open ? <X className="size-5" /> : <Menu className="size-5" />}
      </button>

      {open && (
        <div id="site-mobile-menu" className="absolute inset-x-0 top-full border-b border-border bg-white px-4 pt-2 pb-5 shadow-[0_24px_40px_-24px_rgb(27_27_32/0.35)]">
          <nav className="flex flex-col">
            {items.map((item) => (
              <Link key={item.href} href={item.href} onClick={() => setOpen(false)} className="border-b border-border/60 py-3.5 text-base font-medium">
                {item.label}
              </Link>
            ))}
            <a href={language.href} lang={language.lang} hrefLang={language.lang} className="border-b border-border/60 py-3.5 text-base font-medium">
              {language.label}
            </a>
          </nav>
          <div className="mt-4 grid grid-cols-2 gap-3">
            <a href={login.href} className="flex h-12 items-center justify-center rounded-xl border border-border text-[15px] font-semibold">
              {login.label}
            </a>
            <a href={start.href} className="flex h-12 items-center justify-center rounded-xl bg-primary text-[15px] font-semibold text-white">
              {start.label}
            </a>
          </div>
        </div>
      )}
    </div>
  );
}

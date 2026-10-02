import { cookies, headers } from "next/headers";
import { getRequestConfig } from "next-intl/server";
import { DEFAULT_LOCALE, LOCALE_COOKIE, LOCALES, type Locale } from "@/lib/config";

const isLocale = (value: string | null | undefined): value is Locale => (LOCALES as readonly string[]).includes(value ?? "");

/**
 * next-intl request config.
 *  - Dashboard: the language comes from a cookie set by the language switcher (no URL prefix).
 *  - Public site: the language is part of the URL ("/ar/..."), so search engines see one
 *    language per address. The proxy passes it on in the "x-site-locale" header, which wins.
 */
export default getRequestConfig(async () => {
  const fromUrl = (await headers()).get("x-site-locale");
  const cookie = (await cookies()).get(LOCALE_COOKIE)?.value;
  const locale: Locale = isLocale(fromUrl) ? fromUrl : isLocale(cookie) ? cookie : DEFAULT_LOCALE;

  return {
    locale,
    // One fixed zone so server and browser render the same times.
    timeZone: "Asia/Dubai",
    messages: (await import(`./messages/${locale}.json`)).default,
  };
});

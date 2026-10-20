import { PAGE_IMAGES } from "@/content/site/page-images";
import type { SiteLang } from "@/lib/site-routes";
import { cn } from "@/lib/utils";

/**
 * The illustration of an industry, integration, use-case or blog page. Generated from the scene
 * written for the page in src/content/site/page-images.ts (see scripts/generate-page-images.ts),
 * stored in public/images/pages as WebP in three widths, plus a 1200x630 JPEG for link previews.
 */

export const PAGE_IMAGE_WIDTHS = [480, 960, 1440] as const;
const RATIO = 2 / 3; // 3:2 pictures

const fileBase = (page: string) => `/images/pages/${page.replace(/^\//, "").replace(/\//g, "-")}`;

export function pageImage(page: string) {
  const entry = PAGE_IMAGES[page];
  if (!entry) return null;
  const base = fileBase(page);
  return {
    alt: entry.alt,
    src: `${base}-960.webp`,
    srcSet: PAGE_IMAGE_WIDTHS.map((w) => `${base}-${w}.webp ${w}w`).join(", "),
    og: `${base}-og.jpg`,
  };
}

/** Public paths of every file a page's picture is made of; the test suite checks they exist. */
export const pageImageFiles = (page: string) => [...PAGE_IMAGE_WIDTHS.map((w) => `${fileBase(page)}-${w}.webp`), `${fileBase(page)}-og.jpg`];

/** The large picture at the top of a page. Nothing when the page has none. */
export function PageFigure({ lang, page, className }: { lang: SiteLang; page: string; className?: string }) {
  const image = pageImage(page);
  if (!image) return null;
  return (
    <figure className={cn("overflow-hidden rounded-3xl border border-border/60 bg-muted shadow-[0_32px_64px_-36px_rgb(27_27_32/0.45)]", className)}>
      {/* eslint-disable-next-line @next/next/no-img-element -- pre-sized WebP files; srcSet picks the right one */}
      <img
        src={image.src}
        srcSet={image.srcSet}
        sizes="(min-width: 768px) 720px, calc(100vw - 32px)"
        width={1440}
        height={1440 * RATIO}
        alt={image.alt[lang]}
        fetchPriority="high"
        className="block h-auto w-full"
      />
    </figure>
  );
}

/** A smaller copy at the top of a card that links to the page. */
export function CardImage({ lang, page, className }: { lang: SiteLang; page: string; className?: string }) {
  const image = pageImage(page);
  if (!image) return null;
  return (
    // eslint-disable-next-line @next/next/no-img-element -- pre-sized WebP files; srcSet picks the right one
    <img
      src={`${fileBase(page)}-480.webp`}
      srcSet={image.srcSet}
      sizes="(min-width: 1024px) 360px, (min-width: 640px) 45vw, calc(100vw - 32px)"
      width={480}
      height={480 * RATIO}
      alt={image.alt[lang]}
      loading="lazy"
      className={cn("block aspect-[3/2] h-auto w-full rounded-2xl bg-muted object-cover", className)}
    />
  );
}

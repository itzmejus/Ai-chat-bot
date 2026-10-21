import { ArrowRight } from "lucide-react";
import Link from "next/link";
import type { LocalLink } from "@/content/site/local/pages";
import { sitePath } from "@/lib/site-routes";

/** A compact list of text links, the backbone of the local pages' internal linking. */
export function LinkList({ links, columns = 3 }: { links: LocalLink[]; columns?: 2 | 3 | 4 }) {
  const cols = { 2: "sm:grid-cols-2", 3: "sm:grid-cols-2 lg:grid-cols-3", 4: "sm:grid-cols-2 lg:grid-cols-4" }[columns];
  return (
    <ul className={`grid gap-x-6 gap-y-1 ${cols}`}>
      {links.map((link) => (
        <li key={link.page}>
          <Link href={sitePath("en", link.page)} className="group flex items-center gap-2 rounded-lg py-1.5 text-[15px] text-foreground/80 hover:text-primary">
            <ArrowRight className="size-3.5 shrink-0 text-primary/60 transition-transform group-hover:translate-x-0.5" />
            <span className="min-w-0">{link.label}</span>
          </Link>
        </li>
      ))}
    </ul>
  );
}

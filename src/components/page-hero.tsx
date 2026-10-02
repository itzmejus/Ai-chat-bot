import { DotPattern } from "@/components/illustrations";

/** The dark banner at the top of a dashboard page: title, subtitle and an optional illustration or figures. */
export function PageHero({ title, subtitle, children, illustration }: { title: string; subtitle: string; children?: React.ReactNode; illustration?: React.ReactNode }) {
  return (
    <section className="hero-surface relative overflow-hidden rounded-3xl p-5 text-white shadow-xl sm:p-8">
      <DotPattern className="text-white/10" />
      {illustration}
      <div className="relative flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
        <div className="max-w-[85%] sm:max-w-xl">
          <h1 className="text-[26px] leading-tight font-bold tracking-tight sm:text-4xl">{title}</h1>
          <p className="mt-2 text-sm text-white/65 sm:text-base">{subtitle}</p>
        </div>
        {children}
      </div>
    </section>
  );
}

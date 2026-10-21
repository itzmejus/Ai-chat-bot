import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { localMetadata, LocalPageView } from "@/components/site/local-page";
import { localPage } from "@/content/site/local/pages";

/** "AI chatbot for clinics in Dubai". English only. */
async function find(params: PageProps<"/[lang]/industries/[slug]/[city]">["params"]) {
  const { lang, slug, city } = await params;
  return lang === "en" ? localPage(`/industries/${slug}/${city}`) : null;
}

export async function generateMetadata({ params }: PageProps<"/[lang]/industries/[slug]/[city]">): Promise<Metadata> {
  const data = await find(params);
  return data ? localMetadata(data) : {};
}

export default async function IndustryCityPage({ params }: PageProps<"/[lang]/industries/[slug]/[city]">) {
  const data = await find(params);
  if (!data) notFound();
  return <LocalPageView data={data} />;
}

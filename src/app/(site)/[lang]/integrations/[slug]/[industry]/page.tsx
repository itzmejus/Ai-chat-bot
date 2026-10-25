import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { localMetadata, LocalPageView } from "@/components/site/local-page";
import { localPage } from "@/content/site/local/pages";

/** "AI chatbot for clinic websites on WordPress". English only. */
async function find(params: PageProps<"/[lang]/integrations/[slug]/[industry]">["params"]) {
  const { lang, slug, industry } = await params;
  return lang === "en" ? localPage(`/integrations/${slug}/${industry}`) : null;
}

export async function generateMetadata({ params }: PageProps<"/[lang]/integrations/[slug]/[industry]">): Promise<Metadata> {
  const data = await find(params);
  return data ? localMetadata(data) : {};
}

export default async function PlatformIndustryPage({ params }: PageProps<"/[lang]/integrations/[slug]/[industry]">) {
  const data = await find(params);
  if (!data) notFound();
  return <LocalPageView data={data} />;
}

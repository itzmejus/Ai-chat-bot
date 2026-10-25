import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { localMetadata, LocalPageView } from "@/components/site/local-page";
import { localPage } from "@/content/site/local/pages";

/** "AI chatbot for businesses in Dubai". English only. */
async function find(params: PageProps<"/[lang]/locations/[city]">["params"]) {
  const { lang, city } = await params;
  return lang === "en" ? localPage(`/locations/${city}`) : null;
}

export async function generateMetadata({ params }: PageProps<"/[lang]/locations/[city]">): Promise<Metadata> {
  const data = await find(params);
  return data ? localMetadata(data) : {};
}

export default async function CityPage({ params }: PageProps<"/[lang]/locations/[city]">) {
  const data = await find(params);
  if (!data) notFound();
  return <LocalPageView data={data} />;
}

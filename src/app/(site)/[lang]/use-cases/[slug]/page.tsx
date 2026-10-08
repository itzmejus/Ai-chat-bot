import type { Metadata } from "next";
import { topicMetadata, TopicPageView } from "@/components/site/topic";

export async function generateMetadata({ params }: PageProps<"/[lang]/use-cases/[slug]">): Promise<Metadata> {
  const { lang, slug } = await params;
  return topicMetadata(lang, "useCases", slug);
}

export default async function UseCasePage({ params }: PageProps<"/[lang]/use-cases/[slug]">) {
  const { lang, slug } = await params;
  return <TopicPageView lang={lang} group="useCases" slug={slug} />;
}

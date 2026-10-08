import type { Metadata } from "next";
import { topicMetadata, TopicPageView } from "@/components/site/topic";

export async function generateMetadata({ params }: PageProps<"/[lang]/integrations/[slug]">): Promise<Metadata> {
  const { lang, slug } = await params;
  return topicMetadata(lang, "integrations", slug);
}

export default async function IntegrationPage({ params }: PageProps<"/[lang]/integrations/[slug]">) {
  const { lang, slug } = await params;
  return <TopicPageView lang={lang} group="integrations" slug={slug} />;
}

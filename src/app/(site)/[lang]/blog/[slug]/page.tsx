import type { Metadata } from "next";
import { topicMetadata, TopicPageView } from "@/components/site/topic";

export async function generateMetadata({ params }: PageProps<"/[lang]/blog/[slug]">): Promise<Metadata> {
  const { lang, slug } = await params;
  return topicMetadata(lang, "guides", slug);
}

export default async function BlogPage({ params }: PageProps<"/[lang]/blog/[slug]">) {
  const { lang, slug } = await params;
  return <TopicPageView lang={lang} group="guides" slug={slug} />;
}

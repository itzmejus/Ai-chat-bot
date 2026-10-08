import type { Metadata } from "next";
import { hubMetadata, TopicHub } from "@/components/site/topic";

export async function generateMetadata({ params }: PageProps<"/[lang]/blog">): Promise<Metadata> {
  return hubMetadata((await params).lang, "guides");
}

export default async function BlogIndexPage({ params }: PageProps<"/[lang]/blog">) {
  return <TopicHub lang={(await params).lang} group="guides" />;
}

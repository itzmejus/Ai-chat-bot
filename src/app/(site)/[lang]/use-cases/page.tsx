import type { Metadata } from "next";
import { hubMetadata, TopicHub } from "@/components/site/topic";

export async function generateMetadata({ params }: PageProps<"/[lang]/use-cases">): Promise<Metadata> {
  return hubMetadata((await params).lang, "useCases");
}

export default async function UseCaseIndexPage({ params }: PageProps<"/[lang]/use-cases">) {
  return <TopicHub lang={(await params).lang} group="useCases" />;
}

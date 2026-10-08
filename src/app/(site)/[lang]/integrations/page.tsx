import type { Metadata } from "next";
import { hubMetadata, TopicHub } from "@/components/site/topic";

export async function generateMetadata({ params }: PageProps<"/[lang]/integrations">): Promise<Metadata> {
  return hubMetadata((await params).lang, "integrations");
}

export default async function IntegrationIndexPage({ params }: PageProps<"/[lang]/integrations">) {
  return <TopicHub lang={(await params).lang} group="integrations" />;
}

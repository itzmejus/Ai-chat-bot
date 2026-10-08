import type { Metadata } from "next";
import { faqMetadata, FaqPageView } from "@/components/site/topic";

export async function generateMetadata({ params }: PageProps<"/[lang]/faq">): Promise<Metadata> {
  return faqMetadata((await params).lang);
}

export default async function FaqPage({ params }: PageProps<"/[lang]/faq">) {
  return <FaqPageView lang={(await params).lang} />;
}

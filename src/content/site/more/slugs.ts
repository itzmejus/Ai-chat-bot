import type { GuideSlug, IndustrySlug, IntegrationSlug, UseCaseSlug } from "@/lib/site-routes";

/**
 * The pages added in the October 2026 content expansion. Their text lives in this folder, one
 * file per group and language, and is merged into en.ts / ar.ts / topics-*.ts.
 */
export type NewIndustry = Exclude<IndustrySlug, "clinics" | "real-estate" | "salons" | "restaurants" | "car-rental" | "coach-hire" | "retail">;
export type NewIntegration = Exclude<IntegrationSlug, "wordpress" | "shopify" | "wix" | "webflow" | "squarespace">;
export type NewUseCase = Exclude<UseCaseSlug, "lead-generation" | "customer-support" | "multilingual-support" | "after-hours-support">;
export type NewGuide = Exclude<GuideSlug, "add-ai-chatbot-to-website" | "train-chatbot-on-your-content" | "ai-chatbot-vs-live-chat" | "chatbot-lead-capture">;

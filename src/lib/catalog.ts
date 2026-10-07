/**
 * What a business calls the things it sells. One table (`Product`) holds them all;
 * only the wording in the dashboard changes with the industry.
 */
export type CatalogVariant = "products" | "services" | "menu";

export function catalogVariant(industry: string): CatalogVariant {
  if (industry === "restaurant") return "menu";
  if (industry === "clinic" || industry === "salon") return "services";
  return "products";
}

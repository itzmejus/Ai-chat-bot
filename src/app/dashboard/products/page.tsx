import { CircleCheckBig, Image as ImageIcon, ShoppingBag, type LucideIcon } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { PageHero } from "@/components/page-hero";
import { ProductManager } from "@/components/products/product-manager";
import { catalogVariant } from "@/lib/catalog";
import { requireWorkspace } from "@/server/auth/session";
import { listProducts, MAX_PRODUCTS } from "@/server/products";
import { storageConfigured } from "@/server/storage";

export const metadata = { title: "Products" };

function HeroStat({ icon: Icon, label, value }: { icon: LucideIcon; label: string; value: number }) {
  return (
    <div className="flex min-w-0 items-center gap-2.5 rounded-2xl bg-white/[0.08] px-3 py-2 ring-1 ring-white/10 backdrop-blur sm:px-3.5 sm:py-2.5">
      <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-white/10">
        <Icon className="size-4" />
      </span>
      <div className="min-w-0 leading-tight">
        <p className="text-lg font-bold">{value}</p>
        <p className="truncate text-[11px] text-white/60">{label}</p>
      </div>
    </div>
  );
}

/** Products, services or menu items: what the assistant can show as cards in the chat. */
export default async function ProductsPage() {
  const { workspace, db } = await requireWorkspace();
  const t = await getTranslations("products");
  const variant = catalogVariant(workspace.industry);
  const products = await listProducts(db);

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-6">
      <PageHero title={t(`variants.${variant}.title`)} subtitle={t(`variants.${variant}.subtitle`)}>
        <div className="grid grid-cols-3 gap-2 sm:gap-2.5 lg:w-[28rem] lg:shrink-0">
          <HeroStat icon={ShoppingBag} label={t("heroTotal")} value={products.length} />
          <HeroStat icon={CircleCheckBig} label={t("heroAvailable")} value={products.filter((p) => p.available).length} />
          <HeroStat icon={ImageIcon} label={t("heroWithPhoto")} value={products.filter((p) => p.imageUrl).length} />
        </div>
      </PageHero>

      <ProductManager
        products={products.map((p) => ({ id: p.id, name: p.name, description: p.description, category: p.category, priceMinor: p.priceMinor, currency: p.currency, imageUrl: p.imageUrl, url: p.url, available: p.available }))}
        variant={variant}
        canUpload={storageConfigured()}
        max={MAX_PRODUCTS}
      />
    </div>
  );
}

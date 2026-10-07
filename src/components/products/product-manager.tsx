"use client";

import { ImagePlus, Pencil, Plus, Search, ShoppingBag, Trash2, X } from "lucide-react";
import { useFormatter, useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { FormField } from "@/components/form-field";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import type { CatalogVariant } from "@/lib/catalog";
import { cn } from "@/lib/utils";

export type ProductItem = {
  id: string;
  name: string;
  description: string;
  category: string | null;
  priceMinor: number | null;
  currency: string;
  imageUrl: string | null;
  url: string | null;
  available: boolean;
};

type ApiResult = { ok?: boolean; error?: string; fieldErrors?: Record<string, string> };

async function send(url: string, init: RequestInit): Promise<ApiResult> {
  try {
    const res = await fetch(url, init);
    return (await res.json().catch(() => ({ error: "errors.generic" }))) as ApiResult;
  } catch {
    return { error: "errors.generic" };
  }
}

/** Square photo, or a tinted placeholder with the first letter when there is none. */
function Thumb({ product, className }: { product: Pick<ProductItem, "name" | "imageUrl">; className?: string }) {
  return product.imageUrl ? (
    // Product photos live in storage on another domain and are already web-sized.
    // eslint-disable-next-line @next/next/no-img-element
    <img src={product.imageUrl} alt="" loading="lazy" className={cn("size-full object-cover", className)} />
  ) : (
    <span aria-hidden className={cn("flex size-full items-center justify-center bg-gradient-to-br from-accent to-[#f1ebff] text-3xl font-bold text-primary/50", className)}>
      {product.name.trim().slice(0, 1).toUpperCase() || <ShoppingBag className="size-8" />}
    </span>
  );
}

/** Products page body: search, category filter, the grid, and the add/edit form. */
export function ProductManager({ products, variant, canUpload, max }: { products: ProductItem[]; variant: CatalogVariant; canUpload: boolean; max: number }) {
  const t = useTranslations("products");
  const tv = (key: string, values?: Record<string, string | number>) => t(`variants.${variant}.${key}`, values);
  const format = useFormatter();
  const router = useRouter();
  const [editing, setEditing] = useState<ProductItem | "new" | null>(null);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pendingId, setPendingId] = useState<string | null>(null);
  const te = useTranslations();

  const categories = useMemo(() => [...new Set(products.map((p) => p.category).filter((c): c is string => Boolean(c)))].sort(), [products]);
  const visible = products.filter((p) => (!category || p.category === category) && (!search.trim() || p.name.toLowerCase().includes(search.trim().toLowerCase())));
  const price = (p: ProductItem) => (p.priceMinor === null ? t("noPrice") : format.number(p.priceMinor / 100, { style: "currency", currency: p.currency, minimumFractionDigits: p.priceMinor % 100 ? 2 : 0 }));

  const act = async (id: string, url: string, init: RequestInit) => {
    setPendingId(id);
    const result = await send(url, init);
    setPendingId(null);
    setError(result.error ?? null);
    if (result.ok) router.refresh();
  };

  if (products.length === 0 && editing === null) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center gap-4 py-14 text-center">
          <span className="flex size-16 items-center justify-center rounded-2xl bg-accent text-primary">
            <ShoppingBag className="size-8" />
          </span>
          <div className="max-w-md">
            <h2 className="text-lg font-semibold">{tv("empty")}</h2>
            <p className="mt-1 text-sm text-muted-foreground">{tv("emptyHint")}</p>
          </div>
          <Button size="lg" onClick={() => setEditing("new")}>
            <Plus />
            {tv("add")}
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative min-w-0 flex-1">
          <Search className="pointer-events-none absolute start-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder={t("search")} aria-label={t("search")} className="h-11 bg-white ps-9" />
        </div>
        <Button size="lg" onClick={() => setEditing("new")} disabled={products.length >= max}>
          <Plus />
          {tv("add")}
        </Button>
      </div>

      {categories.length > 0 && (
        <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1">
          {[null, ...categories].map((c) => (
            <button
              key={c ?? "*"}
              type="button"
              aria-pressed={category === c}
              onClick={() => setCategory(c)}
              className={cn(
                "h-9 shrink-0 rounded-full border px-4 text-sm font-medium transition-colors",
                category === c ? "border-foreground bg-foreground text-background" : "border-border bg-white text-muted-foreground hover:text-foreground",
              )}
            >
              <span dir="auto">{c ?? t("allCategories")}</span>
            </button>
          ))}
        </div>
      )}

      {error && (
        <p role="alert" className="rounded-xl bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {te(error)}
        </p>
      )}

      <p className="text-sm text-muted-foreground">
        {tv("count", { count: visible.length })}
        {products.length >= max && ` · ${t("limitNote", { max })}`}
      </p>

      {visible.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-border bg-white p-10 text-center text-sm text-muted-foreground">{t("noResults")}</p>
      ) : (
        <ul className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-3 xl:grid-cols-4">
          {visible.map((p) => (
            <li
              key={p.id}
              className={cn(
                "card-surface flex flex-col overflow-hidden rounded-2xl border border-border/70 shadow-[0_1px_2px_rgb(16_24_40/0.04),0_4px_16px_-4px_rgb(16_24_40/0.06)]",
                pendingId === p.id && "opacity-60",
              )}
            >
              <button type="button" onClick={() => setEditing(p)} aria-label={t("editNamed", { name: p.name })} className="relative block aspect-[4/3] w-full overflow-hidden bg-muted">
                <Thumb product={p} className={cn(!p.available && "opacity-50 grayscale")} />
                {!p.available && <span className="absolute start-2 top-2 rounded-full bg-foreground/85 px-2.5 py-1 text-[11px] font-semibold text-white">{t("unavailable")}</span>}
              </button>
              <div className="flex flex-1 flex-col gap-1.5 p-3 sm:p-4">
                {p.category && (
                  <span dir="auto" className="w-fit max-w-full truncate rounded-full bg-accent px-2 py-0.5 text-[11px] font-medium text-accent-foreground">
                    {p.category}
                  </span>
                )}
                <h3 dir="auto" className="line-clamp-2 text-[15px] leading-snug font-semibold">
                  {p.name}
                </h3>
                <p className={cn("text-sm font-semibold", p.priceMinor === null ? "font-normal text-muted-foreground" : "text-primary")}>{price(p)}</p>
                {p.description && (
                  <p dir="auto" className="line-clamp-2 text-[13px] leading-relaxed text-muted-foreground max-sm:hidden">
                    {p.description}
                  </p>
                )}
                <div className="mt-auto flex items-center justify-between gap-2 pt-2">
                  <button
                    type="button"
                    role="switch"
                    aria-checked={p.available}
                    aria-label={p.available ? t("markUnavailable", { name: p.name }) : t("markAvailable", { name: p.name })}
                    title={p.available ? t("available") : t("unavailable")}
                    disabled={pendingId === p.id}
                    onClick={() => act(p.id, `/api/products/${p.id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ available: !p.available }) })}
                    className={cn("relative h-7 w-12 shrink-0 rounded-full transition-colors", p.available ? "bg-success" : "bg-input")}
                  >
                    <span className={cn("absolute top-1 size-5 rounded-full bg-white shadow transition-[inset-inline-start]", p.available ? "start-6" : "start-1")} />
                  </button>
                  <div className="flex items-center">
                    <Button variant="ghost" size="icon" onClick={() => setEditing(p)} aria-label={t("editNamed", { name: p.name })}>
                      <Pencil />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      disabled={pendingId === p.id}
                      aria-label={t("deleteNamed", { name: p.name })}
                      onClick={() => {
                        if (window.confirm(t("confirmDelete", { name: p.name }))) void act(p.id, `/api/products/${p.id}`, { method: "DELETE" });
                      }}
                    >
                      <Trash2 className="text-destructive" />
                    </Button>
                  </div>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}

      {editing && (
        <ProductForm
          // A fresh form for each product, so nothing typed for one leaks into the next.
          key={editing === "new" ? "new" : editing.id}
          product={editing === "new" ? null : editing}
          variant={variant}
          categories={categories}
          canUpload={canUpload}
          onClose={() => setEditing(null)}
          onSaved={() => {
            setEditing(null);
            setError(null);
            router.refresh();
          }}
        />
      )}
    </>
  );
}

/** Add or edit one product, in a sheet (phones) or a centred dialog (larger screens). */
function ProductForm({
  product,
  variant,
  categories,
  canUpload,
  onClose,
  onSaved,
}: {
  product: ProductItem | null;
  variant: CatalogVariant;
  categories: string[];
  canUpload: boolean;
  onClose: () => void;
  onSaved: () => void;
}) {
  const t = useTranslations("products");
  const te = useTranslations();
  const fileInput = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(product?.imageUrl ?? null);
  const [removeImage, setRemoveImage] = useState(false);
  const [available, setAvailable] = useState(product?.available ?? true);
  const [dragging, setDragging] = useState(false);
  const [saving, setSaving] = useState(false);
  const [result, setResult] = useState<ApiResult>({});
  const errors = result.fieldErrors ?? {};

  // Close with Escape; stop the page behind from scrolling while the form is open.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && !saving && onClose();
    window.addEventListener("keydown", onKey);
    const { overflow } = document.body.style;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = overflow;
    };
  }, [onClose, saving]);

  // Release the temporary preview address when it is replaced or the form closes.
  useEffect(() => {
    if (!preview?.startsWith("blob:")) return;
    return () => URL.revokeObjectURL(preview);
  }, [preview]);

  const choose = (chosen: File | undefined) => {
    if (!chosen) return;
    if (!chosen.type.startsWith("image/")) return setResult({ error: "products.errors.imageUnsupported" });
    if (chosen.size > 8 * 1024 * 1024) return setResult({ error: "products.errors.imageTooLarge" });
    setResult({});
    setFile(chosen);
    setRemoveImage(false);
    setPreview(URL.createObjectURL(chosen));
  };

  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const body = new FormData(event.currentTarget);
    body.set("available", String(available));
    body.delete("image");
    if (file) body.set("image", file);
    if (removeImage) body.set("removeImage", "true");

    setSaving(true);
    const response = await send(product ? `/api/products/${product.id}` : "/api/products", { method: product ? "PATCH" : "POST", body });
    setSaving(false);
    if (response.ok) onSaved();
    else setResult(response);
  };

  const title = t(`variants.${variant}.${product ? "edit" : "add"}`);

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center sm:p-6">
      <button type="button" aria-label={t("cancel")} className="absolute inset-0 bg-black/45" onClick={() => !saving && onClose()} />
      <form
        onSubmit={submit}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className="relative flex max-h-[92dvh] w-full flex-col overflow-hidden rounded-t-3xl bg-background shadow-2xl sm:max-w-2xl sm:rounded-3xl"
      >
        <div className="flex items-center justify-between gap-3 border-b border-border px-5 py-4">
          <h2 className="text-lg font-semibold">{title}</h2>
          <button type="button" onClick={onClose} disabled={saving} aria-label={t("cancel")} className="flex size-9 items-center justify-center rounded-full bg-muted">
            <X className="size-4" />
          </button>
        </div>

        <div className="grid gap-5 overflow-y-auto p-5 sm:grid-cols-[13rem_minmax(0,1fr)]">
          {/* Photo */}
          <div className="flex flex-col gap-2">
            <p className="text-sm font-medium">{t("photo")}</p>
            <div
              onDragOver={(e) => {
                if (!canUpload) return;
                e.preventDefault();
                setDragging(true);
              }}
              onDragLeave={() => setDragging(false)}
              onDrop={(e) => {
                e.preventDefault();
                setDragging(false);
                if (canUpload) choose(e.dataTransfer.files[0]);
              }}
              className={cn(
                "relative flex aspect-[4/3] flex-col items-center justify-center overflow-hidden rounded-2xl border-2 border-dashed text-center transition-colors sm:aspect-square",
                dragging ? "border-primary bg-accent" : "border-border bg-muted",
                preview && "border-solid border-border/70",
              )}
            >
              {preview ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={preview} alt="" className="size-full object-cover" />
              ) : (
                <button type="button" disabled={!canUpload} onClick={() => fileInput.current?.click()} className="flex size-full flex-col items-center justify-center gap-2 p-4 disabled:cursor-not-allowed disabled:opacity-60">
                  <span className="flex size-11 items-center justify-center rounded-full bg-white text-primary shadow-sm">
                    <ImagePlus className="size-5" />
                  </span>
                  <span className="text-sm font-semibold">{t("photoChoose")}</span>
                  <span className="text-xs text-muted-foreground max-sm:hidden">{t("photoDrop")}</span>
                </button>
              )}
            </div>
            <input ref={fileInput} type="file" name="image" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={(e) => choose(e.target.files?.[0])} />
            {preview && (
              <div className="flex gap-2">
                <Button type="button" variant="outline" size="sm" className="flex-1" disabled={!canUpload} onClick={() => fileInput.current?.click()}>
                  {t("photoReplace")}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  aria-label={t("photoRemove")}
                  title={t("photoRemove")}
                  onClick={() => {
                    setFile(null);
                    setPreview(null);
                    setRemoveImage(Boolean(product?.imageUrl));
                    if (fileInput.current) fileInput.current.value = "";
                  }}
                >
                  <Trash2 className="text-destructive" />
                </Button>
              </div>
            )}
            <p className={cn("text-xs leading-relaxed", canUpload ? "text-muted-foreground" : "rounded-lg bg-[#fff8e8] p-2.5 text-[#7a4700] ring-1 ring-[#f5c56b]")}>{canUpload ? t("photoHint") : t("storageMissing")}</p>
          </div>

          {/* Details */}
          <div className="flex min-w-0 flex-col gap-4">
            <FormField id="product-name" label={t("name")} error={errors.name}>
              <Input id="product-name" name="name" dir="auto" required maxLength={120} defaultValue={product?.name ?? ""} placeholder={t(`variants.${variant}.namePlaceholder`)} aria-invalid={!!errors.name} />
            </FormField>

            <div className="grid gap-4 sm:grid-cols-2">
              <FormField id="product-price" label={t("price")} error={errors.price}>
                <div className="relative">
                  <span className="pointer-events-none absolute start-3 top-1/2 -translate-y-1/2 text-sm font-medium text-muted-foreground">{product?.currency ?? "AED"}</span>
                  <Input
                    id="product-price"
                    name="price"
                    dir="ltr"
                    inputMode="decimal"
                    defaultValue={product?.priceMinor == null ? "" : String(product.priceMinor / 100)}
                    placeholder="0"
                    aria-invalid={!!errors.price}
                    aria-describedby="product-price-hint"
                    className="ps-14"
                  />
                </div>
                <p id="product-price-hint" className="-mt-1 text-xs text-muted-foreground">
                  {t("priceHint")}
                </p>
              </FormField>
              <FormField id="product-category" label={t("category")} hint={te("common.optional")} error={errors.category}>
                <Input id="product-category" name="category" dir="auto" list="product-categories" maxLength={60} defaultValue={product?.category ?? ""} placeholder={t("categoryPlaceholder")} />
                <datalist id="product-categories">
                  {categories.map((c) => (
                    <option key={c} value={c} />
                  ))}
                </datalist>
              </FormField>
            </div>

            <FormField id="product-description" label={t("description")} error={errors.description}>
              <Textarea id="product-description" name="description" dir="auto" rows={4} maxLength={2000} defaultValue={product?.description ?? ""} placeholder={t("descriptionPlaceholder")} className="min-h-28" />
              <p className="-mt-1 text-xs text-muted-foreground">{t("descriptionHint")}</p>
            </FormField>

            <FormField id="product-url" label={t("link")} hint={te("common.optional")} error={errors.url}>
              <Input id="product-url" name="url" dir="ltr" maxLength={500} defaultValue={product?.url ?? ""} placeholder={t("linkPlaceholder")} aria-invalid={!!errors.url} />
            </FormField>

            <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-border/70 bg-white p-3.5">
              <input type="checkbox" checked={available} onChange={(e) => setAvailable(e.target.checked)} className="mt-0.5 size-4 accent-primary" />
              <span className="flex flex-col gap-0.5">
                <span className="text-sm font-medium">{t("availableLabel")}</span>
                <span className="text-xs leading-relaxed text-muted-foreground">{t("availableHint")}</span>
              </span>
            </label>
          </div>
        </div>

        <div className="flex flex-col gap-3 border-t border-border bg-muted/60 px-5 py-4 sm:flex-row sm:items-center sm:justify-end">
          {result.error && (
            <p role="alert" className="text-sm text-destructive sm:me-auto">
              {te(result.error)}
            </p>
          )}
          <div className="flex gap-2">
            <Button type="button" variant="outline" size="lg" className="flex-1 sm:flex-none" onClick={onClose} disabled={saving}>
              {t("cancel")}
            </Button>
            <Button type="submit" size="lg" className="flex-1 sm:flex-none" disabled={saving}>
              {saving ? te("common.saving") : t("save")}
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}

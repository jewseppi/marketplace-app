"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { AuthGate } from "@/components/dashboard/AuthGate";
import { PRODUCT_CATEGORIES, type ProductCategory } from "@/data/products";
import type { SellerProduct } from "@/db";
import {
  addSellerProduct,
  archiveSellerProduct,
  saveSellerProduct,
  toggleSellerProductStock,
} from "../actions";

const sellerCategories = PRODUCT_CATEGORIES.filter((category) => category !== "all");

type ProductFormState = {
  title: string;
  description: string;
  price: string;
  category: ProductCategory;
  imageMain: string;
  stock: boolean;
};

const defaultProduct: ProductFormState = {
  title: "",
  description: "",
  price: "",
  category: "bags",
  imageMain: "/images/purse.png",
  stock: true,
};

export function SellerProductsClient({ initialProducts }: { initialProducts: SellerProduct[] }) {
  const router = useRouter();
  const [products, setProducts] = useState(initialProducts);
  const [draft, setDraft] = useState<ProductFormState>(defaultProduct);
  const [saving, startSaving] = useTransition();

  const activeProducts = useMemo(() => products.filter((product) => !product.deletedAt), [products]);

  function updateProductState(id: number, patch: Partial<SellerProduct>) {
    setProducts((current) => current.map((product) => (product.id === id ? { ...product, ...patch } : product)));
  }

  return (
    <AuthGate
      role="seller"
      title="Connect Seller Account"
      description="Manage inventory with the mock seller login. Products are backed by the SQLite catalog."
    >
      <section className="space-y-6">
        <div className="grid gap-6 xl:grid-cols-[360px_minmax(0,1fr)]">
          <div className="rounded-[2rem] border border-white/10 bg-slate-900/70 p-6">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-cyan-200">Add product</p>
            <div className="mt-4 space-y-4">
              <input
                value={draft.title}
                onChange={(event) => setDraft((current) => ({ ...current, title: event.target.value }))}
                placeholder="Product title"
                className="w-full rounded-2xl border border-white/10 bg-slate-950 px-4 py-3 text-sm text-white outline-none focus:border-cyan-300/60"
              />
              <textarea
                value={draft.description}
                onChange={(event) => setDraft((current) => ({ ...current, description: event.target.value }))}
                placeholder="Description"
                rows={4}
                className="w-full rounded-2xl border border-white/10 bg-slate-950 px-4 py-3 text-sm text-white outline-none focus:border-cyan-300/60"
              />
              <div className="grid gap-4 sm:grid-cols-2">
                <input
                  value={draft.price}
                  onChange={(event) => setDraft((current) => ({ ...current, price: event.target.value }))}
                  placeholder="Price"
                  type="number"
                  min="0"
                  step="0.01"
                  className="w-full rounded-2xl border border-white/10 bg-slate-950 px-4 py-3 text-sm text-white outline-none focus:border-cyan-300/60"
                />
                <select
                  value={draft.category}
                  onChange={(event) => setDraft((current) => ({ ...current, category: event.target.value as ProductCategory }))}
                  className="w-full rounded-2xl border border-white/10 bg-slate-950 px-4 py-3 text-sm text-white outline-none focus:border-cyan-300/60"
                >
                  {sellerCategories.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </div>
              <input
                value={draft.imageMain}
                onChange={(event) => setDraft((current) => ({ ...current, imageMain: event.target.value }))}
                placeholder="Image URL"
                className="w-full rounded-2xl border border-white/10 bg-slate-950 px-4 py-3 text-sm text-white outline-none focus:border-cyan-300/60"
              />
              <label className="flex items-center gap-3 text-sm text-slate-300">
                <input
                  type="checkbox"
                  checked={draft.stock}
                  onChange={(event) => setDraft((current) => ({ ...current, stock: event.target.checked }))}
                  className="h-4 w-4 rounded border-white/20 bg-slate-950"
                />
                Mark as in stock
              </label>
              <button
                onClick={() => {
                  if (!draft.title || !draft.description || !draft.price || !draft.imageMain) {
                    return;
                  }
                  startSaving(async () => {
                    await addSellerProduct({
                      title: draft.title,
                      description: draft.description,
                      price: Number(draft.price),
                      category: draft.category,
                      imageMain: draft.imageMain,
                      stock: draft.stock,
                    });
                    router.refresh();
                    setProducts((current) => [
                      {
                        id: Math.max(0, ...current.map((product) => product.id)) + 1,
                        title: draft.title,
                        description: draft.description,
                        price: Number(draft.price),
                        category: draft.category,
                        images: { main: draft.imageMain, additional: [] },
                        inStock: draft.stock,
                        sku: "Pending refresh",
                        deletedAt: null,
                      },
                      ...current,
                    ]);
                    setDraft(defaultProduct);
                  });
                }}
                disabled={saving}
                className="w-full rounded-2xl bg-cyan-300 px-4 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-200 disabled:opacity-60"
              >
                {saving ? "Saving..." : "Simulate Upload"}
              </button>
            </div>
          </div>

          <div className="space-y-4">
            {products.map((product) => (
              <article key={product.id} className="rounded-[2rem] border border-white/10 bg-slate-900/70 p-6">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs uppercase tracking-[0.2em] text-slate-300">
                        {product.category}
                      </span>
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] ${
                          product.deletedAt
                            ? "bg-rose-400/15 text-rose-200"
                            : product.inStock
                              ? "bg-emerald-400/15 text-emerald-200"
                              : "bg-amber-400/15 text-amber-200"
                        }`}
                      >
                        {product.deletedAt ? "Archived" : product.inStock ? "Live" : "Out of stock"}
                      </span>
                    </div>
                    <p className="mt-3 text-xs uppercase tracking-[0.25em] text-slate-500">{product.sku}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-slate-400">Catalog price</p>
                    <p className="mt-1 text-2xl font-semibold text-white">${product.price.toLocaleString()}</p>
                  </div>
                </div>

                <div className="mt-6 grid gap-4 md:grid-cols-2">
                  <input
                    value={product.title}
                    onChange={(event) => updateProductState(product.id, { title: event.target.value })}
                    className="w-full rounded-2xl border border-white/10 bg-slate-950 px-4 py-3 text-sm text-white outline-none focus:border-cyan-300/60"
                  />
                  <input
                    value={String(product.price)}
                    type="number"
                    min="0"
                    step="0.01"
                    onChange={(event) => updateProductState(product.id, { price: Number(event.target.value) })}
                    className="w-full rounded-2xl border border-white/10 bg-slate-950 px-4 py-3 text-sm text-white outline-none focus:border-cyan-300/60"
                  />
                  <textarea
                    value={product.description}
                    onChange={(event) => updateProductState(product.id, { description: event.target.value })}
                    rows={3}
                    className="md:col-span-2 w-full rounded-2xl border border-white/10 bg-slate-950 px-4 py-3 text-sm text-white outline-none focus:border-cyan-300/60"
                  />
                  <select
                    value={product.category}
                    onChange={(event) => updateProductState(product.id, { category: event.target.value as ProductCategory })}
                    className="w-full rounded-2xl border border-white/10 bg-slate-950 px-4 py-3 text-sm text-white outline-none focus:border-cyan-300/60"
                  >
                    {sellerCategories.map((category) => (
                      <option key={category} value={category}>
                        {category}
                      </option>
                    ))}
                  </select>
                  <input
                    value={product.images.main}
                    onChange={(event) => updateProductState(product.id, { images: { ...product.images, main: event.target.value } })}
                    className="w-full rounded-2xl border border-white/10 bg-slate-950 px-4 py-3 text-sm text-white outline-none focus:border-cyan-300/60"
                  />
                </div>

                <div className="mt-6 flex flex-wrap gap-3">
                  <button
                    onClick={() =>
                      startSaving(async () => {
                        await saveSellerProduct({
                          id: product.id,
                          title: product.title,
                          description: product.description,
                          price: product.price,
                          category: product.category,
                          imageMain: product.images.main,
                          stock: product.inStock,
                        });
                        router.refresh();
                      })
                    }
                    disabled={saving || !!product.deletedAt}
                    className="rounded-full bg-white px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-slate-200 disabled:opacity-50"
                  >
                    Save changes
                  </button>
                  <button
                    onClick={() =>
                      startSaving(async () => {
                        await toggleSellerProductStock(product.id, !product.inStock);
                        updateProductState(product.id, { inStock: !product.inStock });
                        router.refresh();
                      })
                    }
                    disabled={saving || !!product.deletedAt}
                    className="rounded-full border border-white/15 px-4 py-2 text-sm font-medium text-slate-200 transition hover:bg-white/5 disabled:opacity-50"
                  >
                    {product.inStock ? "Mark out of stock" : "Restock item"}
                  </button>
                  <button
                    onClick={() =>
                      startSaving(async () => {
                        await archiveSellerProduct(product.id);
                        updateProductState(product.id, { deletedAt: new Date().toISOString(), inStock: false });
                        router.refresh();
                      })
                    }
                    disabled={saving || !!product.deletedAt}
                    className="rounded-full border border-rose-400/30 px-4 py-2 text-sm font-medium text-rose-200 transition hover:bg-rose-400/10 disabled:opacity-50"
                  >
                    Soft delete
                  </button>
                </div>
              </article>
            ))}

            <div className="rounded-[2rem] border border-dashed border-white/10 bg-slate-900/40 p-5 text-sm text-slate-400">
              {activeProducts.length} active products • {products.length - activeProducts.length} archived
            </div>
          </div>
        </div>
      </section>
    </AuthGate>
  );
}

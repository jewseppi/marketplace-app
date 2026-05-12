"use client";

import { useMemo, useState, useEffect, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  PRODUCT_CATEGORIES,
  type Product,
} from "@/data/products";
import { Button } from "./ui/button";

type CategoryFilter = (typeof PRODUCT_CATEGORIES)[number];

const CATEGORY_LABELS: Record<CategoryFilter, string> = {
  all: "All",
  bags: "Bags",
  shoes: "Shoes",
  clothing: "Clothing",
  jewelry: "Jewelry",
};

export default function ProductExplorer() {
  const [activeCategory, setActiveCategory] = useState<CategoryFilter>("all");
  const [query, setQuery] = useState("");
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (activeCategory !== "all") params.set("category", activeCategory);
    if (query.trim()) params.set("search", query.trim());
    const res = await fetch(`/api/products?${params.toString()}`);
    const data = await res.json();
    setProducts(Array.isArray(data) ? data : []);
    setLoading(false);
  }, [activeCategory, query]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const filtered = useMemo(() => {
    if (query.trim()) {
      const trimmed = query.trim().toLowerCase();
      return products.filter(
        (product) =>
          product.title.toLowerCase().includes(trimmed) ||
          product.description.toLowerCase().includes(trimmed) ||
          product.category.toLowerCase().includes(trimmed),
      );
    }
    return products;
  }, [products, query]);

  return (
    <section className="w-full py-24 bg-gray-50">
      <div className="max-w-7xl mx-auto px-6">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-light mb-4 text-gray-900">
            Our <span className="font-semibold">Collection</span>
          </h2>
          <div className="w-24 h-px bg-gray-900 mx-auto mb-8"></div>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            Discover handpicked luxury items from the world&rsquo;s most
            prestigious designers
          </p>
        </div>

        {/* Search Bar */}
        <div className="flex justify-center mb-12">
          <div className="relative w-full max-w-md">
            <input
              type="text"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search luxury items..."
              aria-label="Search luxury items"
              className="w-full px-6 py-4 bg-white border border-gray-200 rounded-none focus:outline-none focus:border-gray-400 transition-colors text-gray-900 placeholder-gray-500"
            />
            <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
              <svg
                className="w-5 h-5 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>
          </div>
        </div>

        {/* Category Navigation */}
        <nav className="flex justify-center mb-16">
          <div className="flex space-x-12 border-b border-gray-200">
            {PRODUCT_CATEGORIES.map((category) => {
              const isActive = activeCategory === category;
              return (
                <button
                  key={category}
                  type="button"
                  onClick={() => setActiveCategory(category)}
                  aria-pressed={isActive}
                  className={`pb-4 text-lg font-medium transition-colors relative ${
                    isActive
                      ? "text-gray-900 border-b-2 border-gray-900"
                      : "text-gray-500 hover:text-gray-900"
                  }`}
                >
                  {CATEGORY_LABELS[category]}
                </button>
              );
            })}
          </div>
        </nav>

        {/* Results meta */}
        <p className="text-sm text-gray-500 text-center mb-8">
          {loading
            ? "Loading..."
            : `${filtered.length} ${filtered.length === 1 ? "item" : "items"}${
                activeCategory !== "all"
                  ? ` in ${CATEGORY_LABELS[activeCategory]}`
                  : ""
              }${query.trim() ? ` matching "${query.trim()}"` : ""}`}
        </p>

        {/* Product Grid */}
        {loading ? (
          <div className="text-center py-16">
            <div className="inline-block w-8 h-8 border-4 border-gray-200 border-t-gray-900 rounded-full animate-spin" />
          </div>
        ) : filtered.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {filtered.map((product) => (
              <div
                key={product.id}
                className="group cursor-pointer bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-xl transition-all duration-500"
              >
                <Link href={`/product/${product.id}`}>
                  <div className="relative overflow-hidden">
                    <Image
                      src={product.images.main}
                      alt={product.title}
                      width={400}
                      height={400}
                      className="w-full h-80 object-cover group-hover:scale-105 transition-transform duration-700"
                    />

                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-300 flex items-center justify-center">
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <Button className="bg-white text-black hover:bg-gray-100 rounded-none px-6 py-2 text-sm font-medium">
                          VIEW DETAILS
                        </Button>
                      </div>
                    </div>

                    <span className="absolute top-4 left-4 px-3 py-1 bg-white/90 text-xs font-medium uppercase tracking-wide text-gray-700">
                      {product.category}
                    </span>
                  </div>

                  <div className="p-6">
                    <h3 className="text-lg font-medium text-gray-900 mb-2 group-hover:text-gray-700 transition-colors">
                      {product.title}
                    </h3>
                    <p className="text-gray-500 text-sm mb-4 line-clamp-2">
                      {product.description}
                    </p>
                    <div className="flex items-center justify-between">
                      <p className="text-xl font-semibold text-gray-900">
                        ${product.price.toLocaleString()}
                      </p>
                      <div className="flex items-center text-xs text-gray-400">
                        <svg
                          className="w-4 h-4 mr-1"
                          fill="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2zm4.5 7.5L12 14l-4.5-4.5L9 8l3 3 6-6 1.5 1.5z" />
                        </svg>
                        Crypto Accepted
                      </div>
                    </div>
                  </div>
                </Link>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16 border border-dashed border-gray-200 rounded-lg bg-white">
            <p className="text-gray-700 font-medium mb-2">No items found</p>
            <p className="text-gray-500 text-sm mb-6">
              Try a different search or category.
            </p>
            <button
              type="button"
              onClick={() => {
                setQuery("");
                setActiveCategory("all");
              }}
              className="px-6 py-2 bg-gray-900 text-white text-sm font-medium hover:bg-gray-800 transition-colors"
            >
              Reset filters
            </button>
          </div>
        )}
      </div>
    </section>
  );
}

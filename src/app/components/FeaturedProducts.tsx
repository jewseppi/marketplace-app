"use client";

import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import type { Product } from "@/data/products";
import { ErrorToast } from "@/components/ui/ErrorToast";
import { ProductCardSkeleton } from "@/components/ui/ProductCardSkeleton";
import { ProductImage } from "@/components/ui/ProductImage";

export default function FeaturedProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/products");
      const data = await res.json();
      setProducts(Array.isArray(data) ? data.slice(0, 4) : []);
    } catch {
      setError("Featured products are temporarily unavailable.");
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  if (loading)
    return (
      <section className="py-20 px-6 md:px-16 lg:px-24 bg-black">
        <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <ProductCardSkeleton key={index} dark />
          ))}
        </div>
      </section>
    );
  if (error)
    return (
      <section className="bg-black px-6 py-20 md:px-16 lg:px-24">
        <ErrorToast title="Featured collection offline" message={error} className="border-rose-900/50 bg-rose-950/70 text-rose-100" />
      </section>
    );
  if (products.length === 0) return null;

  return (
    <section className="py-20 px-6 md:px-16 lg:px-24 bg-black">
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-10">
        {products.map((product) => (
          <motion.div
            key={product.id}
            whileHover={{ scale: 1.05 }}
            className="overflow-hidden rounded-lg hover:shadow-md transition-shadow"
          >
            <Link href={`/product/${product.id}`}>
              <div className="border border-gray-800 rounded-lg">
                <ProductImage
                  src={product.images.main}
                  alt={product.title}
                  width={300}
                  height={300}
                  className="object-cover w-full h-full rounded-t-lg"
                />
              </div>
            </Link>
          </motion.div>
        ))}
      </div>
    </section>
  );
}

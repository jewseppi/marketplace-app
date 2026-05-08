"use client";

import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";

export default function FeaturedProducts() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchProducts = useCallback(async () => {
    const res = await fetch("/api/products");
    const data = await res.json();
    setProducts(Array.isArray(data) ? data.slice(0, 4) : []);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  if (loading) return <div className="text-center py-20">Loading...</div>;
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
                <Image
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

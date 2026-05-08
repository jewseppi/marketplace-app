import { NextResponse } from "next/server";
import { products, PRODUCT_CATEGORIES } from "@/data/products";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const category = searchParams.get("category");
  const search = searchParams.get("search");
  const minPrice = searchParams.get("minPrice");
  const maxPrice = searchParams.get("maxPrice");
  const inStock = searchParams.get("inStock");

  let filtered = [...products];

  // Filter by category
  if (category && category !== "all") {
    filtered = filtered.filter(p => p.category === category);
  }

  // Filter by search (title or description)
  if (search) {
    const q = search.toLowerCase();
    filtered = filtered.filter(p =>
      p.title.toLowerCase().includes(q) ||
      p.description.toLowerCase().includes(q)
    );
  }

  // Filter by price range
  if (minPrice) {
    const min = parseFloat(minPrice);
    if (!isNaN(min)) filtered = filtered.filter(p => p.price >= min);
  }
  if (maxPrice) {
    const max = parseFloat(maxPrice);
    if (!isNaN(max)) filtered = filtered.filter(p => p.price <= max);
  }

  // Filter by stock
  if (inStock === "true") {
    filtered = filtered.filter(p => p.inStock);
  }

  return NextResponse.json({
    products: filtered,
    categories: PRODUCT_CATEGORIES,
    total: filtered.length,
  });
}

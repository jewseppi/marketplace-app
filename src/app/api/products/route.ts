import { NextRequest, NextResponse } from "next/server";
import productsData from "@/data/products.json";
import type { Product } from "@/data/products";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const category = searchParams.get("category");
  const search = searchParams.get("search");
  const id = searchParams.get("id");

  let filtered: Product[] = productsData;

  if (id) {
    const product = filtered.find((p) => p.id === parseInt(id));
    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }
    return NextResponse.json(product);
  }

  if (category && category !== "all") {
    filtered = filtered.filter((p) => p.category === category);
  }

  if (search) {
    const q = search.toLowerCase();
    filtered = filtered.filter(
      (p) =>
        p.title.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q),
    );
  }

  return NextResponse.json(filtered);
}

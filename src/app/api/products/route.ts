import { NextRequest, NextResponse } from "next/server";
import { getProduct, listProducts, searchProducts } from "@/db";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  const category = searchParams.get("category");
  const search = searchParams.get("search")?.trim().toLowerCase();

  if (id) {
    const numericId = Number(id);
    const product = getProduct(numericId);
    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }
    return NextResponse.json(product);
  }

  const filtered = category || search
    ? searchProducts({ category, query: search })
    : listProducts();

  return NextResponse.json(filtered);
}

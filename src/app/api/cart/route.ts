import { NextResponse } from "next/server";
import { createCart, addToCart, removeFromCart, updateCartQuantity, clearCart, getCart } from "@/data/products";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const cartId = searchParams.get("cartId");

  if (!cartId) {
    return NextResponse.json({ error: "cartId required" }, { status: 400 });
  }

  const cart = getCart(cartId);
  if (!cart) {
    return NextResponse.json({ error: "Cart not found" }, { status: 404 });
  }

  return NextResponse.json(cart);
}

export async function POST(request: Request) {
  const { searchParams } = new URL(request.url);
  const action = searchParams.get("action");
  const body = await request.json();

  // Create new cart
  if (action === "create") {
    const cart = createCart();
    return NextResponse.json(cart, { status: 201 });
  }

  const cartId = searchParams.get("cartId");
  if (!cartId) {
    return NextResponse.json({ error: "cartId required" }, { status: 400 });
  }

  switch (action) {
    case "add": {
      const { productId, quantity } = body;
      if (!productId) return NextResponse.json({ error: "productId required" }, { status: 400 });
      const result = addToCart(cartId, productId, quantity);
      if ("error" in result) {
        return NextResponse.json(result, { status: 400 });
      }
      return NextResponse.json(result);
    }
    case "remove": {
      const { productId } = body;
      if (!productId) return NextResponse.json({ error: "productId required" }, { status: 400 });
      const result = removeFromCart(cartId, productId);
      if ("error" in result) {
        return NextResponse.json(result, { status: 400 });
      }
      return NextResponse.json(result);
    }
    case "update": {
      const { productId, quantity } = body;
      if (!productId) return NextResponse.json({ error: "productId required" }, { status: 400 });
      if (quantity === undefined) return NextResponse.json({ error: "quantity required" }, { status: 400 });
      const result = updateCartQuantity(cartId, productId, quantity);
      if ("error" in result) {
        return NextResponse.json(result, { status: 400 });
      }
      return NextResponse.json(result);
    }
    case "clear": {
      const result = clearCart(cartId);
      if ("error" in result) {
        return NextResponse.json(result, { status: 400 });
      }
      return NextResponse.json(result);
    }
    default:
      return NextResponse.json({ error: `Unknown action: ${action}` }, { status: 400 });
  }
}

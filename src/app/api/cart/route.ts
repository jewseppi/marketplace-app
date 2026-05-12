import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { addToCart, clearCart, createCart, getCart, getProduct, removeFromCart, updateCartQuantity } from "@/db";
import {
  type Product,
} from "@/data/products";

const CART_COOKIE = "cc_cart_id";

function summarizeCart(cartId: string) {
  const cart = getCart(cartId);
  const items = cart?.items ?? [];
  const lines = items
    .map((item) => {
      const product = getProduct(item.productId);
      if (!product) {
        return null;
      }
      return { id: item.productId, quantity: item.quantity, product };
    })
    .filter((item): item is { id: number; quantity: number; product: Product } => item !== null);
  const compactCart = lines.map((item) => ({ id: item.id, quantity: item.quantity }));
  const itemCount = lines.reduce((sum, line) => sum + line.quantity, 0);
  const subtotal = lines.reduce((sum, line) => sum + line.product.price * line.quantity, 0);
  return { cartId, cart: compactCart, lines, itemCount, subtotal };
}

async function getOrCreateCartId() {
  const store = await cookies();
  const existing = store.get(CART_COOKIE)?.value;
  if (existing && getCart(existing)) {
    return { cartId: existing, created: false };
  }
  const cart = createCart();
  return { cartId: cart.id, created: true };
}

function jsonWithCart(data: ReturnType<typeof summarizeCart>, created: boolean) {
  const response = NextResponse.json(data);
  if (created) {
    response.cookies.set(CART_COOKIE, data.cartId, {
      httpOnly: true,
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 30,
    });
  }
  return response;
}

export async function GET() {
  const { cartId, created } = await getOrCreateCartId();
  return jsonWithCart(summarizeCart(cartId), created);
}

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => ({}));
  const action = typeof body?.action === "string" ? body.action : "";
  const id = Number(body?.id);
  const quantity = Number(body?.quantity ?? 1);
  const { cartId, created } = await getOrCreateCartId();

  switch (action) {
    case "add": {
      const result = addToCart(cartId, id, Number.isFinite(quantity) ? quantity : 1);
      if ("error" in result) {
        return NextResponse.json(result, { status: 400 });
      }
      break;
    }
    case "set-quantity": {
      const result = updateCartQuantity(cartId, id, quantity);
      if ("error" in result) {
        return NextResponse.json(result, { status: 400 });
      }
      break;
    }
    case "remove": {
      const result = removeFromCart(cartId, id);
      if ("error" in result) {
        return NextResponse.json(result, { status: 400 });
      }
      break;
    }
    case "clear": {
      const result = clearCart(cartId);
      if ("error" in result) {
        return NextResponse.json(result, { status: 400 });
      }
      break;
    }
    default:
      return NextResponse.json({ error: `Unknown action: ${action || "(empty)"}` }, { status: 400 });
  }

  return jsonWithCart(summarizeCart(cartId), created);
}

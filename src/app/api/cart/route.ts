import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import crypto from "crypto";

const CART_COOKIE = "crypto_couture_cart";

function parseCart(cookieVal: string): Array<{ id: number; quantity: number }> {
  try {
    const parsed = JSON.parse(cookieVal);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (e: any) =>
        typeof e === "object" &&
        typeof e.id === "number" &&
        typeof e.quantity === "number" &&
        e.quantity > 0,
    );
  } catch {
    return [];
  }
}

export async function GET() {
  const cookieStore = await cookies();
  const raw = cookieStore.get(CART_COOKIE)?.value;
  const cart = parseCart(raw || "[]");
  return NextResponse.json({ cart });
}

export async function POST(request: NextRequest) {
  const cookieStore = await cookies();
  const raw = cookieStore.get(CART_COOKIE)?.value || "[]";
  let cart = parseCart(raw);

  const body = await request.json();
  const { action, id, quantity } = body as {
    action: "add" | "remove" | "clear" | "set-quantity";
    id?: number;
    quantity?: number;
  };

  switch (action) {
    case "add": {
      const existing = cart.find((e) => e.id === id);
      if (existing) {
        existing.quantity += quantity || 1;
      } else {
        cart.push({ id: id!, quantity: quantity || 1 });
      }
      break;
    }
    case "set-quantity": {
      if (quantity && quantity <= 0) {
        cart = cart.filter((e) => e.id !== id);
      } else {
        cart = cart.map((e) => (e.id === id ? { ...e, quantity: quantity! } : e));
      }
      break;
    }
    case "remove": {
      cart = cart.filter((e) => e.id !== id);
      break;
    }
    case "clear": {
      cart = [];
      break;
    }
    default:
      return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  }

  const serialized = JSON.stringify(cart);
  cookieStore.set(CART_COOKIE, serialized, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 30, // 30 days
    path: "/",
  });

  return NextResponse.json({ cart });
}

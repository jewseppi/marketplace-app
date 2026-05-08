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

export async function POST(request: NextRequest) {
  const cookieStore = await cookies();
  const raw = cookieStore.get(CART_COOKIE)?.value || "[]";
  const cart = parseCart(raw);

  if (cart.length === 0) {
    return NextResponse.json({ error: "Cart is empty" }, { status: 400 });
  }

  const body = await request.json();
  const { cryptoCurrency, walletAddress } = body as {
    cryptoCurrency: string;
    walletAddress: string;
  };

  const orderId = crypto.randomUUID();

  // TODO: Phase 2 — wire ethers.js to smart contract
  // For now, return a pending order with payment instructions
  const order = {
    id: orderId,
    items: cart,
    status: "pending_payment",
    payment: {
      currency: cryptoCurrency,
      walletAddress,
      expiresAt: new Date(Date.now() + 15 * 60 * 1000).toISOString(), // 15 min window
    },
    createdAt: new Date().toISOString(),
  };

  // Clear the cart after order creation
  cookieStore.set(CART_COOKIE, "[]", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 0,
    path: "/",
  });

  return NextResponse.json({ order });
}

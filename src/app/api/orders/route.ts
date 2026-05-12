import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createOrder, getCart, getOrder, listOrders } from "@/db";

const CART_COOKIE = "cc_cart_id";
const VALID_METHODS = ["BTC", "ETH", "USDT", "USDC"] as const;

type PaymentMethod = (typeof VALID_METHODS)[number];

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const orderId = searchParams.get("orderId");
  if (orderId) {
    const order = getOrder(orderId);
    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }
    return NextResponse.json({ order });
  }
  return NextResponse.json({ orders: listOrders() });
}

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => ({}));
  const cryptoCurrency = body?.cryptoCurrency as PaymentMethod | undefined;
  const walletAddress = typeof body?.walletAddress === "string" ? body.walletAddress.trim() : "";
  if (!cryptoCurrency || !VALID_METHODS.includes(cryptoCurrency)) {
    return NextResponse.json({ error: `cryptoCurrency must be one of: ${VALID_METHODS.join(", ")}` }, { status: 400 });
  }
  if (!walletAddress) {
    return NextResponse.json({ error: "walletAddress required" }, { status: 400 });
  }

  const store = await cookies();
  const cartId = store.get(CART_COOKIE)?.value;
  if (!cartId) {
    return NextResponse.json({ error: "Cart not found" }, { status: 400 });
  }
  const cart = getCart(cartId);
  if (!cart || cart.items.length === 0) {
    return NextResponse.json({ error: "Cart is empty" }, { status: 400 });
  }

  const expiresAt = new Date(Date.now() + 30 * 60 * 1000).toISOString();

  const result = createOrder(
    cartId,
    `crypto-checkout+${Date.now()}@local.invalid`,
    cryptoCurrency,
    {
      walletAddress,
      paymentExpiresAt: expiresAt,
    },
  );
  if ("error" in result) {
    return NextResponse.json(result, { status: 400 });
  }

  return NextResponse.json(
    {
      order: {
        id: result.id,
        status: result.status,
        total: result.total,
        createdAt: result.createdAt,
        payment: {
          currency: cryptoCurrency,
          walletAddress,
          expiresAt,
        },
      },
    },
    { status: 201 },
  );
}

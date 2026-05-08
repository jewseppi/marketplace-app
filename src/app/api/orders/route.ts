import { NextResponse } from "next/server";
import { createOrder, getOrders, getOrder } from "@/data/products";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const orderId = searchParams.get("orderId");

  if (orderId) {
    const order = getOrder(orderId);
    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }
    return NextResponse.json(order);
  }

  return NextResponse.json({ orders: getOrders() });
}

export async function POST(request: Request) {
  const body = await request.json();
  const { cartId, customerEmail, paymentMethod } = body;

  if (!cartId) return NextResponse.json({ error: "cartId required" }, { status: 400 });
  if (!customerEmail) return NextResponse.json({ error: "customerEmail required" }, { status: 400 });
  if (!paymentMethod) return NextResponse.json({ error: "paymentMethod required" }, { status: 400 });

  const validMethods = ["BTC", "ETH", "USDT", "USDC"];
  if (!validMethods.includes(paymentMethod)) {
    return NextResponse.json({ error: `Invalid payment method. Must be one of: ${validMethods.join(", ")}` }, { status: 400 });
  }

  const result = createOrder(cartId, customerEmail, paymentMethod);
  if ("error" in result) {
    return NextResponse.json(result, { status: 400 });
  }

  return NextResponse.json(result, { status: 201 });
}

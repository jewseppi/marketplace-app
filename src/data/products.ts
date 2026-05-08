export const PRODUCT_CATEGORIES = [
  "all",
  "bags",
  "shoes",
  "clothing",
  "jewelry",
] as const;

export type ProductCategory = Exclude<
  (typeof PRODUCT_CATEGORIES)[number],
  "all"
>;

export type Product = {
  id: number;
  title: string;
  description: string;
  price: number;
  category: ProductCategory;
  images: {
    main: string;
    additional: string[];
  };
  inStock: boolean;
  sku: string;
};

export type CartItem = {
  productId: number;
  quantity: number;
};

export type Cart = {
  id: string;
  items: CartItem[];
  subtotal: number;
  createdAt: string;
  updatedAt: string;
};

export type Order = {
  id: string;
  cartId: string;
  customerEmail: string;
  paymentMethod: "BTC" | "ETH" | "USDT" | "USDC";
  status: "pending" | "confirmed" | "shipped" | "delivered" | "cancelled";
  total: number;
  createdAt: string;
};

export const products: Product[] = [
  {
    id: 1,
    title: "Luxury Handbag",
    description: "A beautiful designer handbag for every occasion.",
    price: 250.0,
    category: "bags",
    images: {
      main: "/images/purse.png",
      additional: ["/images/purse-01.png"],
    },
    inStock: true,
    sku: "CC-BAG-001",
  },
  {
    id: 2,
    title: "Stylish Heels",
    description: "Comfortable and elegant heels for any event.",
    price: 150.0,
    category: "shoes",
    images: {
      main: "/images/heels.png",
      additional: ["/images/heels-01.png"],
    },
    inStock: true,
    sku: "CC-SHOE-001",
  },
  {
    id: 3,
    title: "Gold Watch",
    description: "Timeless 18k gold, with 14k gold band.",
    price: 450.0,
    category: "jewelry",
    images: {
      main: "/images/watch.png",
      additional: ["/images/heels-01.png"],
    },
    inStock: true,
    sku: "CC-JWL-001",
  },
  {
    id: 4,
    title: "Fancy Blouse",
    description: "Delicate blouse for a night on the town.",
    price: 285.0,
    category: "clothing",
    images: {
      main: "/images/blouse.png",
      additional: ["/images/heels-01.png"],
    },
    inStock: true,
    sku: "CC-CLTH-001",
  },
  {
    id: 5,
    title: "Evening Clutch",
    description: "Compact silk-lined clutch for formal evenings.",
    price: 320.0,
    category: "bags",
    images: {
      main: "/images/purse-01.png",
      additional: ["/images/purse.png"],
    },
    inStock: true,
    sku: "CC-BAG-002",
  },
  {
    id: 6,
    title: "Statement Heels",
    description: "Crystal-embellished heels for the boldest entrances.",
    price: 410.0,
    category: "shoes",
    images: {
      main: "/images/heels-01.png",
      additional: ["/images/heels.png"],
    },
    inStock: true,
    sku: "CC-SHOE-002",
  },
];

// In-memory cart store (replace with Redis/DB later)
const carts = new Map<string, Cart>();
const orders = new Map<string, Order>();

export function getCart(cartId: string): Cart | undefined {
  return carts.get(cartId);
}

export function createCart(): Cart {
  const id = `cart_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
  const now = new Date().toISOString();
  const cart: Cart = {
    id,
    items: [],
    subtotal: 0,
    createdAt: now,
    updatedAt: now,
  };
  carts.set(id, cart);
  return cart;
}

export function addToCart(cartId: string, productId: number, quantity: number = 1): Cart | { error: string } {
  const cart = carts.get(cartId);
  if (!cart) return { error: "Cart not found" };
  
  const product = products.find(p => p.id === productId);
  if (!product) return { error: "Product not found" };
  if (!product.inStock) return { error: "Product out of stock" };
  if (quantity <= 0) return { error: "Invalid quantity" };

  const existing = cart.items.find(item => item.productId === productId);
  if (existing) {
    existing.quantity += quantity;
  } else {
    cart.items.push({ productId, quantity });
  }

  cart.subtotal = cart.items.reduce((sum, item) => {
    const p = products.find(p => p.id === item.productId)!;
    return sum + p.price * item.quantity;
  }, 0);
  cart.updatedAt = new Date().toISOString();
  carts.set(cartId, cart);
  return cart;
}

export function removeFromCart(cartId: string, productId: number): Cart | { error: string } {
  const cart = carts.get(cartId);
  if (!cart) return { error: "Cart not found" };

  cart.items = cart.items.filter(item => item.productId !== productId);
  cart.subtotal = cart.items.reduce((sum, item) => {
    const p = products.find(p => p.id === item.productId)!;
    return sum + p.price * item.quantity;
  }, 0);
  cart.updatedAt = new Date().toISOString();
  carts.set(cartId, cart);
  return cart;
}

export function updateCartQuantity(cartId: string, productId: number, quantity: number): Cart | { error: string } {
  const cart = carts.get(cartId);
  if (!cart) return { error: "Cart not found" };

  const item = cart.items.find(item => item.productId === productId);
  if (!item) return { error: "Item not in cart" };
  if (quantity <= 0) {
    return removeFromCart(cartId, productId);
  }

  item.quantity = quantity;
  cart.subtotal = cart.items.reduce((sum, item) => {
    const p = products.find(p => p.id === item.productId)!;
    return sum + p.price * item.quantity;
  }, 0);
  cart.updatedAt = new Date().toISOString();
  carts.set(cartId, cart);
  return cart;
}

export function clearCart(cartId: string): Cart | { error: string } {
  const cart = carts.get(cartId);
  if (!cart) return { error: "Cart not found" };

  cart.items = [];
  cart.subtotal = 0;
  cart.updatedAt = new Date().toISOString();
  carts.set(cartId, cart);
  return cart;
}

export function createOrder(cartId: string, customerEmail: string, paymentMethod: "BTC" | "ETH" | "USDT" | "USDC"): Order | { error: string } {
  const cart = carts.get(cartId);
  if (!cart) return { error: "Cart not found" };
  if (cart.items.length === 0) return { error: "Cart is empty" };
  if (!customerEmail || !customerEmail.includes("@")) return { error: "Invalid email" };

  const id = `ord_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
  const order: Order = {
    id,
    cartId,
    customerEmail,
    paymentMethod,
    status: "pending",
    total: cart.subtotal,
    createdAt: new Date().toISOString(),
  };
  orders.set(id, order);
  carts.delete(cartId); // Clear cart after order creation
  return order;
}

export function getOrders(): Order[] {
  return Array.from(orders.values());
}

export function getOrder(orderId: string): Order | undefined {
  return orders.get(orderId);
}

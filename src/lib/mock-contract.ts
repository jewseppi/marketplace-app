import { products } from "@/data/products";

export const MOCK_PAYMENT_TOKENS = {
  ETH: { decimals: 18, symbol: "ETH", name: "Ethereum" },
  USDT: { decimals: 6, symbol: "USDT", name: "Tether USD" },
  USDC: { decimals: 6, symbol: "USDC", name: "USD Coin" },
  BTC: { decimals: 8, symbol: "BTC", name: "Bitcoin (wrapped)" },
} as const;

export type PaymentToken = keyof typeof MOCK_PAYMENT_TOKENS;
export type OrderStatus = "pending" | "confirmed" | "cancelled";

export type MockListing = {
  itemId: number;
  productId: number;
  seller: string;
  tokenAddress: string;
  tokenId: number;
  price: number;
  paymentToken: PaymentToken;
  isActive: boolean;
  isSold: boolean;
  quantity: number;
  owner: string;
  createdAt: number;
  updatedAt: number;
};

export type MockOrder = {
  orderId: number;
  itemId: number;
  buyer: string;
  seller: string;
  price: number;
  quantity: number;
  paymentToken: PaymentToken;
  status: OrderStatus;
  createdAt: number;
  txHash: string;
  productId: number;
};

export type MockTransactionReceipt = {
  hash: string;
  status: 0 | 1;
  blockNumber: number;
  confirmations: number;
  from: string;
  to: string;
  gasUsed: bigint;
  timestamp: number;
};

export type MockStoreSnapshot = {
  listings: MockListing[];
  orders: MockOrder[];
  totalItems: number;
};

const DEFAULT_SELLERS = [
  "0x9F2A1c1F2E6F7d4f6E0B8329236632f2a7f84810",
  "0x2dB86312F9d5A06a5169d4AaE780Dd4e51338E13",
  "0x7Ff9B0A0Afd3fCe79AF10c9f76A4Baf1Eb97032f",
] as const;

const listeners = new Set<() => void>();

let nextOrderId = 1;
let blockNumber = 23_400_000;

function wait(ms: number) {
  return new Promise<void>((resolve) => {
    setTimeout(resolve, ms);
  });
}

function randomDelay() {
  return 500 + Math.floor(Math.random() * 500);
}

function randomHex(bytes: number) {
  const values = new Uint8Array(bytes);
  if (typeof globalThis.crypto !== "undefined") {
    globalThis.crypto.getRandomValues(values);
  } else {
    for (let index = 0; index < bytes; index += 1) {
      values[index] = Math.floor(Math.random() * 256);
    }
  }
  return Array.from(values, (value) => value.toString(16).padStart(2, "0")).join("");
}

function randomHash(seed: string) {
  const prefix = seed.split("").reduce((sum, char) => sum + char.charCodeAt(0), 0).toString(16);
  return `0x${`${prefix}${randomHex(32)}`.slice(0, 64).padEnd(64, "0")}`;
}

function makeReceipt(from: string, to: string, seed: string): MockTransactionReceipt {
  blockNumber += 1;
  return {
    hash: randomHash(seed),
    status: 1,
    blockNumber,
    confirmations: 1,
    from,
    to,
    gasUsed: BigInt(21000 + Math.floor(Math.random() * 40000)),
    timestamp: Date.now(),
  };
}

function seedListings() {
  const now = Date.now();
  return new Map<number, MockListing>(
    products.map((product, index) => {
      const seller = DEFAULT_SELLERS[index % DEFAULT_SELLERS.length];
      const listing: MockListing = {
        itemId: product.id,
        productId: product.id,
        seller,
        tokenAddress: `0x${(product.id + 1000).toString(16).padStart(40, "0")}`,
        tokenId: product.id,
        price: product.price,
        paymentToken: "ETH",
        isActive: true,
        isSold: false,
        quantity: 5,
        owner: seller,
        createdAt: now,
        updatedAt: now,
      };
      return [listing.itemId, listing];
    }),
  );
}

const store = {
  listings: seedListings(),
  orders: new Map<number, MockOrder>(),
};

function emitChange() {
  listeners.forEach((listener) => listener());
}

function cloneListing(listing: MockListing): MockListing {
  return { ...listing };
}

function cloneOrder(order: MockOrder): MockOrder {
  return { ...order };
}

function normalizePrice(value: number | bigint, paymentToken: PaymentToken) {
  if (typeof value === "bigint") {
    return Number(value) / Math.pow(10, MOCK_PAYMENT_TOKENS[paymentToken].decimals);
  }
  return value;
}

export class MockMarketplaceEngine {
  subscribe(listener: () => void) {
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  }

  getSnapshot(): MockStoreSnapshot {
    return {
      listings: Array.from(store.listings.values()).map(cloneListing),
      orders: Array.from(store.orders.values()).map(cloneOrder),
      totalItems: store.listings.size,
    };
  }

  getListingByProductId(productId: number) {
    const listing = Array.from(store.listings.values()).find((entry) => entry.productId === productId);
    return listing ? cloneListing(listing) : undefined;
  }

  ensureListingForProduct(productId: number, paymentToken: PaymentToken = "ETH") {
    const existing = this.getListingByProductId(productId);
    if (existing) {
      if (existing.paymentToken !== paymentToken) {
        const listing = store.listings.get(existing.itemId);
        if (listing) {
          listing.paymentToken = paymentToken;
          listing.updatedAt = Date.now();
          emitChange();
        }
      }
      return this.getListingByProductId(productId)!;
    }

    const product = products.find((entry) => entry.id === productId);
    if (!product) {
      throw new Error("Product not found");
    }

    const itemId = store.listings.size + 1;
    const seller = DEFAULT_SELLERS[itemId % DEFAULT_SELLERS.length];
    const now = Date.now();
    const listing: MockListing = {
      itemId,
      productId,
      seller,
      tokenAddress: `0x${(productId + 1000).toString(16).padStart(40, "0")}`,
      tokenId: productId,
      price: product.price,
      paymentToken,
      isActive: true,
      isSold: false,
      quantity: 5,
      owner: seller,
      createdAt: now,
      updatedAt: now,
    };
    store.listings.set(itemId, listing);
    emitChange();
    return cloneListing(listing);
  }

  async listItem(input: {
    productId: number;
    seller: string;
    tokenAddress?: string;
    tokenId?: number;
    price: number;
    paymentToken?: PaymentToken;
    quantity?: number;
  }) {
    await wait(randomDelay());
    const existing = this.getListingByProductId(input.productId);
    if (existing) {
      throw new Error("Listing already exists for product");
    }

    const now = Date.now();
    const listing: MockListing = {
      itemId: store.listings.size + 1,
      productId: input.productId,
      seller: input.seller,
      tokenAddress: input.tokenAddress ?? `0x${(input.productId + 1000).toString(16).padStart(40, "0")}`,
      tokenId: input.tokenId ?? input.productId,
      price: input.price,
      paymentToken: input.paymentToken ?? "ETH",
      isActive: true,
      isSold: false,
      quantity: input.quantity ?? 1,
      owner: input.seller,
      createdAt: now,
      updatedAt: now,
    };
    store.listings.set(listing.itemId, listing);
    emitChange();
    return {
      listing: cloneListing(listing),
      receipt: makeReceipt(input.seller, listing.tokenAddress, `list:${listing.itemId}`),
    };
  }

  async purchaseItem(itemId: number, buyer: string, paymentToken: PaymentToken = "ETH", quantity = 1) {
    return this.createOrder(itemId, paymentToken, buyer, quantity);
  }

  async cancelListing(itemId: number, actorAddress: string) {
    const listing = store.listings.get(itemId);
    if (!listing) {
      throw new Error("Listing not found");
    }
    if (listing.seller !== actorAddress) {
      throw new Error("Only seller can cancel listing");
    }

    await wait(randomDelay());
    listing.isActive = false;
    listing.updatedAt = Date.now();
    emitChange();
    return makeReceipt(actorAddress, listing.tokenAddress, `cancel:${itemId}`);
  }

  async updatePrice(itemId: number, newPrice: number | bigint, actorAddress: string, paymentToken: PaymentToken = "ETH") {
    const listing = store.listings.get(itemId);
    if (!listing) {
      throw new Error("Listing not found");
    }
    if (listing.seller !== actorAddress) {
      throw new Error("Only seller can update price");
    }

    await wait(randomDelay());
    listing.price = normalizePrice(newPrice, paymentToken);
    listing.paymentToken = paymentToken;
    listing.updatedAt = Date.now();
    emitChange();
    return makeReceipt(actorAddress, listing.tokenAddress, `price:${itemId}`);
  }

  async createOrder(itemId: number, paymentToken: PaymentToken, buyer: string, quantity = 1) {
    const listing = store.listings.get(itemId);
    if (!listing) {
      throw new Error("Listing not found");
    }
    if (!listing.isActive || listing.isSold) {
      throw new Error("Listing is not available");
    }
    if (quantity < 1) {
      throw new Error("Quantity must be at least 1");
    }
    if (quantity > listing.quantity) {
      throw new Error("Insufficient quantity available");
    }

    await wait(randomDelay());
    const receipt = makeReceipt(buyer, listing.tokenAddress, `order:${itemId}:${nextOrderId}`);
    const order: MockOrder = {
      orderId: nextOrderId,
      itemId,
      buyer,
      seller: listing.seller,
      price: Number((listing.price * quantity).toFixed(2)),
      quantity,
      paymentToken,
      status: "pending",
      createdAt: Date.now(),
      txHash: receipt.hash,
      productId: listing.productId,
    };
    store.orders.set(order.orderId, order);
    nextOrderId += 1;
    emitChange();

    await wait(randomDelay());
    order.status = "confirmed";
    listing.quantity -= quantity;
    listing.paymentToken = paymentToken;
    listing.updatedAt = Date.now();
    if (listing.quantity <= 0) {
      listing.quantity = 0;
      listing.isSold = true;
      listing.isActive = false;
      listing.owner = buyer;
    }
    emitChange();

    return {
      order: cloneOrder(order),
      receipt,
      listing: cloneListing(listing),
    };
  }

  getItem(itemId: number) {
    const listing = store.listings.get(itemId);
    if (!listing) {
      throw new Error("Listing not found");
    }
    return cloneListing(listing);
  }

  getActiveItems() {
    return Array.from(store.listings.values())
      .filter((listing) => listing.isActive && listing.quantity > 0)
      .map((listing) => listing.itemId);
  }

  getSellerItems(sellerAddress: string) {
    return Array.from(store.listings.values())
      .filter((listing) => listing.seller.toLowerCase() === sellerAddress.toLowerCase())
      .map((listing) => listing.itemId);
  }

  getTotalItems() {
    return store.listings.size;
  }

  getOrder(orderId: number) {
    const order = store.orders.get(orderId);
    if (!order) {
      throw new Error("Order not found");
    }
    return cloneOrder(order);
  }

  getBuyerOrders(buyerAddress: string) {
    return Array.from(store.orders.values())
      .filter((order) => order.buyer.toLowerCase() === buyerAddress.toLowerCase())
      .map((order) => order.orderId);
  }

  async updateOrderStatus(orderId: number, status: OrderStatus) {
    const order = store.orders.get(orderId);
    if (!order) {
      throw new Error("Order not found");
    }

    await wait(randomDelay());
    order.status = status;
    emitChange();
    return makeReceipt(order.buyer, order.seller, `order-status:${orderId}:${status}`);
  }
}

const mockMarketplaceSingleton = new MockMarketplaceEngine();

export function getMockMarketplace() {
  return mockMarketplaceSingleton;
}

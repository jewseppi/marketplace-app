import Database from "better-sqlite3";
import { randomUUID } from "node:crypto";
import { existsSync, mkdirSync, readFileSync } from "node:fs";
import path from "node:path";
import type {
  Cart,
  CartItem,
  Order,
  Product,
  ProductCategory,
} from "@/data/products";
import { seedProductCatalog } from "@/db/seed";

type ProductRow = {
  id: number;
  title: string;
  description: string;
  price: number;
  category: ProductCategory;
  image_main: string;
  image_additional: string;
  in_stock: number;
  sku: string;
};

type CartRow = {
  id: string;
  subtotal: number;
  created_at: string;
  updated_at: string;
};

type CartItemRow = {
  product_id: number;
  quantity: number;
};

type OrderRow = {
  id: string;
  cart_id: string;
  customer_email: string;
  payment_method: Order["paymentMethod"];
  status: Order["status"];
  total: number;
  wallet_address: string | null;
  payment_expires_at: string | null;
  created_at: string;
};

type ListingRow = {
  id: string;
  product_id: number;
  seller_address: string;
  token_address: string | null;
  token_id: number | null;
  price: number;
  payment_token: string;
  status: string;
  tx_hash: string | null;
  is_active: number;
  is_sold: number;
  created_at: string;
  updated_at: string;
};

export type Listing = {
  id: string;
  productId: number;
  sellerAddress: string;
  tokenAddress: string | null;
  tokenId: number | null;
  price: number;
  paymentToken: string;
  status: string;
  txHash: string | null;
  isActive: boolean;
  isSold: boolean;
  createdAt: string;
  updatedAt: string;
};

export type StoredOrder = Order & {
  walletAddress?: string | null;
  paymentExpiresAt?: string | null;
};

const DB_DIR = path.join(process.cwd(), "data");
const DB_PATH = path.join(DB_DIR, "marketplace.db");
const SCHEMA_PATH = path.join(process.cwd(), "src", "db", "schema.sql");

let dbInstance: InstanceType<typeof Database> | null = null;

function mapProduct(row: ProductRow): Product {
  return {
    id: row.id,
    title: row.title,
    description: row.description,
    price: row.price,
    category: row.category,
    images: {
      main: row.image_main,
      additional: JSON.parse(row.image_additional) as string[],
    },
    inStock: Boolean(row.in_stock),
    sku: row.sku,
  };
}

function mapOrder(row: OrderRow): StoredOrder {
  return {
    id: row.id,
    cartId: row.cart_id,
    customerEmail: row.customer_email,
    paymentMethod: row.payment_method,
    status: row.status,
    total: row.total,
    createdAt: row.created_at,
    walletAddress: row.wallet_address,
    paymentExpiresAt: row.payment_expires_at,
  };
}

function mapListing(row: ListingRow): Listing {
  return {
    id: row.id,
    productId: row.product_id,
    sellerAddress: row.seller_address,
    tokenAddress: row.token_address,
    tokenId: row.token_id,
    price: row.price,
    paymentToken: row.payment_token,
    status: row.status,
    txHash: row.tx_hash,
    isActive: Boolean(row.is_active),
    isSold: Boolean(row.is_sold),
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function getDB() {
  return initDB();
}

function recalculateCartSubtotal(db: InstanceType<typeof Database>, cartId: string) {
  const row = db
    .prepare(
      `SELECT COALESCE(SUM(products.price * cart_items.quantity), 0) as subtotal
       FROM cart_items
       JOIN products ON products.id = cart_items.product_id
       WHERE cart_items.cart_id = ?`,
    )
    .get(cartId) as { subtotal: number };
  const subtotal = Number(row?.subtotal ?? 0);
  db.prepare("UPDATE carts SET subtotal = ?, updated_at = ? WHERE id = ?").run(subtotal, new Date().toISOString(), cartId);
  return subtotal;
}

export function initDB() {
  if (dbInstance) {
    return dbInstance;
  }

  if (!existsSync(DB_DIR)) {
    mkdirSync(DB_DIR, { recursive: true });
  }

  const db = new Database(DB_PATH);
  db.pragma("journal_mode = WAL");
  db.pragma("foreign_keys = ON");
  db.exec(readFileSync(SCHEMA_PATH, "utf8"));

  const productCount = db.prepare("SELECT COUNT(*) as count FROM products").get() as { count: number };
  if (!productCount.count) {
    seedProductCatalog(db);
  }

  dbInstance = db;
  return db;
}

export function getProduct(id: number) {
  const row = getDB().prepare("SELECT * FROM products WHERE id = ?").get(id) as ProductRow | undefined;
  return row ? mapProduct(row) : undefined;
}

export function listProducts() {
  const rows = getDB().prepare("SELECT * FROM products ORDER BY id ASC").all() as ProductRow[];
  return rows.map(mapProduct);
}

export function searchProducts(options: { query?: string; category?: string | null }) {
  const clauses: string[] = [];
  const values: Array<string> = [];

  if (options.category && options.category !== "all") {
    clauses.push("category = ?");
    values.push(options.category);
  }

  if (options.query?.trim()) {
    clauses.push("(LOWER(title) LIKE ? OR LOWER(description) LIKE ? OR LOWER(category) LIKE ? OR LOWER(sku) LIKE ?)");
    const like = `%${options.query.trim().toLowerCase()}%`;
    values.push(like, like, like, like);
  }

  const where = clauses.length ? `WHERE ${clauses.join(" AND ")}` : "";
  const rows = getDB().prepare(`SELECT * FROM products ${where} ORDER BY id ASC`).all(...values) as ProductRow[];
  return rows.map(mapProduct);
}

export function getCart(cartId: string) {
  const db = getDB();
  const cart = db.prepare("SELECT * FROM carts WHERE id = ?").get(cartId) as CartRow | undefined;
  if (!cart) {
    return undefined;
  }
  const items = db
    .prepare("SELECT product_id, quantity FROM cart_items WHERE cart_id = ? ORDER BY product_id ASC")
    .all(cartId) as CartItemRow[];

  return {
    id: cart.id,
    items: items.map((item): CartItem => ({ productId: item.product_id, quantity: item.quantity })),
    subtotal: cart.subtotal,
    createdAt: cart.created_at,
    updatedAt: cart.updated_at,
  } satisfies Cart;
}

export function createCart() {
  const db = getDB();
  const id = randomUUID();
  const now = new Date().toISOString();
  db.prepare("INSERT INTO carts (id, subtotal, created_at, updated_at) VALUES (?, 0, ?, ?)").run(id, now, now);
  return getCart(id)!;
}

export function addToCart(cartId: string, productId: number, quantity = 1) {
  const db = getDB();
  const cart = getCart(cartId);
  if (!cart) return { error: "Cart not found" };
  if (quantity <= 0) return { error: "Invalid quantity" };

  const product = getProduct(productId);
  if (!product) return { error: "Product not found" };
  if (!product.inStock) return { error: "Product out of stock" };

  db.prepare(
    `INSERT INTO cart_items (cart_id, product_id, quantity)
     VALUES (?, ?, ?)
     ON CONFLICT(cart_id, product_id) DO UPDATE SET quantity = cart_items.quantity + excluded.quantity`,
  ).run(cartId, productId, quantity);
  recalculateCartSubtotal(db, cartId);
  return getCart(cartId)!;
}

export function updateCartQuantity(cartId: string, productId: number, quantity: number) {
  const db = getDB();
  const cart = getCart(cartId);
  if (!cart) return { error: "Cart not found" };

  const item = cart.items.find((entry) => entry.productId === productId);
  if (!item) return { error: "Item not in cart" };
  if (quantity <= 0) {
    return removeFromCart(cartId, productId);
  }

  db.prepare("UPDATE cart_items SET quantity = ? WHERE cart_id = ? AND product_id = ?").run(quantity, cartId, productId);
  recalculateCartSubtotal(db, cartId);
  return getCart(cartId)!;
}

export function removeFromCart(cartId: string, productId: number) {
  const db = getDB();
  const cart = getCart(cartId);
  if (!cart) return { error: "Cart not found" };

  db.prepare("DELETE FROM cart_items WHERE cart_id = ? AND product_id = ?").run(cartId, productId);
  recalculateCartSubtotal(db, cartId);
  return getCart(cartId)!;
}

export function clearCart(cartId: string) {
  const db = getDB();
  const cart = getCart(cartId);
  if (!cart) return { error: "Cart not found" };

  db.prepare("DELETE FROM cart_items WHERE cart_id = ?").run(cartId);
  recalculateCartSubtotal(db, cartId);
  return getCart(cartId)!;
}

export function createOrder(
  cartId: string,
  customerEmail: string,
  paymentMethod: Order["paymentMethod"],
  options?: { walletAddress?: string; paymentExpiresAt?: string },
) {
  const db = getDB();
  const cart = getCart(cartId);
  if (!cart) return { error: "Cart not found" };
  if (cart.items.length === 0) return { error: "Cart is empty" };
  if (!customerEmail || !customerEmail.includes("@")) return { error: "Invalid email" };

  const id = randomUUID();
  const createdAt = new Date().toISOString();
  const order = db.transaction(() => {
    db.prepare(
      `INSERT INTO orders (
        id, cart_id, customer_email, payment_method, status, total,
        wallet_address, payment_expires_at, created_at
      ) VALUES (?, ?, ?, ?, 'pending', ?, ?, ?, ?)`,
    ).run(id, cartId, customerEmail, paymentMethod, cart.subtotal, options?.walletAddress ?? null, options?.paymentExpiresAt ?? null, createdAt);

    const insertItem = db.prepare(
      `INSERT INTO order_items (order_id, product_id, quantity, unit_price)
       VALUES (?, ?, ?, ?)`,
    );
    for (const item of cart.items) {
      const product = getProduct(item.productId);
      if (!product) {
        throw new Error(`Product ${item.productId} not found during order creation`);
      }
      insertItem.run(id, item.productId, item.quantity, product.price);
    }

    db.prepare("DELETE FROM cart_items WHERE cart_id = ?").run(cartId);
    db.prepare("DELETE FROM carts WHERE id = ?").run(cartId);

    return getOrder(id)!;
  });

  return order();
}

export function getOrder(orderId: string) {
  const row = getDB().prepare("SELECT * FROM orders WHERE id = ?").get(orderId) as OrderRow | undefined;
  return row ? mapOrder(row) : undefined;
}

export function listOrders() {
  const rows = getDB().prepare("SELECT * FROM orders ORDER BY created_at DESC").all() as OrderRow[];
  return rows.map(mapOrder);
}

export function getListing(id: string) {
  const row = getDB().prepare("SELECT * FROM listings WHERE id = ?").get(id) as ListingRow | undefined;
  return row ? mapListing(row) : undefined;
}

export function createListing(input: {
  id?: string;
  productId: number;
  sellerAddress: string;
  tokenAddress?: string | null;
  tokenId?: number | null;
  price: number;
  paymentToken?: string;
  status?: string;
  txHash?: string | null;
  isActive?: boolean;
  isSold?: boolean;
}) {
  const db = getDB();
  if (!getProduct(input.productId)) {
    return { error: "Product not found" };
  }

  const id = input.id ?? randomUUID();
  const now = new Date().toISOString();
  db.prepare(
    `INSERT INTO listings (
      id, product_id, seller_address, token_address, token_id, price,
      payment_token, status, tx_hash, is_active, is_sold, created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
  ).run(
    id,
    input.productId,
    input.sellerAddress,
    input.tokenAddress ?? null,
    input.tokenId ?? null,
    input.price,
    input.paymentToken ?? "ETH",
    input.status ?? "listed",
    input.txHash ?? null,
    input.isActive === false ? 0 : 1,
    input.isSold ? 1 : 0,
    now,
    now,
  );
  return getListing(id)!;
}

export function updateListing(
  id: string,
  patch: Partial<{
    sellerAddress: string;
    tokenAddress: string | null;
    tokenId: number | null;
    price: number;
    paymentToken: string;
    status: string;
    txHash: string | null;
    isActive: boolean;
    isSold: boolean;
  }>,
) {
  const current = getListing(id);
  if (!current) {
    return { error: "Listing not found" };
  }

  const next = {
    sellerAddress: patch.sellerAddress ?? current.sellerAddress,
    tokenAddress: patch.tokenAddress ?? current.tokenAddress,
    tokenId: patch.tokenId ?? current.tokenId,
    price: patch.price ?? current.price,
    paymentToken: patch.paymentToken ?? current.paymentToken,
    status: patch.status ?? current.status,
    txHash: patch.txHash ?? current.txHash,
    isActive: patch.isActive ?? current.isActive,
    isSold: patch.isSold ?? current.isSold,
  };

  getDB().prepare(
    `UPDATE listings SET
      seller_address = ?, token_address = ?, token_id = ?, price = ?,
      payment_token = ?, status = ?, tx_hash = ?, is_active = ?, is_sold = ?, updated_at = ?
     WHERE id = ?`,
  ).run(
    next.sellerAddress,
    next.tokenAddress,
    next.tokenId,
    next.price,
    next.paymentToken,
    next.status,
    next.txHash,
    next.isActive ? 1 : 0,
    next.isSold ? 1 : 0,
    new Date().toISOString(),
    id,
  );

  return getListing(id)!;
}

import Database from "better-sqlite3";
import { products as seedProducts } from "@/data/products";
import type { Product } from "@/data/products";

function nowIso() {
  return new Date().toISOString();
}

function normalizeProduct(product: Product) {
  const now = nowIso();
  return {
    id: product.id,
    title: product.title,
    description: product.description,
    price: product.price,
    category: product.category,
    imageMain: product.images.main,
    imageAdditional: JSON.stringify(product.images.additional),
    inStock: product.inStock ? 1 : 0,
    sku: product.sku,
    createdAt: now,
    updatedAt: now,
  };
}

export function seedProductCatalog(db: InstanceType<typeof Database>) {
  const insert = db.prepare(`
    INSERT INTO products (
      id, title, description, price, category, image_main, image_additional,
      in_stock, sku, created_at, updated_at
    ) VALUES (
      @id, @title, @description, @price, @category, @imageMain, @imageAdditional,
      @inStock, @sku, @createdAt, @updatedAt
    )
    ON CONFLICT(id) DO UPDATE SET
      title = excluded.title,
      description = excluded.description,
      price = excluded.price,
      category = excluded.category,
      image_main = excluded.image_main,
      image_additional = excluded.image_additional,
      in_stock = excluded.in_stock,
      sku = excluded.sku,
      updated_at = excluded.updated_at
  `);

  const seed = db.transaction((catalog: Product[]) => {
    for (const product of catalog) {
      insert.run(normalizeProduct(product));
    }
  });

  seed(seedProducts);
  return db.prepare("SELECT COUNT(*) as count FROM products").get() as { count: number };
}

export function reseedProductCatalog(db: InstanceType<typeof Database>) {
  const reset = db.transaction(() => {
    db.exec("DELETE FROM order_items; DELETE FROM orders; DELETE FROM cart_items; DELETE FROM carts; DELETE FROM listings; DELETE FROM products;");
    seedProductCatalog(db);
  });

  reset();
  return db.prepare("SELECT COUNT(*) as count FROM products").get() as { count: number };
}

"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { products } from "@/data/products";

export type CartItem = { id: number; quantity: number };

export type CartLine = CartItem & { product: Product };

type CartContextValue = {
  items: CartItem[];
  lines: CartLine[];
  itemCount: number;
  subtotal: number;
  addItem: (id: number, quantity?: number) => Promise<void>;
  setQuantity: (id: number, quantity: number) => Promise<void>;
  removeItem: (id: number) => Promise<void>;
  clear: () => Promise<void>;
};

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [hydrated, setHydrated] = useState(false);

  // Load cart from server cookie on mount
  useEffect(() => {
    fetch("/api/cart")
      .then((r) => r.json())
      .then((data) => {
        setItems(data.cart);
        setHydrated(true);
      })
      .catch(() => {
        setHydrated(true);
      });
  }, []);

  const addItem = useCallback(async (id: number, quantity = 1) => {
    await fetch("/api/cart", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "add", id, quantity }),
    });
    setItems((prev) => {
      const existing = prev.find((entry) => entry.id === id);
      if (existing) {
        return prev.map((entry) =>
          entry.id === id ? { ...entry, quantity: entry.quantity + quantity } : entry,
        );
      }
      return [...prev, { id, quantity }];
    });
  }, []);

  const setQuantity = useCallback(async (id: number, quantity: number) => {
    await fetch("/api/cart", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "set-quantity", id, quantity }),
    });
    if (quantity <= 0) {
      setItems((prev) => prev.filter((entry) => entry.id !== id));
    } else {
      setItems((prev) =>
        prev.map((entry) => (entry.id === id ? { ...entry, quantity } : entry)),
      );
    }
  }, []);

  const removeItem = useCallback(async (id: number) => {
    await fetch("/api/cart", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "remove", id }),
    });
    setItems((prev) => prev.filter((entry) => entry.id !== id));
  }, []);

  const clear = useCallback(async () => {
    await fetch("/api/cart", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "clear" }),
    });
    setItems([]);
  }, []);

  const value = useMemo<CartContextValue>(() => {
    const lines: CartLine[] = items
      .map((entry) => {
        const product = products.find((p) => p.id === entry.id);
        return product ? { ...entry, product } : null;
      })
      .filter((line): line is CartLine => line !== null);

    const itemCount = lines.reduce((sum, line) => sum + line.quantity, 0);
    const subtotal = lines.reduce(
      (sum, line) => sum + line.product.price * line.quantity,
      0,
    );

    return {
      items,
      lines,
      itemCount,
      subtotal,
      addItem,
      setQuantity,
      removeItem,
      clear,
    };
  }, [items, addItem, setQuantity, removeItem, clear]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return ctx;
}

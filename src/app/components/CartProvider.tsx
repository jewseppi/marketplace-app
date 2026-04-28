"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { products, type Product } from "@/data/products";

export type CartItem = { id: number; quantity: number };

export type CartLine = CartItem & { product: Product };

type CartContextValue = {
  items: CartItem[];
  lines: CartLine[];
  itemCount: number;
  subtotal: number;
  addItem: (id: number, quantity?: number) => void;
  setQuantity: (id: number, quantity: number) => void;
  removeItem: (id: number) => void;
  clear: () => void;
};

const CartContext = createContext<CartContextValue | null>(null);

const STORAGE_KEY = "crypto-couture-cart";

function readStoredCart(): CartItem[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed
      .filter(
        (entry): entry is CartItem =>
          typeof entry === "object" &&
          entry !== null &&
          typeof (entry as CartItem).id === "number" &&
          typeof (entry as CartItem).quantity === "number" &&
          (entry as CartItem).quantity > 0,
      )
      .map((entry) => ({ id: entry.id, quantity: entry.quantity }));
  } catch {
    return [];
  }
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setItems(readStoredCart());
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }, [items, hydrated]);

  const addItem = useCallback((id: number, quantity = 1) => {
    if (quantity <= 0) return;
    setItems((prev) => {
      const existing = prev.find((entry) => entry.id === id);
      if (existing) {
        return prev.map((entry) =>
          entry.id === id
            ? { ...entry, quantity: entry.quantity + quantity }
            : entry,
        );
      }
      return [...prev, { id, quantity }];
    });
  }, []);

  const setQuantity = useCallback((id: number, quantity: number) => {
    setItems((prev) => {
      if (quantity <= 0) return prev.filter((entry) => entry.id !== id);
      return prev.map((entry) =>
        entry.id === id ? { ...entry, quantity } : entry,
      );
    });
  }, []);

  const removeItem = useCallback((id: number) => {
    setItems((prev) => prev.filter((entry) => entry.id !== id));
  }, []);

  const clear = useCallback(() => setItems([]), []);

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

"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import type { Product } from "@/data/products";

export type CartItem = { id: number; quantity: number };

export type CartLine = CartItem & { product: Product };

type CartResponse = {
  cart?: CartItem[];
  lines?: CartLine[];
  itemCount?: number;
  subtotal?: number;
};

type CartContextValue = {
  items: CartItem[];
  lines: CartLine[];
  itemCount: number;
  subtotal: number;
  loading: boolean;
  addItem: (id: number, quantity?: number) => Promise<void>;
  setQuantity: (id: number, quantity: number) => Promise<void>;
  removeItem: (id: number) => Promise<void>;
  clear: () => Promise<void>;
  refresh: () => Promise<void>;
};

const CartContext = createContext<CartContextValue | null>(null);

function normalizeCart(data: CartResponse) {
  const lines = Array.isArray(data.lines) ? data.lines : [];
  return {
    items: Array.isArray(data.cart) ? data.cart : lines.map(({ id, quantity }) => ({ id, quantity })),
    lines,
    itemCount: typeof data.itemCount === "number" ? data.itemCount : lines.reduce((sum, line) => sum + line.quantity, 0),
    subtotal: typeof data.subtotal === "number" ? data.subtotal : lines.reduce((sum, line) => sum + line.product.price * line.quantity, 0),
  };
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [lines, setLines] = useState<CartLine[]>([]);
  const [itemCount, setItemCount] = useState(0);
  const [subtotal, setSubtotal] = useState(0);
  const [loading, setLoading] = useState(true);

  const applyCart = useCallback((data: CartResponse) => {
    const next = normalizeCart(data);
    setItems(next.items);
    setLines(next.lines);
    setItemCount(next.itemCount);
    setSubtotal(next.subtotal);
  }, []);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/cart", { cache: "no-store" });
      const data = (await response.json()) as CartResponse;
      applyCart(data);
    } finally {
      setLoading(false);
    }
  }, [applyCart]);

  useEffect(() => {
    refresh().catch(() => {});
  }, [refresh]);

  const mutateCart = useCallback(
    async (body: Record<string, unknown>) => {
      setLoading(true);
      try {
        const response = await fetch("/api/cart", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });
        const data = (await response.json()) as CartResponse & { error?: string };
        if (!response.ok) {
          throw new Error(data.error || "Cart update failed");
        }
        applyCart(data);
      } finally {
        setLoading(false);
      }
    },
    [applyCart],
  );

  const addItem = useCallback(async (id: number, quantity = 1) => {
    await mutateCart({ action: "add", id, quantity });
  }, [mutateCart]);

  const setQuantity = useCallback(async (id: number, quantity: number) => {
    await mutateCart({ action: "set-quantity", id, quantity });
  }, [mutateCart]);

  const removeItem = useCallback(async (id: number) => {
    await mutateCart({ action: "remove", id });
  }, [mutateCart]);

  const clear = useCallback(async () => {
    await mutateCart({ action: "clear" });
  }, [mutateCart]);

  const value = useMemo<CartContextValue>(() => ({
    items,
    lines,
    itemCount,
    subtotal,
    loading,
    addItem,
    setQuantity,
    removeItem,
    clear,
    refresh,
  }), [items, lines, itemCount, subtotal, loading, addItem, setQuantity, removeItem, clear, refresh]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return ctx;
}

"use client";

import { useEffect, useMemo, useState } from "react";

export type CartLine = {
  id: string;
  name: string;
  price: number;
  quantity: number;
};

const storageKey = "pak_sushi_cart";

export function useCart() {
  const [cart, setCart] = useState<Record<string, CartLine>>({});
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const stored = window.localStorage.getItem(storageKey);
    if (stored) {
      try {
        setCart(JSON.parse(stored));
      } catch {
        setCart({});
      }
    }
    setIsLoaded(true);
  }, []);

  useEffect(() => {
    if (!isLoaded) return;
    window.localStorage.setItem(storageKey, JSON.stringify(cart));
  }, [cart, isLoaded]);

  const lines = useMemo(() => Object.values(cart), [cart]);
  const total = useMemo(() => lines.reduce((sum, line) => sum + line.price * line.quantity, 0), [lines]);
  const count = useMemo(() => lines.reduce((sum, line) => sum + line.quantity, 0), [lines]);

  function add(item: { id: string; name: string; sellingPrice: number }) {
    setCart((current) => ({
      ...current,
      [item.id]: {
        id: item.id,
        name: item.name,
        price: item.sellingPrice,
        quantity: (current[item.id]?.quantity ?? 0) + 1
      }
    }));
  }

  function remove(id: string) {
    setCart((current) => {
      const line = current[id];
      if (!line) return current;
      const next = { ...current };
      if (line.quantity <= 1) delete next[id];
      else next[id] = { ...line, quantity: line.quantity - 1 };
      return next;
    });
  }

  function clear() {
    setCart({});
  }

  return { cart, lines, total, count, add, remove, clear };
}

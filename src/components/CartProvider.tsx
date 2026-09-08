"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { dealDiscountAgorot, type ProductVariant } from "@/lib/pricing";

export type CartItem = {
  productId: string;
  slug: string;
  name: string;
  imageUrl: string;
  variant: ProductVariant;
  variantLabel: string;
  quantity: number;
  unitPriceAgorot: number;
  stockQuantity: number;
};

type CartContextValue = {
  items: CartItem[];
  count: number;
  subtotalAgorot: number;
  discountAgorot: number;
  totalAgorot: number;
  remainingFor: (productId: string, variant: ProductVariant, stockQuantity: number) => number;
  addItem: (item: Omit<CartItem, "quantity">, quantity?: number) => void;
  updateQuantity: (productId: string, variant: ProductVariant, quantity: number) => void;
  removeItem: (productId: string, variant: ProductVariant) => void;
  clear: () => void;
};

const CartContext = createContext<CartContextValue | null>(null);
const STORAGE_KEY = "sukkot-cart-v5";

function remainingForVariant(
  items: CartItem[],
  productId: string,
  variant: ProductVariant,
  stockQuantity: number,
) {
  const used = items
    .filter((row) => row.productId === productId && row.variant === variant)
    .reduce((sum, row) => sum + row.quantity, 0);
  return Math.max(0, stockQuantity - used);
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as CartItem[];
        if (Array.isArray(parsed)) {
          setItems(parsed);
        }
      }
    } catch {
      localStorage.removeItem(STORAGE_KEY);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }, [items]);

  const value = useMemo<CartContextValue>(() => {
    const subtotalAgorot = items.reduce((sum, item) => sum + item.unitPriceAgorot * item.quantity, 0);
    const discountAgorot = dealDiscountAgorot(items);
    return {
      items,
      count: items.reduce((sum, item) => sum + item.quantity, 0),
      subtotalAgorot,
      discountAgorot,
      totalAgorot: subtotalAgorot - discountAgorot,
      remainingFor: (productId, variant, stockQuantity) =>
        remainingForVariant(items, productId, variant, stockQuantity),
      addItem: (item, quantity = 1) => {
        setItems((current) => {
          const room = remainingForVariant(current, item.productId, item.variant, item.stockQuantity);
          const nextQty = Math.min(quantity, room);
          if (nextQty <= 0) {
            return current;
          }
          const existing = current.find(
            (row) => row.productId === item.productId && row.variant === item.variant,
          );
          if (existing) {
            return current.map((row) =>
              row.productId === item.productId && row.variant === item.variant
                ? { ...row, quantity: row.quantity + nextQty, stockQuantity: item.stockQuantity }
                : row,
            );
          }
          return [...current, { ...item, quantity: nextQty }];
        });
      },
      updateQuantity: (productId, variant, quantity) => {
        setItems((current) =>
          current
            .map((row) => {
              if (row.productId !== productId || row.variant !== variant) {
                return row;
              }
              return { ...row, quantity: Math.min(row.stockQuantity, Math.max(0, quantity)) };
            })
            .filter((row) => row.quantity > 0),
        );
      },
      removeItem: (productId, variant) => {
        setItems((current) =>
          current.filter((row) => !(row.productId === productId && row.variant === variant)),
        );
      },
      clear: () => setItems([]),
    };
  }, [items]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) {
    throw new Error("useCart must be used within CartProvider");
  }
  return ctx;
}

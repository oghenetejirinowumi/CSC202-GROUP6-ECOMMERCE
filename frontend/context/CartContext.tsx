"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { apiFetch } from "../lib/api";
import type { Cart } from "../lib/types";
import { useAuth } from "./AuthContext";

type CartContextValue = {
  cart: Cart | null;
  loading: boolean;
  error: string | null;
  drawerOpen: boolean;
  setDrawerOpen: (open: boolean) => void;
  refreshCart: () => Promise<void>;
  addToCart: (productId: number, quantity?: number) => Promise<void>;
  updateQuantity: (productId: number, quantity: number) => Promise<void>;
  removeFromCart: (productId: number) => Promise<void>;
  clearCart: () => Promise<void>;
};

const emptyCart = (userId: number): Cart => ({
  user_id: userId,
  item_count: 0,
  subtotal: 0,
  items: [],
});

const CartContext = createContext<CartContextValue | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const { user, token } = useAuth();
  const [cart, setCart] = useState<Cart | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const refreshCart = useCallback(async () => {
    if (!user || !token) {
      setCart(null);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const data = await apiFetch<Cart>(`/api/cart/${user.id}`, { token });
      setCart(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load cart");
      setCart(emptyCart(user.id));
    } finally {
      setLoading(false);
    }
  }, [user, token]);

  useEffect(() => {
    if (!user || !token) {
      setCart(null);
      setDrawerOpen(false);
      setError(null);
      return;
    }

    refreshCart();
  }, [user, token, refreshCart]);

  const addToCart = useCallback(
    async (productId: number, quantity = 1) => {
      if (!user || !token) {
        throw new Error("Please log in to add items to your cart.");
      }

      const data = await apiFetch<{ cart: Cart }>("/api/cart", {
        method: "POST",
        token,
        body: JSON.stringify({
          user_id: user.id,
          product_id: productId,
          quantity,
        }),
      });
      setCart(data.cart);
      setDrawerOpen(true);
    },
    [user, token]
  );

  const updateQuantity = useCallback(
    async (productId: number, quantity: number) => {
      if (!user || !token) {
        throw new Error("Please log in to update your cart.");
      }

      const data = await apiFetch<{ cart: Cart }>("/api/cart", {
        method: "PUT",
        token,
        body: JSON.stringify({
          user_id: user.id,
          product_id: productId,
          quantity,
        }),
      });
      setCart(data.cart);
    },
    [user, token]
  );

  const removeFromCart = useCallback(
    async (productId: number) => {
      if (!user || !token) {
        throw new Error("Please log in to update your cart.");
      }

      const data = await apiFetch<{ cart: Cart }>(
        `/api/cart/${user.id}/${productId}`,
        { method: "DELETE", token }
      );
      setCart(data.cart);
    },
    [user, token]
  );

  const clearCart = useCallback(async () => {
    if (!user || !token) {
      return;
    }

    const data = await apiFetch<{ cart: Cart }>(`/api/cart/${user.id}`, {
      method: "DELETE",
      token,
    });
    setCart(data.cart);
  }, [user, token]);

  const value = useMemo(
    () => ({
      cart,
      loading,
      error,
      drawerOpen,
      setDrawerOpen,
      refreshCart,
      addToCart,
      updateQuantity,
      removeFromCart,
      clearCart,
    }),
    [
      cart,
      loading,
      error,
      drawerOpen,
      refreshCart,
      addToCart,
      updateQuantity,
      removeFromCart,
      clearCart,
    ]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within CartProvider");
  }
  return context;
}

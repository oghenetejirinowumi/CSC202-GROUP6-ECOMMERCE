"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { useAuth } from "./AuthContext";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:50000/api";
const GUEST_STORAGE_KEY = "teckvora_guest_id";

export type CartItem = {
  id: string;
  name: string;
  brand: string;
  price: number;
  quantity: number;
  image_url: string | null;
};

interface CartContextType {
  cart: CartItem[];
  addToCart: (product: { id: string }) => Promise<void>;
  removeFromCart: (id: string) => Promise<void>;
  clearCart: () => Promise<void>;
  totalItems: number;
  isCartOpen: boolean;
  setCartOpen: (open: boolean) => void;
  updateQuantity: (id: string, delta: number) => Promise<void>;
  refreshCart: () => Promise<void>;
  currentOwnerId: string | null;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const getOrCreateGuestOwnerId = () => {
  if (typeof window === "undefined") return null;

  const existing = window.localStorage.getItem(GUEST_STORAGE_KEY);
  if (existing) return existing;

  const next = `guest:${crypto.randomUUID()}`;
  window.localStorage.setItem(GUEST_STORAGE_KEY, next);
  return next;
};

const formatBackendCart = (backendData: any): CartItem[] => {
  if (!backendData || !Array.isArray(backendData.items)) return [];

  return backendData.items.map((item: any) => ({
    id: String(item.product_id),
    name: item.product?.name || "Unknown product",
    brand: item.product?.brand || "Generic",
    price: Number(item.product?.price || 0),
    quantity: Number(item.quantity || 0),
    image_url: item.product?.image_url || null,
  }));
};

export function CartProvider({ children }: { children: ReactNode }) {
  const { user, initialized } = useAuth();
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setCartOpen] = useState(false);
  const [guestOwnerId, setGuestOwnerId] = useState<string | null>(null);
  const mergedUserIdRef = useRef<number | null>(null);

  useEffect(() => {
    setGuestOwnerId(getOrCreateGuestOwnerId());
  }, []);

  const currentOwnerId = user ? String(user.id) : guestOwnerId;

  const loadCart = async (ownerId: string | null) => {
    if (!ownerId) {
      setCart([]);
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/cart/${encodeURIComponent(ownerId)}`);
      if (!response.ok) {
        setCart([]);
        return;
      }

      const data = await response.json();
      setCart(formatBackendCart(data));
    } catch {
      setCart([]);
    }
  };

  useEffect(() => {
    if (!initialized || !guestOwnerId) return;

    const syncCart = async () => {
      if (user) {
        if (mergedUserIdRef.current !== user.id) {
          try {
            await fetch(`${API_BASE_URL}/cart/merge`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                source_owner_id: guestOwnerId,
                target_owner_id: String(user.id),
              }),
            });
          } catch {
            // ignore merge failure; the fresh cart load below is still attempted
          }
          mergedUserIdRef.current = user.id;
        }

        await loadCart(String(user.id));
        return;
      }

      mergedUserIdRef.current = null;
      await loadCart(guestOwnerId);
    };

    syncCart();
  }, [guestOwnerId, initialized, user]);

  const refreshCart = async () => {
    await loadCart(currentOwnerId);
  };

  const addToCart = async (product: { id: string }) => {
    if (!currentOwnerId) return;

    try {
      const response = await fetch(`${API_BASE_URL}/cart`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: currentOwnerId,
          product_id: product.id,
          quantity: 1,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        alert(data.error || "Could not add item to cart.");
        return;
      }

      setCart(formatBackendCart(data.cart));
      setCartOpen(true);
    } catch {
      alert("Could not connect to the server.");
    }
  };

  const updateQuantity = async (id: string, delta: number) => {
    if (!currentOwnerId) return;

    const targetItem = cart.find((item) => item.id === id);
    if (!targetItem) return;

    const nextQuantity = targetItem.quantity + delta;
    if (nextQuantity <= 0) {
      await removeFromCart(id);
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/cart`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: currentOwnerId,
          product_id: id,
          quantity: nextQuantity,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        alert(data.error || "Could not update quantity.");
        return;
      }

      setCart(formatBackendCart(data.cart));
    } catch {
      alert("Could not connect to the server.");
    }
  };

  const removeFromCart = async (id: string) => {
    if (!currentOwnerId) return;

    try {
      const response = await fetch(
        `${API_BASE_URL}/cart/${encodeURIComponent(currentOwnerId)}/${encodeURIComponent(id)}`,
        { method: "DELETE" }
      );

      const data = await response.json();
      if (!response.ok) {
        alert(data.error || "Could not remove item from cart.");
        return;
      }

      setCart(formatBackendCart(data.cart));
    } catch {
      alert("Could not connect to the server.");
    }
  };

  const clearCart = async () => {
    if (!currentOwnerId) return;

    try {
      const response = await fetch(`${API_BASE_URL}/cart/${encodeURIComponent(currentOwnerId)}`, {
        method: "DELETE",
      });

      const data = await response.json();
      if (!response.ok) {
        alert(data.error || "Could not clear the cart.");
        return;
      }

      setCart(formatBackendCart(data.cart));
    } catch {
      alert("Could not connect to the server.");
    }
  };

  const totalItems = useMemo(
    () => cart.reduce((sum, item) => sum + item.quantity, 0),
    [cart]
  );

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        removeFromCart,
        clearCart,
        totalItems,
        isCartOpen,
        setCartOpen,
        updateQuantity,
        refreshCart,
        currentOwnerId,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}

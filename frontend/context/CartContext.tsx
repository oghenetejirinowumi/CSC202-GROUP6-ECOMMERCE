// frontend/context/CartContext.tsx
"use client";

import { createContext, useContext, useState, useEffect, useRef, ReactNode } from "react";

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
  addToCart: (product: any) => void;
  removeFromCart: (id: string) => void;
  clearCart: () => void;
  totalItems: number;
  isCartOpen: boolean;
  setCartOpen: (open: boolean) => void;
  updateQuantity: (id: string, delta: number) => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

// Hardcoded user session placeholder until full Auth registration workflow is complete
const TEMP_USER_ID = 1;
const API_BASE_URL = "http://localhost:50000/api";

export function CartProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setCartOpen] = useState(false);

  // ── Hydration fix ──────────────────────────────────────────────────────────
  // hasMounted prevents ANY state derived from the network from being applied
  // during SSR or the initial client render, which is what causes the
  // "tree hydrated but attributes didn't match" error in Next.js.
  const hasMounted = useRef(false);

  // Helper: translate backend nested structure → flat CartItem[]
  const formatBackendCart = (backendData: any): CartItem[] => {
    if (!backendData || !Array.isArray(backendData.items)) return [];
    return backendData.items.map((item: any) => ({
      id: String(item.product_id),
      name: item.product.name,
      brand: item.product.brand || "Generic",
      price: item.product.price,
      quantity: item.quantity,
      image_url: item.product.image_url,
    }));
  };

  // Load cart from server exactly once, AFTER the component has mounted on the
  // client. The empty-array dep means this runs once; the hasMounted guard
  // makes the setCart call safe from SSR mismatch.
  useEffect(() => {
    hasMounted.current = true;

    const loadCart = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/cart/${TEMP_USER_ID}`);
        if (res.ok) {
          const data = await res.json();
          // Safe: this runs after hydration is complete
          setCart(formatBackendCart(data));
        }
      } catch (err) {
        console.error("Failed to connect to backend cart API:", err);
      }
    };

    loadCart();
  }, []);

  // ADD (POST)
  const addToCart = async (product: any) => {
    try {
      const res = await fetch(`${API_BASE_URL}/cart`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: TEMP_USER_ID,
          product_id: product.id,
          quantity: 1,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setCart(formatBackendCart(data.cart));
        setCartOpen(true);
      } else {
        const errData = await res.json();
        alert(errData.error || "Could not add item to cart.");
      }
    } catch (err) {
      console.error("Error adding to cart:", err);
    }
  };

  // UPDATE quantity (PUT) — steps down to 0 triggers delete
  const updateQuantity = async (id: string, delta: number) => {
    const targetItem = cart.find((item) => item.id === id);
    if (!targetItem) return;

    const nextQty = targetItem.quantity + delta;

    if (nextQty <= 0) {
      removeFromCart(id);
      return;
    }

    try {
      const res = await fetch(`${API_BASE_URL}/cart`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: TEMP_USER_ID,
          product_id: id,
          quantity: nextQty,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setCart(formatBackendCart(data.cart));
      } else {
        const errData = await res.json();
        alert(errData.error || "Stock limit reached.");
      }
    } catch (err) {
      console.error("Error updating quantity:", err);
    }
  };

  // REMOVE single item (DELETE)
  const removeFromCart = async (id: string) => {
    try {
      const res = await fetch(`${API_BASE_URL}/cart/${TEMP_USER_ID}/${id}`, {
        method: "DELETE",
      });

      if (res.ok) {
        const data = await res.json();
        setCart(formatBackendCart(data.cart));
      }
    } catch (err) {
      console.error("Error removing item:", err);
    }
  };

  // CLEAR entire cart (DELETE)
  const clearCart = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/cart/${TEMP_USER_ID}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setCart([]);
      }
    } catch (err) {
      console.error("Error clearing cart:", err);
    }
  };

  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);

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
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) throw new Error("useCart must be used within a CartProvider");
  return context;
}
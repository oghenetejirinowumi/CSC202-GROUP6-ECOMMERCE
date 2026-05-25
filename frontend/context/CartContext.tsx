// frontend/context/CartContext.tsx
"use client";

import { createContext, useContext, useState, ReactNode } from "react";

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

export function CartProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>([]);
  // 🌟 ADD THIS STATE TO TRACK IF THE DRAWER IS VISIBLE
  const [isCartOpen, setCartOpen] = useState(false);

  const addToCart = (product: any) => {
    setCart((prevCart) => {
      const existing = prevCart.find((item) => item.id === product.id);
      if (existing) {
        return prevCart.map((item) =>
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [
        ...prevCart,
        {
          id: product.id,
          name: product.name,
          brand: product.brand || "",
          price: product.price,
          quantity: 1,
          image_url: product.image_url || null,
        },
      ];
    });

    // AUTOMATICALLY SLIDE OPEN THE CART WHEN AN ITEM IS ADDED
    setCartOpen(true);
  };

  const updateQuantity = (id: string, delta: number) => {
    setCart((prevCart) =>
      prevCart
        .map((item) => {
          if (item.id === id) {
            const newQty = item.quantity + delta;
            return newQty > 0 ? { ...item, quantity: newQty } : item;
          }
          return item;
        })
        // Optional engineering choice: if they press minus when qty is 1, it leaves it at 1. 
        // If you'd rather it completely delete the item when reaching 0, change "return newQty > 0" to filter out zeroes instead!

    );
  };

  const removeFromCart = (id: string) => {
    setCart((prevCart) => prevCart.filter((item) => item.id !== id));
  };

  const clearCart = () => setCart([]);

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
        updateQuantity // ◄ Add this line
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

  export function useCart() {
    const context = useContext(CartContext);
    if (!context) throw new Error("useCart must be used within a CartProvider");
    return context;
  };
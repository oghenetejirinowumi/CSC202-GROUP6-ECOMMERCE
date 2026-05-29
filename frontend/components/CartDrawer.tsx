"use client";

import Link from "next/link";
import { X, Minus, Plus, Trash2 } from "lucide-react";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";

export default function CartDrawer() {
  const { user } = useAuth();
  const {
    cart,
    loading,
    error,
    drawerOpen,
    setDrawerOpen,
    updateQuantity,
    removeFromCart,
  } = useCart();

  if (!drawerOpen) {
    return null;
  }

  return (
    <>
      <div
        className="fixed inset-0 bg-black/40 z-40"
        onClick={() => setDrawerOpen(false)}
      />
      <aside className="fixed top-0 right-0 h-full w-full max-w-md bg-white dark:bg-gray-950 shadow-2xl z-50 flex flex-col transition-colors">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200 dark:border-gray-800">
          <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">Your cart</h2>
          <button
            onClick={() => setDrawerOpen(false)}
            className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-900 dark:text-gray-100"
            aria-label="Close cart"
          >
            <X size={22} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
          {!user && (
            <div className="text-center space-y-3 py-8">
              <p className="text-gray-600 dark:text-gray-400">Sign in to view your cart.</p>
              <Link
                href="/login"
                className="inline-block px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg"
                onClick={() => setDrawerOpen(false)}
              >
                Sign in
              </Link>
            </div>
          )}

          {user && loading && (
            <p className="text-gray-600 dark:text-gray-400">Loading cart...</p>
          )}
          {user && error && (
            <p className="text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 rounded-lg px-3 py-2">
              {error}
            </p>
          )}

          {user && !loading && cart?.items.length === 0 && (
            <p className="text-gray-600 dark:text-gray-400 text-center py-8">
              Your cart is empty.
            </p>
          )}

          {user &&
            cart?.items.map((item) => (
              <div
                key={item.id}
                className="flex gap-3 border border-gray-200 dark:border-gray-700 rounded-lg p-3"
              >
                <img
                  src={item.product.image_url || "https://placehold.co/120x120"}
                  alt={item.product.name}
                  className="w-20 h-20 object-cover rounded-md bg-gray-100 dark:bg-gray-800"
                />
                <div className="flex-1 space-y-2">
                  <div className="flex justify-between gap-2">
                    <h3 className="font-medium text-gray-900 dark:text-gray-100 line-clamp-2">
                      {item.product.name}
                    </h3>
                    <button
                      onClick={() => removeFromCart(item.product_id)}
                      className="text-gray-400 hover:text-red-600 dark:hover:text-red-400"
                      aria-label="Remove item"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                  <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                    ${item.line_total.toFixed(2)}
                  </p>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() =>
                        updateQuantity(item.product_id, Math.max(1, item.quantity - 1))
                      }
                      className="p-1 border border-gray-300 dark:border-gray-600 rounded text-gray-900 dark:text-gray-100"
                      aria-label="Decrease quantity"
                    >
                      <Minus size={14} />
                    </button>
                    <span className="text-sm w-6 text-center text-gray-900 dark:text-gray-100">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() =>
                        updateQuantity(
                          item.product_id,
                          Math.min(item.product.stock, item.quantity + 1)
                        )
                      }
                      className="p-1 border border-gray-300 dark:border-gray-600 rounded text-gray-900 dark:text-gray-100"
                      aria-label="Increase quantity"
                    >
                      <Plus size={14} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
        </div>

        {user && cart && cart.items.length > 0 && (
          <div className="border-t border-gray-200 dark:border-gray-800 px-5 py-4 space-y-3">
            <div className="flex justify-between text-lg font-semibold text-gray-900 dark:text-gray-100">
              <span>Subtotal</span>
              <span>${cart.subtotal.toFixed(2)}</span>
            </div>
            <Link
              href="/checkout"
              onClick={() => setDrawerOpen(false)}
              className="block w-full text-center py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg"
            >
              Checkout
            </Link>
          </div>
        )}
      </aside>
    </>
  );
}

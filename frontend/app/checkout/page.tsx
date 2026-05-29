"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { useCart } from "../../context/CartContext";
import { apiFetch } from "../../lib/api";

export default function CheckoutPage() {
  const router = useRouter();
  const { user, token, loading: authLoading } = useAuth();
  const { cart, loading: cartLoading, refreshCart } = useCart();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
    }
  }, [authLoading, user, router]);

  const handleCheckout = async () => {
    if (!user || !token || !cart || cart.items.length === 0) {
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const items = cart.items.map((item) => ({
        product_id: item.product_id,
        quantity: item.quantity,
      }));

      const result = await apiFetch<{ orderId: number }>("/api/orders", {
        method: "POST",
        token,
        body: JSON.stringify({ user_id: user.id, items }),
      });

      await refreshCart();
      router.push(`/orders/${result.orderId}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Checkout failed");
    } finally {
      setSubmitting(false);
    }
  };

  if (authLoading || cartLoading) {
    return (
      <main className="max-w-3xl mx-auto px-4 py-16 text-gray-600 dark:text-gray-400">
        Loading checkout...
      </main>
    );
  }

  if (!user || !cart) {
    return null;
  }

  return (
    <main className="max-w-3xl mx-auto px-4 py-16 space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
          Checkout
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Review your order before placing it.
        </p>
      </div>

      <section className="border border-gray-200 dark:border-gray-700 rounded-xl divide-y divide-gray-200 dark:divide-gray-700">
        {cart.items.map((item) => (
          <div key={item.id} className="flex justify-between gap-4 p-4">
            <div>
              <p className="font-medium text-gray-900 dark:text-gray-100">
                {item.product.name}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Qty: {item.quantity}
              </p>
            </div>
            <p className="font-semibold text-gray-900 dark:text-gray-100">
              ${item.line_total.toFixed(2)}
            </p>
          </div>
        ))}
      </section>

      <div className="flex justify-between text-xl font-bold text-gray-900 dark:text-gray-100">
        <span>Total</span>
        <span>${cart.subtotal.toFixed(2)}</span>
      </div>

      {error && (
        <p className="text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 rounded-lg px-4 py-3">
          {error}
        </p>
      )}

      <div className="flex gap-3">
        <Link
          href="/"
          className="flex-1 text-center py-3 border border-gray-300 dark:border-gray-600 rounded-lg font-medium text-gray-900 dark:text-gray-100 hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors"
        >
          Continue shopping
        </Link>
        <button
          onClick={handleCheckout}
          disabled={submitting || cart.items.length === 0}
          className="flex-1 py-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white font-semibold rounded-lg"
        >
          {submitting ? "Placing order..." : "Place order"}
        </button>
      </div>
    </main>
  );
}

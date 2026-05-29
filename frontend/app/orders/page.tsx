"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { apiFetch } from "../../lib/api";
import type { OrderSummary } from "../../lib/types";

export default function OrdersPage() {
  const router = useRouter();
  const { user, token, loading: authLoading } = useAuth();
  const [orders, setOrders] = useState<OrderSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
    }
  }, [authLoading, user, router]);

  useEffect(() => {
    if (!user || !token) {
      return;
    }

    async function loadOrders() {
      setLoading(true);
      setError(null);

      try {
        const data = await apiFetch<{ orders: OrderSummary[] }>(
          `/api/users/${user!.id}/orders`,
          { token }
        );
        setOrders(data.orders);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load orders");
      } finally {
        setLoading(false);
      }
    }

    loadOrders();
  }, [user, token]);

  if (authLoading) {
    return (
      <main className="max-w-3xl mx-auto px-4 py-16 text-gray-600 dark:text-gray-400">
        Loading...
      </main>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <main className="max-w-3xl mx-auto px-4 py-16 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
          My orders
        </h1>
        <p className="text-gray-600 dark:text-gray-400">Track your past purchases.</p>
      </div>

      {loading && <p className="text-gray-600 dark:text-gray-400">Loading orders...</p>}
      {error && (
        <p className="text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 rounded-lg px-4 py-3">
          {error}
        </p>
      )}

      {!loading && !error && orders.length === 0 && (
        <p className="text-gray-600 dark:text-gray-400">
          You have not placed any orders yet.
        </p>
      )}

      <div className="space-y-3">
        {orders.map((order) => (
          <Link
            key={order.id}
            href={`/orders/${order.id}`}
            className="block border border-gray-200 dark:border-gray-700 rounded-xl p-4 hover:border-gray-400 dark:hover:border-gray-500 transition-colors bg-white dark:bg-gray-900"
          >
            <div className="flex justify-between items-start gap-4">
              <div>
                <p className="font-semibold text-gray-900 dark:text-gray-100">
                  Order #{order.id}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {new Date(order.date).toLocaleString()}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {order.item_count} items
                </p>
              </div>
              <p className="font-bold text-gray-900 dark:text-gray-100">
                ${order.total.toFixed(2)}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </main>
  );
}

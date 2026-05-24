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
    return <main className="max-w-3xl mx-auto px-4 py-16">Loading...</main>;
  }

  if (!user) {
    return null;
  }

  return (
    <main className="max-w-3xl mx-auto px-4 py-16 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">My orders</h1>
        <p className="text-gray-600">Track your past purchases.</p>
      </div>

      {loading && <p className="text-gray-600">Loading orders...</p>}
      {error && (
        <p className="text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-3">
          {error}
        </p>
      )}

      {!loading && !error && orders.length === 0 && (
        <p className="text-gray-600">You have not placed any orders yet.</p>
      )}

      <div className="space-y-3">
        {orders.map((order) => (
          <Link
            key={order.id}
            href={`/orders/${order.id}`}
            className="block border border-gray-200 rounded-xl p-4 hover:border-gray-400 transition-colors"
          >
            <div className="flex justify-between items-start gap-4">
              <div>
                <p className="font-semibold text-gray-900">Order #{order.id}</p>
                <p className="text-sm text-gray-500">
                  {new Date(order.date).toLocaleString()}
                </p>
                <p className="text-sm text-gray-500">{order.item_count} items</p>
              </div>
              <p className="font-bold text-gray-900">${order.total.toFixed(2)}</p>
            </div>
          </Link>
        ))}
      </div>
    </main>
  );
}

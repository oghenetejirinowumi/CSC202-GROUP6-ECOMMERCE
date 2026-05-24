"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useAuth } from "../../../context/AuthContext";
import { apiFetch } from "../../../lib/api";
import type { OrderDetail } from "../../../lib/types";

export default function OrderDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { user, token, loading: authLoading } = useAuth();
  const [orderDetail, setOrderDetail] = useState<OrderDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
    }
  }, [authLoading, user, router]);

  useEffect(() => {
    if (!user || !token || !params.id) {
      return;
    }

    async function loadOrder() {
      setLoading(true);
      setError(null);

      try {
        const data = await apiFetch<OrderDetail>(`/api/orders/${params.id}`, {
          token,
        });
        setOrderDetail(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load order");
      } finally {
        setLoading(false);
      }
    }

    loadOrder();
  }, [user, token, params.id]);

  if (authLoading || loading) {
    return <main className="max-w-3xl mx-auto px-4 py-16">Loading order...</main>;
  }

  if (!user) {
    return null;
  }

  if (error || !orderDetail) {
    return (
      <main className="max-w-3xl mx-auto px-4 py-16">
        <p className="text-red-600">{error || "Order not found"}</p>
        <Link href="/orders" className="text-blue-600 hover:underline mt-4 inline-block">
          Back to orders
        </Link>
      </main>
    );
  }

  const { order, items } = orderDetail;

  return (
    <main className="max-w-3xl mx-auto px-4 py-16 space-y-6">
      <div>
        <Link href="/orders" className="text-blue-600 hover:underline text-sm">
          Back to orders
        </Link>
        <h1 className="text-3xl font-bold text-gray-900 mt-2">Order #{order.id}</h1>
        <p className="text-gray-600">{new Date(order.date).toLocaleString()}</p>
      </div>

      <section className="border border-gray-200 rounded-xl divide-y divide-gray-200">
        {items.map((item) => (
          <div key={item.id} className="flex justify-between gap-4 p-4">
            <div>
              <p className="font-medium text-gray-900">{item.product_name}</p>
              <p className="text-sm text-gray-500">Qty: {item.quantity}</p>
            </div>
            <p className="font-semibold text-gray-900">
              ${(item.price_at_purchase * item.quantity).toFixed(2)}
            </p>
          </div>
        ))}
      </section>

      <div className="flex justify-between text-xl font-bold">
        <span>Total</span>
        <span>${order.total.toFixed(2)}</span>
      </div>
    </main>
  );
}

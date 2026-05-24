"use client";

import { useEffect, useState } from "react";
import { apiFetch } from "../lib/api";
import type { Product } from "../lib/types";
import ProductCard from "./ProductCard";

export default function FeaturedProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    async function loadProducts() {
      setLoading(true);
      setError(null);

      try {
        const data = await apiFetch<Product[]>("/api/products");
        if (active) {
          setProducts(data.slice(0, 12));
        }
      } catch (err) {
        if (active) {
          setError(err instanceof Error ? err.message : "Failed to load products");
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    loadProducts();
    return () => {
      active = false;
    };
  }, []);

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <h2 className="text-3xl sm:text-4xl font-bold text-center text-gray-900 mb-12">
        Featured Products
      </h2>

      {loading && (
        <p className="text-center text-gray-600">Loading products...</p>
      )}

      {error && (
        <p className="text-center text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-3 max-w-lg mx-auto">
          {error}
        </p>
      )}

      {!loading && !error && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </section>
  );
}

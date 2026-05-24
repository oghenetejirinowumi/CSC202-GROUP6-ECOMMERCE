"use client";

import { useState } from "react";
import Link from "next/link";
import type { Product } from "../lib/types";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";

type ProductCardProps = {
  product: Product;
};

export default function ProductCard({ product }: ProductCardProps) {
  const { user } = useAuth();
  const { addToCart } = useCart();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const handleAddToCart = async () => {
    if (!user) {
      setMessage("Sign in to add items");
      return;
    }

    setLoading(true);
    setMessage(null);

    try {
      await addToCart(product.id, 1);
      setMessage("Added to cart");
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Could not add item");
    } finally {
      setLoading(false);
    }
  };

  return (
    <article className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow">
      <div className="aspect-[4/3] bg-gray-100">
        <img
          src={product.image_url || "https://placehold.co/600x400"}
          alt={product.name}
          className="w-full h-full object-cover"
        />
      </div>
      <div className="p-4 space-y-3">
        <h3 className="font-semibold text-gray-900 line-clamp-2">{product.name}</h3>
        <p className="text-sm text-gray-600 line-clamp-2">{product.description}</p>
        <div className="flex items-center justify-between">
          <span className="text-lg font-bold text-gray-900">
            ${product.price.toFixed(2)}
          </span>
          <span className="text-xs text-gray-500">{product.stock} in stock</span>
        </div>
        <button
          onClick={handleAddToCart}
          disabled={loading || product.stock === 0}
          className="w-full py-2.5 bg-black hover:bg-gray-800 disabled:opacity-50 text-white text-sm font-medium rounded-lg transition-colors"
        >
          {product.stock === 0 ? "Out of stock" : loading ? "Adding..." : "Add to cart"}
        </button>
        {!user && (
          <p className="text-xs text-center text-gray-500">
            <Link href="/login" className="text-blue-600 hover:underline">
              Sign in
            </Link>{" "}
            to shop
          </p>
        )}
        {message && <p className="text-xs text-center text-gray-600">{message}</p>}
      </div>
    </article>
  );
}

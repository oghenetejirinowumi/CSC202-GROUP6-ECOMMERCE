"use client";

import Image from "next/image";
import { Star, ShoppingBag } from "lucide-react";
import { useCart } from "../../../context/CartContext";

const currencyFormat = new Intl.NumberFormat("en-NG", {
  style: "currency",
  currency: "NGN",
  maximumFractionDigits: 0,
});

export default function ProductDetailsClient({ product }: { product: any }) {
  const { addToCart } = useCart();

  let parsedSpecs: Record<string, string> = {};
  try {
    if (product.specs) {
      parsedSpecs = typeof product.specs === "string" ? JSON.parse(product.specs) : product.specs;
    }
  } catch (e) {
    console.error("Failed to parse specifications object JSON payload");
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-6 bg-white p-8 rounded-3xl shadow-sm border border-gray-100 grid grid-cols-1 md:grid-cols-2 gap-12">
        
        {/* Left Side: Product Image Visualizer */}
        <div className="relative aspect-square rounded-2xl overflow-hidden bg-gray-50 border border-gray-100">
          <Image
            src={product.image_url || "https://placehold.co/600x400/000000/FFFFFF?text=No+Image"}
            alt={product.name}
            fill
            className="object-cover"
            priority
          />
        </div>

        {/* Right Side: Product Details info data panel */}
        <div className="flex flex-col justify-between space-y-6">
          <div className="space-y-2">
            <p className="text-sm uppercase tracking-widest text-blue-600 font-bold">{product.brand}</p>
            <h1 className="text-3xl font-extrabold text-gray-900">{product.name}</h1>
            
            <div className="flex items-center gap-2 pt-2">
              <div className="flex bg-yellow-50 text-yellow-600 px-2 py-1 rounded-lg text-sm font-semibold items-center gap-1">
                <Star size={16} className="fill-yellow-500 text-yellow-500" />
                {Number(product.rating || 0).toFixed(1)}
              </div>
              <span className="text-md text-gray-400">({product.reviewCount} user reviews)</span>
            </div>
          </div>

          <div className="border-t border-b py-4">
            <div className="flex items-baseline gap-3">
              {product.originalPrice && product.originalPrice > product.price && (
                <span className="text-2xl text-gray-400 line-through">
                  {currencyFormat.format(product.originalPrice)}
                </span>
              )}
              <span className="text-3xl font-black text-gray-900">
                {currencyFormat.format(product.price)}
              </span>
            </div>
          </div>

          <p className="text-xl text-gray-600 leading-relaxed">{product.description}</p>

          {/* Specifications Grid blocks */}
          {Object.keys(parsedSpecs).length > 0 && (
            <div className="bg-gray-50 p-0 rounded-xl space-y-2 text-sm">
              <h3 className="font-bold text-gray-700">Specifications:</h3>
              <div className="grid grid-cols-2 gap-2">
                {Object.entries(parsedSpecs).map(([key, value]) => (
                  <div key={key} className="text-gray-600">
                    <span className="font-semibold text-gray-900">{key}:</span> {value}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Action Call buttons */}
          <div className="pt-4 flex flex-col sm:flex-row gap-4">
            <button
              onClick={() => addToCart(product)}
              className="flex-1 bg-black text-white py-4 rounded-xl hover:bg-gray-800 transition-colors flex items-center justify-center gap-2 font-bold shadow-lg shadow-black/10"
            >
              <ShoppingBag size={20} />
              Add to Cart
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
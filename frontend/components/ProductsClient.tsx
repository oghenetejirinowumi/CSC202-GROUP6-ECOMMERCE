"use client";
 
import Image from "next/image";
import { Star } from "lucide-react";
import { useMemo, useState } from "react";
import Link from "next/link";
 
type Product = {
  id: string;
  name: string;
  brand: string;
  category: string;
  subCategory: string;
  price: number;
  originalPrice: number | null;
  rating: number;
  reviewCount: number;
  image_url: string | null;
};
 
const currencyFormat = new Intl.NumberFormat("en-NG", {
  style: "currency",
  currency: "NGN",
  maximumFractionDigits: 0,
});
 
function ProductCard({ product }: { product: Product }) {
  const hasOriginalPrice =
    typeof product.originalPrice === "number" &&
    product.originalPrice > product.price;
 
  return (
    <Link href={`/products/${product.id}`} className="block h-full">
      <article className="group overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-black/10">
        <div className="relative aspect-4/3 overflow-hidden bg-black">
          <Image
            src={
              product.image_url ||
              "https://placehold.co/600x400/000000/FFFFFF?text=No+Image"
            }
            alt={product.name}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            unoptimized
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/45 via-transparent to-transparent opacity-80 transition-opacity group-hover:opacity-60" />
          <div className="absolute left-4 top-4 rounded-full bg-white/90 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-gray-800 backdrop-blur">
            {product.subCategory}
          </div>
        </div>
  
        <div className="space-y-3 p-5">
          <div className="space-y-1">
            <p className="text-sm font-medium uppercase tracking-[0.18em] text-gray-500">
              {product.brand}
            </p>
            <h3 className="text-lg font-semibold leading-snug text-gray-900">
              {product.name}
            </h3>
          </div>
  
          <div className="flex items-center gap-2 rounded-2xl bg-gray-50 px-3 py-2 transition-transform duration-500 group-hover:bg-gray-100 group-hover:scale-110">
            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400 transition-transform group-hover:scale-110" />
            <span className="text-sm font-semibold text-gray-900">
              {product.rating.toFixed(1)}
            </span>
            <span className="text-sm text-gray-500">
              ({product.reviewCount} reviews)
            </span>
          </div>
  
          <div className="flex items-end gap-3">
            <span className="text-2xl font-bold text-gray-900">
              {currencyFormat.format(product.price)}
            </span>
            {hasOriginalPrice && (
              <span className="pb-1 text-sm text-gray-400 line-through">
                {currencyFormat.format(product.originalPrice ?? product.price)}
              </span>
            )}
          </div>
        </div>
      </article>
    </Link>
  );
}
 
export default function ProductsClient({
  initialProducts,
  title,
}: {
  initialProducts: Product[];
  title?: string;
}) {
  const [query, setQuery] = useState("");
  const [brandFilter, setBrandFilter] = useState<string | null>(null);
  const [subCatFilter, setSubCatFilter] = useState<string | null>(null);
  const [sortAsc, setSortAsc] = useState(true);
 
// 1. Gather brands safely
  const brands = useMemo(() => {
    const s = new Set<string>();
    for (const p of initialProducts) if (p.brand) s.add(p.brand);
    return Array.from(s).sort((a, b) => a.localeCompare(b));
  }, [initialProducts]);

  // 2. Look for both 'subCategory' AND 'subcategory' defensively
  const subCategories = useMemo(() => {
    const s = new Set<string>();
    for (const p of initialProducts) {
      const sub = p.subCategory || (p as any).subcategory;
      if (sub) s.add(sub);
    }
    return Array.from(s).sort((a, b) => a.localeCompare(b));
  }, [initialProducts]);

  // Only show the subCategory filter when viewing a top-level category
  const showSubCatFilter = subCategories.length > 1;

  // 3. Update the filter loop to use the fallback property safely
  const filtered = useMemo(() => {
    let list = initialProducts.slice();

    if (brandFilter) list = list.filter((p) => p.brand === brandFilter);
    
    if (subCatFilter) {
      list = list.filter((p) => {
        const sub = p.subCategory || (p as any).subcategory;
        return sub === subCatFilter;
      });
    }

    if (query.trim()) {
      const q = query.trim().toLowerCase();
      list = list.filter((p) => {
        const sub = p.subCategory || (p as any).subcategory || "";
        return (
          (p.name?.toLowerCase().includes(q) || false) ||
          (p.brand?.toLowerCase().includes(q) || false) ||
          sub.toLowerCase().includes(q)
        );
      });
    }

    list.sort((a, b) =>
      sortAsc ? a.name.localeCompare(b.name) : b.name.localeCompare(a.name)
    );

    return list;
  }, [initialProducts, brandFilter, subCatFilter, query, sortAsc]);
 
  return (
    <section className="min-h-screen bg-linear-to-b from-white via-gray-50 to-white py-16 sm:py-24">
      <div className="mx-auto max-w-7xl px-6 sm:px-8 lg:px-12">
 
        {/* PAGE HEADER */}
        <div className="mb-10 sm:mb-12">
          <p className="text-sm font-semibold uppercase tracking-[0.25em] text-gray-400 mb-1">
            Browse
          </p>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-gray-900">
            {title ?? "Products"}
          </h1>
        </div>
 
        {/* FILTER BAR */}
        <div className="mb-10 rounded-2xl border border-gray-200 bg-white px-5 py-4 shadow-sm">
          <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
 
            {/* Search — grows to fill space */}
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by name, brand or subcategory…"
              className="flex-1 min-w-0 sm:min-w-[260px] rounded-full px-5 py-2.5 border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-gray-300"
            />
 
            {/* Subcategory filter — only shown on top-level pages */}
            {showSubCatFilter && (
              <select
                value={subCatFilter ?? ""}
                onChange={(e) => setSubCatFilter(e.target.value || null)}
                className="rounded-full px-4 py-2.5 border border-gray-200 bg-white text-sm shrink-0"
              >
                <option value="">All subcategories</option>
                {subCategories.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            )}
 
            {/* Brand filter */}
            <select
              value={brandFilter ?? ""}
              onChange={(e) => setBrandFilter(e.target.value || null)}
              className="rounded-full px-4 py-2.5 border border-gray-200 bg-white text-sm shrink-0"
            >
              <option value="">All brands</option>
              {brands.map((b) => (
                <option key={b} value={b}>
                  {b}
                </option>
              ))}
            </select>
 
            {/* Sort toggle */}
            <button
              onClick={() => setSortAsc((s) => !s)}
              className="rounded-full px-5 py-2.5 border border-gray-200 bg-white text-sm font-medium shrink-0 hover:bg-gray-50 transition-colors"
            >
              {sortAsc ? "A → Z" : "Z → A"}
            </button>
 
            {/* Result count — pushed to end */}
            <span className="text-sm text-gray-400 sm:ml-auto shrink-0">
              {filtered.length} {filtered.length === 1 ? "item" : "items"}
            </span>
          </div>
        </div>
 
        {/* GRID */}
        {filtered.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-gray-300 bg-white p-16 text-center text-gray-500">
            No products match your filters.
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filtered.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
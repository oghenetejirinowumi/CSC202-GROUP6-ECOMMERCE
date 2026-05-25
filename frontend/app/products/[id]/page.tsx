import { notFound } from "next/navigation";
import ProductDetailsClient from "./ProductDetailsClient";

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
  description: string;
  image_url: string | null;
  specs: string | null;
};

async function getProduct(id: string): Promise<Product | null> {
  try {
    // Queries the full list endpoint and searches for target id match
    const res = await fetch("http://localhost:50000/api/products", { cache: "no-store" });
    if (!res.ok) return null;
    const products: Product[] = await res.json();
    return products.find((p) => p.id === id) || null;
  } catch {
    return null;
  }
}

export default async function ProductPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const product = await getProduct(resolvedParams.id);

  if (!product) {
    notFound();
  }

  return <ProductDetailsClient product={product} />;
}
import ProductsClient from "@/components/ProductsClient";

type Product = {
  id: string;
  name: string;
  brand: string;
  category: string;
  subCategory: string; // Ensure this matches the exact key case returned by your Express API
  price: number;
  originalPrice: number | null;
  rating: number;
  reviewCount: number;
  image_url: string | null;
};


const TOP_LEVEL_CATEGORIES_LOWER = new Set([
  "mobile & wearables",
  "computing & gaming",
  "home entertainment",
  "smart home & photography",
  "miscellaneous",
]);

async function getProducts(): Promise<Product[]> {
  try {
    const res = await fetch("http://localhost:50000/api/products", {
      cache: "no-store",
    });
    if (!res.ok) return [];
    return res.json();
  } catch {
    return [];
  }
}

// app/categories/[category]/page.tsx

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ category: string }>; 
}) {

  const resolvedParams = await params;
  const decoded = decodeURIComponent(resolvedParams.category || "");
  
  const products = await getProducts();
  const decodedLower = decoded.toLowerCase();

  // Keep a lowercase reference for easy, case-insensitive comparison matches
  const TOP_LEVEL_CATEGORIES_LOWER = new Set([
    "mobile & wearables",
    "computing & gaming",
    "home entertainment",
    "smart home & photography",
    "miscellaneous",
  ]);

  const isTopLevel = TOP_LEVEL_CATEGORIES_LOWER.has(decodedLower);

  const filtered = products.filter((p) => {
    if (isTopLevel) {
      return p.category && p.category.toLowerCase() === decodedLower;
    } else {
      // Handles both camelCase and lowercase API configurations defensively
      const productSubcat = p.subCategory || (p as any).subcategory;
      return productSubcat && productSubcat.toLowerCase() === decodedLower;
    }
  });

  return <ProductsClient initialProducts={filtered} title={decoded} />;
}

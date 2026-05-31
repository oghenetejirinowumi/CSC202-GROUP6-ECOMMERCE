import ProductsClient from "./ProductsClient";

/* TYPE DEFINITION -
    Tells Typescript what fields to expect from the API response.
*/
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

async function getProducts(): Promise<Product[]> {
  try {
    const response = await fetch("http://localhost:50000/api/products", {
      cache: "no-store",
    });

    if (!response.ok) {
      return [];
    }

    return response.json();
  } catch {
    return [];
  }
}
export default async function ProductDisplay({
  initialQuery = "",
}: {
  initialQuery?: string;
}) {
  const products = await getProducts();

  return (
    <ProductsClient
      initialProducts={products}
      title={initialQuery.trim() ? undefined : "All Products"}
      initialQuery={initialQuery}
    />
  );
}

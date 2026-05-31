import Hero from "../components/Hero";
import ProductDisplay from "../components/ProductDisplay";

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ search?: string }>;
}) {
  const resolvedSearchParams = await searchParams;
  const search = resolvedSearchParams.search?.trim() || "";

  return (
    <>
      <Hero />
      <ProductDisplay initialQuery={search} />
    </>
  );
}

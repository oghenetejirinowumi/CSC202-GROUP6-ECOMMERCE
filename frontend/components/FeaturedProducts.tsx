import ProductCard from "./ProductCard";

const sampleProducts = [
  {id:1,name: "Wireless Headphones", price: 9900.99, image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&q=80" },
  {id:2,name: "Smart Watch", price: 24900.99, image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500&q=80" },
  {id:3,name: "Laptop Pro", price: 129900.99, image: "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=500&q=80" },
  {id:4,name: "Wireless Mouse", price: 4900.99, image: "https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=500&q=80" },
  {id:5, name: "Gaming Keyboard", price: 12900, image: "https://images.unsplash.com/photo-1541140532154-b024d705b90a?w=500&q=80" },
  {id:6,name: "USB-C Hub", price: 5900.99, image: "https://images.unsplash.com/photo-1625723044792-44de16ccb4e9?w=500&q=80" },
  {id:7,name: "Mechanical Keyboard", price: 14900.99, image: "https://images.unsplash.com/photo-1595225476474-87563907a212?w=500&q=80" },
  {id:8,name: "Webcam HD", price: 8900.99, image: "https://images.unsplash.com/photo-1584464491033-06628f3a6b7b?w=500&q=80" },
  {id:9,name: " tablet Stand", price: 2900.99, image: "https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=500&q=80" },
  {id:10,name: "Wireless Earbuds", price: 79000.99, image: "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=500&q=80" },
  {id:11,name: "Monitor Light", price: 3900.99, image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=500&q=80" },
  {id:12,name: "Desk Mat", price: 19000.99, image: "https://images.unsplash.com/photo-1590602847861-f357a9332bbc?w=500&q=80" },
];

const FeaturedProducts = () => {
  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <h2 className="text-3xl sm:text-4xl font-bold text-center text-gray-900 mb-12">
        Featured Products
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {sampleProducts.map((product) => (
          <ProductCard
           key={product.id}
           {...product}
          />
        ))}
      </div>
    </section>
  );
};

export default FeaturedProducts;

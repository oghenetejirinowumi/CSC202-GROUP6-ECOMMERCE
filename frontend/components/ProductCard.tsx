interface ProductCardProps {
  key: number;
  name: string;
  price: number;
  image: string;
}

const ProductCard = ({key,name, price, image }: ProductCardProps) => {
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden transition-transform duration-200 hover:scale-105">
      <div className="relative w-full h-48 overflow-hidden bg-gray-100">
        <img
          src={image}
          alt={name}
          className="w-full h-full object-cover"
        />
      </div>
      <div className="p-4">
        <h3 className="text-lg font-semibold text-gray-800 truncate">
          {name}
        </h3>
        <p className="text-xl font-bold text-gray-900 mt-2">
          N{price.toFixed(2)}
        </p>
      </div>
    </div>
  );
};

export default ProductCard;

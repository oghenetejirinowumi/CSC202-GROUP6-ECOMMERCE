"use client";

import Link from "next/link";
import Image from "next/image";
import { X, ShoppingCart, Trash2, Plus, Minus } from "lucide-react";
import { useCart } from "../context/CartContext";

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

const currencyFormat = new Intl.NumberFormat("en-NG", {
  style: "currency",
  currency: "NGN",
  maximumFractionDigits: 0,
});

const CartDrawer = ({ isOpen, onClose }: CartDrawerProps) => {
  const { cart, removeFromCart, totalItems, updateQuantity } = useCart();

  const totalPrice = cart.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0,
  );

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 transition-opacity"
          onClick={onClose}
        />
      )}

      <div
        className={`fixed top-0 right-0 h-full w-96 bg-white z-50 shadow-2xl transform transition-transform duration-300 flex flex-col ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between p-5 border-b border-gray-100">
          <h2 className="text-xl font-bold text-gray-900">
            Your Cart ({totalItems})
          </h2>
          <button
            onClick={onClose}
            className="hover:bg-gray-100 p-2 rounded-full transition-colors"
          >
            <X size={20} className="text-gray-500" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {cart.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-gray-400">
              <ShoppingCart size={48} className="stroke-1 text-gray-300" />
              <p className="mt-4 text-sm font-medium">Your cart is empty</p>
            </div>
          ) : (
            <ul className="space-y-4 divide-y divide-gray-100">
              {cart.map((item, index) => (
                <li
                  key={item.id}
                  className={`flex gap-4 items-center ${index > 0 ? "pt-4" : ""}`}
                >
                  <div className="relative w-20 h-20 bg-gray-50 rounded-xl overflow-hidden border border-gray-100 shrink-0">
                    <Image
                      src={
                        item.image_url ||
                        "https://placehold.co/600x400/000000/FFFFFF?text=No+Image"
                      }
                      alt={item.name}
                      fill
                      className="object-cover"
                      unoptimized
                    />
                  </div>

                  <div className="flex-1 min-w-0 space-y-1.5">
                    <h4 className="text-sm font-bold text-gray-900 truncate leading-tight">
                      {item.name}
                    </h4>
                    <p className="text-xs font-semibold tracking-wider text-gray-400 uppercase">
                      Brand: {item.brand}
                    </p>

                    <div className="flex items-center justify-between pt-0.5">
                      <div className="flex items-center border border-gray-200 rounded-lg bg-gray-50 overflow-hidden h-7">
                        <button
                          onClick={() => updateQuantity(item.id, -1)}
                          className="px-2 h-full hover:bg-gray-200 text-gray-600 transition-colors flex items-center justify-center"
                        >
                          <Minus size={12} strokeWidth={3} />
                        </button>
                        <span className="px-2 text-xs font-bold text-gray-800 select-none min-w-6 text-center">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.id, 1)}
                          className="px-2 h-full hover:bg-gray-200 text-gray-600 transition-colors flex items-center justify-center"
                        >
                          <Plus size={12} strokeWidth={3} />
                        </button>
                      </div>

                      <span className="text-sm font-extrabold text-gray-900">
                        {currencyFormat.format(item.price * item.quantity)}
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => removeFromCart(item.id)}
                    className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors shrink-0"
                  >
                    <Trash2 size={16} />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="p-5 border-t border-gray-100 bg-gray-50">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm font-semibold text-gray-500">
              Subtotal:
            </span>
            <span className="text-2xl font-black text-gray-900">
              {currencyFormat.format(totalPrice)}
            </span>
          </div>
          <Link
            href="/checkout"
            onClick={onClose}
            className="w-full block text-center bg-black text-white py-4 rounded-xl hover:bg-gray-800 transition-colors font-bold shadow-lg shadow-black/5"
          >
            Proceed to Checkout
          </Link>
        </div>
      </div>
    </>
  );
};

export default CartDrawer;

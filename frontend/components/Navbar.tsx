"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu, Search, ShoppingCart, User } from "lucide-react";
import MenuDrawer from "./Menu";
import CartDrawer from "./CartDrawer";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";

const Navbar = () => {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const { totalItems } = useCart();
  const { user } = useAuth();

  return (
    <>
      <MenuDrawer isOpen={drawerOpen} onClose={() => setDrawerOpen(false)} />
      <CartDrawer isOpen={cartOpen} onClose={() => setCartOpen(false)} />

      <nav className="w-full h-25 bg-white border-b border-gray-200 shadow-lg px-6 flex items-center justify-between sticky top-0 z-30">
        <div className="flex items-center gap-7">
          <button
            onClick={() => setDrawerOpen(true)}
            className="p-2 rounded-full hover:bg-gray-100 transition-colors"
          >
            <Menu size={30} className="text-gray-800" />
          </button>
          <Link
            href="/"
            className="cursor-pointer hover:opacity-80 transition-opacity"
          >
            <span className="text-5xl font-bold tracking-tight text-black">
              Teckvora
            </span>
          </Link>
        </div>

        <div className="flex-1 max-w-xl mx-10">
          <div className="flex items-center w-full h-15 bg-gray-100 rounded-full px-4 border border-gray-200 focus-within:border-gray-400 focus-within:bg-white focus-within:ring-2 focus-within:ring-gray-200 transition-all">
            <Search size={25} className="text-gray-400 mr-2 shrink-0" />
            <input
              type="text"
              placeholder="Search products..."
              className="bg-transparent border-none outline-none text-lg w-full text-gray-800 placeholder:text-gray-400"
            />
          </div>
        </div>

        <div className="flex items-center gap-6">
          <button
            onClick={() => setCartOpen(true)}
            className="flex flex-col items-center gap-0 cursor-pointer group"
          >
            <div className="relative p-2 rounded-full group-hover:bg-gray-100 transition-colors">
              <ShoppingCart size={30} className="text-gray-800" />
              {totalItems > 0 && (
                <div className="absolute -top-0.5 -right-0.5 bg-black text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center animate-pulse">
                  {totalItems}
                </div>
              )}
            </div>
            <span className="text-lg tracking-tight text-black">Cart</span>
          </button>

          <Link
            href="/profile"
            className="flex flex-col items-center gap-0 cursor-pointer text-black hover:text-gray-600 transition-colors group"
          >
            <div className="relative p-2 rounded-full hover:bg-gray-100 transition-colors">
              <User size={30} className="text-gray-800" />
            </div>
            <span className="text-lg tracking-tight text-black">
              {user ? user.firstName || user.username : "Sign In"}
            </span>
          </Link>
        </div>
      </nav>
    </>
  );
};

export default Navbar;

"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { LogOut, Menu, Search, ShoppingCart, User } from "lucide-react";
import MenuDrawer from "./Menu";
import CartDrawer from "./CartDrawer";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";

const Navbar = () => {
  const router = useRouter();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const { user, logout } = useAuth();
  const { cart, setDrawerOpen: setCartOpen } = useCart();
  const cartCount = cart?.item_count ?? 0;

  const handleLogout = async () => {
    setLoggingOut(true);
    try {
      await logout();
      router.push("/login");
    } finally {
      setLoggingOut(false);
    }
  };

  return (
    <>
      <MenuDrawer isOpen={drawerOpen} onClose={() => setDrawerOpen(false)} />
      <CartDrawer />

      <nav className="w-full h-25 bg-white border-b border-gray-200 shadow-lg px-6 flex items-center justify-between sticky top-0 z-30">
        <div className="flex items-center gap-7">
          <button
            onClick={() => setDrawerOpen(true)}
            className="p-2 rounded-full hover:bg-gray-100 transition-colors"
          >
            <Menu size={30} className="text-gray-800" />
          </button>
          <Link href="/" className="text-5xl font-bold tracking-tight text-black">
            Teckvora
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
            className="flex flex-col items-center gap-0"
          >
            <div className="relative p-2 rounded-full hover:bg-gray-100 transition-colors">
              <ShoppingCart size={30} className="text-gray-800" />
              {cartCount > 0 && (
                <div className="absolute -top-0.5 -right-0.5 bg-black text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center p-2">
                  {cartCount}
                </div>
              )}
            </div>
            <span className="text-lg tracking-tight text-black">Cart</span>
          </button>

          {user ? (
            <div className="flex items-center gap-4">
              <Link
                href="/orders"
                className="text-sm text-gray-700 hover:text-black"
              >
                Orders
              </Link>

              <div className="flex flex-col items-center gap-0">
                <div className="p-2 rounded-full">
                  <User size={30} className="text-gray-800" />
                </div>
                <span className="text-lg tracking-tight text-black max-w-24 truncate">
                  {user.username}
                </span>
              </div>

              <button
                onClick={handleLogout}
                disabled={loggingOut}
                className="flex flex-col items-center gap-0 disabled:opacity-60"
                aria-label="Log out"
              >
                <div className="p-2 rounded-full hover:bg-gray-100 transition-colors">
                  <LogOut size={26} className="text-gray-800" />
                </div>
                <span className="text-lg tracking-tight text-black">
                  {loggingOut ? "..." : "Log out"}
                </span>
              </button>
            </div>
          ) : (
            <Link href="/login" className="flex flex-col items-center gap-0">
              <div className="p-2 rounded-full hover:bg-gray-100 transition-colors">
                <User size={30} className="text-gray-800" />
              </div>
              <span className="text-lg tracking-tight text-black">Sign in</span>
            </Link>
          )}
        </div>
      </nav>
    </>
  );
};

export default Navbar;

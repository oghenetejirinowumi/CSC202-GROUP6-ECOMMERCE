"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  ClipboardList,
  LogOut,
  Menu,
  Moon,
  Search,
  ShoppingCart,
  Sun,
  User,
} from "lucide-react";
import MenuDrawer from "./Menu";
import CartDrawer from "./CartDrawer";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import { useTheme } from "../context/ThemeContext";

const Navbar = () => {
  const router = useRouter();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const { user, logout } = useAuth();
  const { cart, setDrawerOpen: setCartOpen } = useCart();
  const { theme, toggleTheme } = useTheme();
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

      <nav className="w-full h-25 bg-white dark:bg-gray-950 border-b border-gray-200 dark:border-gray-800 shadow-lg px-6 flex items-center justify-between sticky top-0 z-30 transition-colors">
        <div className="flex items-center gap-7">
          <button
            onClick={() => setDrawerOpen(true)}
            className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            <Menu size={30} className="text-gray-800 dark:text-gray-200" />
          </button>
          <Link
            href="/"
            className="text-5xl font-bold tracking-tight text-black dark:text-white"
          >
            Teckvora
          </Link>
        </div>

        <div className="flex-1 max-w-xl mx-10">
          <div className="flex items-center w-full h-15 bg-gray-100 dark:bg-gray-900 rounded-full px-4 border border-gray-200 dark:border-gray-700 focus-within:border-gray-400 dark:focus-within:border-gray-500 focus-within:bg-white dark:focus-within:bg-gray-800 focus-within:ring-2 focus-within:ring-gray-200 dark:focus-within:ring-gray-700 transition-all">
            <Search size={25} className="text-gray-400 dark:text-gray-500 mr-2 shrink-0" />
            <input
              type="text"
              placeholder="Search products..."
              className="bg-transparent border-none outline-none text-lg w-full text-gray-800 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500"
            />
          </div>
        </div>

        <div className="flex items-center gap-6">
          <button
            onClick={toggleTheme}
            className="flex flex-col items-center gap-0"
            aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
          >
            <div className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
              {theme === "dark" ? (
                <Sun size={28} className="text-gray-800 dark:text-gray-200" />
              ) : (
                <Moon size={28} className="text-gray-800 dark:text-gray-200" />
              )}
            </div>
            <span className="text-lg tracking-tight text-black dark:text-white">
              {theme === "dark" ? "Light" : "Dark"}
            </span>
          </button>

          <button
            onClick={() => setCartOpen(true)}
            className="flex flex-col items-center gap-0"
          >
            <div className="relative p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
              <ShoppingCart size={30} className="text-gray-800 dark:text-gray-200" />
              {cartCount > 0 && (
                <div className="absolute -top-0.5 -right-0.5 bg-black dark:bg-white text-white dark:text-black text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center p-2">
                  {cartCount}
                </div>
              )}
            </div>
            <span className="text-lg tracking-tight text-black dark:text-white">Cart</span>
          </button>

          <Link
            href={user ? "/orders" : "/login"}
            className="flex flex-col items-center gap-0"
          >
            <div className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
              <ClipboardList size={30} className="text-gray-800 dark:text-gray-200" />
            </div>
            <span className="text-lg tracking-tight text-black dark:text-white">Orders</span>
          </Link>

          {user ? (
            <div className="flex items-center gap-6">
              <div className="flex flex-col items-center gap-0">
                <div className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                  <User size={30} className="text-gray-800 dark:text-gray-200" />
                </div>
                <span className="text-lg tracking-tight text-black dark:text-white max-w-24 truncate">
                  {user.username}
                </span>
              </div>

              <button
                onClick={handleLogout}
                disabled={loggingOut}
                className="flex flex-col items-center gap-0 disabled:opacity-60"
                aria-label="Log out"
              >
                <div className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                  <LogOut size={26} className="text-gray-800 dark:text-gray-200" />
                </div>
                <span className="text-lg tracking-tight text-black dark:text-white">
                  {loggingOut ? "..." : "Log out"}
                </span>
              </button>
            </div>
          ) : (
            <Link href="/login" className="flex flex-col items-center gap-0">
              <div className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                <User size={30} className="text-gray-800 dark:text-gray-200" />
              </div>
              <span className="text-lg tracking-tight text-black dark:text-white">Sign in</span>
            </Link>
          )}
        </div>
      </nav>
    </>
  );
};

export default Navbar;

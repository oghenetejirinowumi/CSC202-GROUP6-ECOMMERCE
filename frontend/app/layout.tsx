'use client';

import { usePathname } from 'next/navigation';
import Navbar from '@/components/Navbar';
import { CartProvider } from '@/context/CartContext';
import './globals.css';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  
  // Hide navbar on login and signup pages
  const hideNavbar = pathname === '/login' || pathname === '/signup';

  return (
    <html lang="en">
      <body>
        <CartProvider>
          {!hideNavbar && <Navbar />}
          {children}
        </CartProvider>
      </body>
    </html>
  );
}
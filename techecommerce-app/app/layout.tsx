import "./globals.css";

import "./globals.css";
import Navbar from "./components/Navbar"; 

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <Navbar /> {/* 2. Place it above the children */}
        {children}
      </body>
    </html>
  );
}

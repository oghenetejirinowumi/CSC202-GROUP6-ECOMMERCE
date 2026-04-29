import { Roboto } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";

const roboto = Roboto({ weight: ["400", "700"], subsets: ["latin"] });

export const metadata = {
  title: "Next.js course",
  description: "Code with Sloba Next.js Course",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={roboto.className}>
        <Navbar />
        <main className= "py-20 max-w-6xl mx-auto" >{children}</main>
      </body>
    </html>
  );
}
import "./globals.css";
import Navbar from "../components/Navbar"; // Ensure this path is correct

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html suppressHydrationWarning lang="en">
      <body className="bg-white antialiased">
        <Navbar />
        {/* Everything from page.tsx goes inside {children} */}
        {children}
      </body>
    </html>
  );
}
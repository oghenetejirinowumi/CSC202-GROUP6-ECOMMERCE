import "./globals.css";
import Navbar from "../components/Navbar";
import Providers from "../components/Providers";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem('teckvora_theme');if(t==='dark'||(!t&&window.matchMedia('(prefers-color-scheme: dark)').matches)){document.documentElement.classList.add('dark')}}catch(e){}})();`,
          }}
        />
      </head>
      <body className="antialiased">
        <Providers>
          <Navbar />
          {children}
        </Providers>
      </body>
    </html>
  );
}

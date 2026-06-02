"use client";
 
import Image from "next/image";
import { Star } from "lucide-react";
import { useMemo, useState } from "react";
import Link from "next/link";
 
type Product = {
  id: string;
  name: string;
  brand: string;
  category: string;
  subCategory: string;
  price: number;
  originalPrice: number | null;
  rating: number;
  reviewCount: number;
  image_url: string | null;
};
 
const currencyFormat = new Intl.NumberFormat("en-NG", {
  style: "currency",
  currency: "NGN",
  maximumFractionDigits: 0,
});

const imageMap: { [key: string]: string } = {
  "PRD-001": "Iphone 15 pro max_ $1199.webp",
  "PRD-002": "Apple iPhone 15 (128 GB) - Pink.jpg",
  "PRD-003": "iPhone 14 128GB Roxo_LACRAD0 - 1 ano de garantia Apple.webp",
  "PRD-004": "Samsung Galaxy S24 Ultra 5G Dual SIM Smartphone - 12GB+256GB - Titanium Black 2 Year Warranty [SM-S928BZKCXNZ 1].jpg",
  "PRD-005": "Samsung Galaxy S24 Plus 5G AI Smartphone (Onyx Black, 12GB, 256GB Storage).jpg",
  "PRD-006": "Amazon_com_ Google Pixel 8 Pro - Unlocked Android….webp",
  "PRD-007": "Google Pixel 8a 128GB - Schwarz - Ohne Vertrag.jpg",
  "PRD-008": "OnePlus 12,16GB RAM+512GB,Dual-SIM,Unlocked Android Smartphone.jpg",
  "PRD-009": "XIAOMI - Xiaomi 14 Ultra 16GB + 512GB móvil libre.jpg",
  "PRD-010": "Lilbits_ Winamp is going open source, Sony Xperia 1 VI launched, Hackbat is like a DIY Flipper Zero, and AAEON Nezha is an Intel N97 single-board PC - Liliputing.jpg",
  "PRD-011": "Apple iPad Pro 13-inch M4 3D Max.jpg",
  "PRD-012": "Máy tính bảng Apple iPad Air 11 inch M4 Wi-Fi - Hàng Chính Hãng ZA_A.jpg",
  "PRD-013": "iPad Air (M2, 2024) 11-inch, 1Tb, Wi-Fi & Cellular - Starlight.jpg",
  "PRD-014": "Samsung Galaxy Tab S9 Ultra 5g 36,99cm 14,6zoll 12gb 256gb Graphite.jpg",
  "PRD-015": "Samsung - Tablet Samsung Galaxy Tab S9 FE+ 12GB + 256GB Wi-Fi.jpg",
  "PRD-016": "Refurbished Apple Watch Ultra 2 49mm 4G  _ Unlocked - Black Titanium _ Fair.jpg",
  "PRD-017": "Apple Watch Series 9 GPS 41mm.jpg",
  "PRD-018": "Correa De Silicona Para Samsung Galaxy Watch 7_6_5_4_fe Color Azul Oscuro - Magnético.jpg",
  "PRD-019": "Garmin® Forerunner® 570, 47mm, Advanced GPS Running and Triathlon Smartwatch, AMOLED Display, Training and Recovery Features, Slate Gray Aluminum with Translucent Black_Black Band.jpg",
  "PRD-020": "HeartRateMonitorsUSA_com Fitbit Sense 2 Advanced Health & Fitness Tracker Smartwatch, Grey.jpg",
  "PRD-021": "Sony WH-1000XM5 หูฟังบลูทูธไร้สายพร้อมไมโครโฟนในตัว คุณภาพเสียงสูง สำหรับการฟังเพลงและโทรศัพท์.jpg",
  "PRD-022": "Apple Airpods Pro (2nd Generation).jpg",
  "PRD-023": "Bose QuietComfort Ultra Wireless Noise Cancelling Headphones with Spatial Audio, Over-the-Ear Headphones with Mic, Up to 24 Hours of Battery Life, Sandstone - Limited Edition Color.jpg",
  "PRD-024": "Samsung galaxy buds 😍.jpg",
  "PRD-025": "Jabra Evolve2 85 Wireless Over-the-head Stereo Headset - Black - Binaural - Supra-aural - Bluetooth.jpg",
  "PRD-026": "Buy 16-inch MacBook Pro with M3 Max - Apple.jpg",
  "PRD-027": "_Experience next-gen performance with the 2023….webp",
  "PRD-028": "Apple 2023 맥북 에어 15, 미드나이트, M2 8코어, 10코어 GPU, 512GB, 16GB, 35W 듀얼, 한글.jpg",
  "PRD-029": "Upgrade to the 2022 Apple MacBook Air 13-inch M2….jpg",
  "PRD-030": "Dell XPS 15 7590 15_ Core i5 2_4 GHz - SSD 256 GB - 16GB QWERTY - Englisch.jpg",
  "PRD-031": "Lenovo ThinkPad T14 G6 14-inch (2024) - Core Ultra 5 225U - 32 GB - SSD 512 GB.jpg",
  "PRD-032": "Razer Blade 16 16_ 240Hz QHD+ Gaming Laptop Ryzen AI 9 365 16GB 1TB RTX 5060 W11H.jpg",
  "PRD-033": "ASUS ROG Zephyrus G16 (2026) GU606AR-TB016W Intel Core Ultra 9 386H 32GB RAM 2TB SSD RTX 5070 Ti 16_ gaming Laptop.jpg",
  "PRD-034": "Best 17-Inch ASUS Laptops for Power & Big Screens.jpg",
  "PRD-035": "Apple Mac Mini (M4).jpg",
  "PRD-036": "Apple Mac Studio.jpg",
  "PRD-037": "MSI MAG Infinite S3 14NVL7-2812UK Gaming PC Intel i7 16GB 1TB RTX 5060Ti.jpg",
  "PRD-038": "Consola Portatil Steam Deck Oled 1tb.jpg",
  "PRD-039": "PlayStation 5 Slim (1).webp",
  "PRD-040": "How Am I Supposed to Fit This Tall-Ass Xbox Under My TV_ _ Gear Patrol.jpg",
  "PRD-041": "Nintendo Switch Console OLED Model - Neon.jpg",
  "PRD-042": "Sony PS5 DualSense draadloze controller - Wit _ bol.jpg",
  "PRD-043": "Astro A20 GEN 2 Wireless Gaming Headset With Mic, PlayStation 5_4, PC & Mac.jpg",
  "PRD-044": "LG UltraGear 27GS50F-B_AEKQ 27_ Full HD VA FreeSync 5ms 180Hz Gaming Monitor.jpg",
  "PRD-045": "SAMSUNG ODYSSEY OLED GAMING MONITOR 32 INCH G8 G80SD UHD 4K 2160P 0_03MS 240HZ HDR10 ERGONOMIC SPEAKER 1Y PART + 3Y SERVICE.jpg",
  "PRD-046": "Logitech G502_G502HERO_PRO X SUPERLIGHT 2SE_PRO X SUPERLIGHT_G402 Comfortable gaming mouse for light.jpg",
  "PRD-047": "GIM 87 Keys Gaming Keyboard TKL Mechanical Keyboard Blue Switches RGB Backlit Compact Keyboar___.jpg",
  "PRD-048": "ELGATO Clavier Stream Deck Xl 10gat9901.jpg",
  "PRD-049": "Thunderbolt 4 Dock _ TS4 _ CalDigit.jpg",
  "PRD-050": "Steelseries _ _ Arctis Nova Pro Omni 2_4 GHz Wireless Over-The-Ear Gaming Headset for PC, PS5_PS4, Xbox One, Xbox X_S, Switch_Switch 2 _ Black _ Best Buy.jpg",
  "PRD-051": "SAMSUNG 85-Inch Class QLED 4K QN90D Series Mini LED, Neo Quantum HDR+ Smart TV w_Dolby Atmos, Object Tracking Sound+, Motion Xcelerator, Real Depth Enhancer Pro, Alexa Built-in (QN85QN90D, 2024).jpg",
  "PRD-052": "LG OLED evo AI C6 77 Inch 4K Smart TV 2026.jpg",
  "PRD-053": "sony 64 inch oled tv.jpg",
  "PRD-054": "TCL QLED.jpg",
  "PRD-055": "Arc Ultra_ Home Theater Soundbar with Dolby Atmos….jpg",
  "PRD-056": "Sonos Sub (Gen 3) - Black.jpg",
  "PRD-057": "samsung soundbar.jpg",
  "PRD-058": "Epson Introduces New Projectors & Printers.jpg",
  "PRD-059": "Apple TV 4K Wi‑Fi with 64GB storage - Education….jpg",
  "PRD-060": "Buy AMAZON Fire TV Stick HD (2026) with Alexa Voice Remote _ Currys.jpg",
  "PRD-061": "Google Chromecast Mit Google Tv (4k) - Hd Streaming Stick - Weiß - Ovp.jpg",
  "PRD-062": "NVIDIA's Shield TV Pro drops to a record-low of $170 for Black Friday - Engadget.jpg",
  "PRD-063": "Canon EOS M7 Rumored to Arrive in 2020 With Dual Card Slots, 2_36M-Dot EVF.jpg",
  "PRD-064": "Sony A7r V Corpo - 61mp.jpg",
  "PRD-065": "Fujifilm X-T50 + 15-45mm Kit - Silver.jpg",
  "PRD-066": "📸 DJI Osmo Pocket 3 – The Ultimate Compact Creator Camera 🎥.jpg",
  "PRD-067": "GoPro HERO12 Black–5_3K & GP-LOG - Newsshooter.jpg",
  "PRD-068": "Apple HomePod (2nd Gen) - Midnight.jpg",
  "PRD-069": "HomePod mini.jpg",
  "PRD-070": "Google Nest Hub Max - Chalk.jpg",
  "PRD-071": "3-Pack Amazon Echo Dots Smart speaker w_ Alexa (3rd Generation) $69_97  Free Shipping @ Amazon Starting 11_16.webp",
  "PRD-072": "Philips Hue Starter Kit_ 4 A19 E26 Smart Bulbs + Bridge Pro.jpg",
  "PRD-073": "Arlo _ _ Pro Outdoor Security Camera 2K HDR (6th Gen, 2025 Release _ Wireless, Rechargeable Battery, 1-Cam _ White _ Best Buy.jpg",
  "PRD-074": "Logitech MX Master 3S - Wireless Performance Mouse with Ultra-Fast Scrolling, Ergo, 8K DPI, Track on Glass, Quiet Clicks, USB-C, Bluetooth, Windows,.jpg",
  "PRD-075": "Logitech MX Keys S Bluetooth Keyboard and Mouse Combo - Graphite - Black.jpg",
  "PRD-076": "Dell UltraSharp U3824DW 38_ WQHD+ Curved IPS Business Monitor (90w USB-C + Hub).jpg",
  "PRD-077": "ScreenBar Halo.jpg",
  "PRD-078": "anker webcam.jpg",
  "PRD-079": "Apple Vision Pro.webp",
  "PRD-080": "DJI Air 3S Drone with Fly More Combo and RC-N3 Remote Controller in Gray.jpg",
  "PRD-081": "Ninebot eKickScooter MAX G2 D Powered by Segway.jpg",
  "PRD-082": "PlayStation VR2 Sony PSVR 2 Óculos de Realidade Virtual PS5.jpg",
  "PRD-083": "Anker 737 Power Bank (PowerCore 24K),.jpg",
  "PRD-084": "Củ Sạc Nhanh Baseus 20w Công Nghệ Cao GAN 5 Cho Điện Thoại Fast Charger Type-C Quick Charge.jpg",
  "PRD-085": "UGREEN Nexode 200W 6 Port GaN PD Fast Charger Charging Station - USB C Charging Cable.jpg",
  "PRD-086": "Ekstern SSD SanDisk Extreme PRO 4 TB USB-C 3_2 Gen 2 - sort_orange.jpg",
  "PRD-087": "Samsung T9 Portable SSD, 4TB.jpg",
};

function ProductCard({ product }: { product: Product }) {
  const hasOriginalPrice =
    typeof product.originalPrice === "number" &&
    product.originalPrice > product.price;

  const imageFilename = imageMap[product.id] || "placeholder.jpg";
 
  return (
    <Link href={`/products/${product.id}`} className="block h-full">
      <article className="group overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-black/10">
        <div className="relative aspect-4/3 overflow-hidden bg-black">
          <Image
            src={`/productimages/${imageFilename}`}
            alt={product.name}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            unoptimized
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/45 via-transparent to-transparent opacity-80 transition-opacity group-hover:opacity-60" />
          <div className="absolute left-4 top-4 rounded-full bg-white/90 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-gray-800 backdrop-blur">
            {product.subCategory}
          </div>
        </div>
  
        <div className="space-y-3 p-5">
          <div className="space-y-1">
            <p className="text-sm font-medium uppercase tracking-[0.18em] text-gray-500">
              {product.brand}
            </p>
            <h3 className="text-lg font-semibold leading-snug text-gray-900">
              {product.name}
            </h3>
          </div>
  
          <div className="flex items-center gap-2 rounded-2xl bg-gray-50 px-3 py-2 transition-transform duration-500 group-hover:bg-gray-100 group-hover:scale-110">
            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400 transition-transform group-hover:scale-110" />
            <span className="text-sm font-semibold text-gray-900">
              {typeof product.rating === "number" ? product.rating.toFixed(1) : "0.0"}
            </span>
            <span className="text-sm text-gray-500">
              ({product.reviewCount || 0} reviews)
            </span>
          </div>
  
          <div className="flex items-end gap-3">
            <span className="text-2xl font-bold text-gray-900">
              {currencyFormat.format(product.price)}
            </span>
            {hasOriginalPrice && (
              <span className="pb-1 text-sm text-gray-400 line-through">
                {currencyFormat.format(product.originalPrice ?? product.price)}
              </span>
            )}
          </div>
        </div>
      </article>
    </Link>
  );
}
 
export default function ProductsClient({
  initialProducts,
  title,
}: {
  initialProducts: Product[];
  title?: string;
}) {
  const [query, setQuery] = useState("");
  const [brandFilter, setBrandFilter] = useState<string | null>(null);
  const [subCatFilter, setSubCatFilter] = useState<string | null>(null);
  const [sortAsc, setSortAsc] = useState(true);
 
  const brands = useMemo(() => {
    const s = new Set<string>();
    for (const p of initialProducts) if (p.brand) s.add(p.brand);
    return Array.from(s).sort((a, b) => a.localeCompare(b));
  }, [initialProducts]);

  const subCategories = useMemo(() => {
    const s = new Set<string>();
    for (const p of initialProducts) {
      const sub = p.subCategory || (p as any).subcategory;
      if (sub) s.add(sub);
    }
    return Array.from(s).sort((a, b) => a.localeCompare(b));
  }, [initialProducts]);

  const showSubCatFilter = subCategories.length > 1;

  const filtered = useMemo(() => {
    let list = initialProducts.slice();

    if (brandFilter) list = list.filter((p) => p.brand === brandFilter);
    
    if (subCatFilter) {
      list = list.filter((p) => {
        const sub = p.subCategory || (p as any).subcategory;
        return sub === subCatFilter;
      });
    }

    if (query.trim()) {
      const q = query.trim().toLowerCase();
      list = list.filter((p) => {
        const sub = p.subCategory || (p as any).subcategory || "";
        return (
          (p.name?.toLowerCase().includes(q) || false) ||
          (p.brand?.toLowerCase().includes(q) || false) ||
          sub.toLowerCase().includes(q)
        );
      });
    }

    list.sort((a, b) =>
      sortAsc ? a.name.localeCompare(b.name) : b.name.localeCompare(a.name)
    );

    return list;
  }, [initialProducts, brandFilter, subCatFilter, query, sortAsc]);
 
  return (
    <section className="min-h-screen bg-linear-to-b from-white via-gray-50 to-white py-16 sm:py-24">
      <div className="mx-auto max-w-7xl px-6 sm:px-8 lg:px-12">
 
        <div className="mb-10 sm:mb-12">
          <p className="text-sm font-semibold uppercase tracking-[0.25em] text-gray-400 mb-1">
            Browse
          </p>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-gray-900">
            {title ?? "Products"}
          </h1>
        </div>
 
        <div className="mb-10 rounded-2xl border border-gray-200 bg-white px-5 py-4 shadow-sm">
          <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
 
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by name, brand or subcategory…"
              className="flex-1 min-w-0 sm:min-w-[260px] rounded-full px-5 py-2.5 border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-gray-300"
            />
 
            {showSubCatFilter && (
              <select
                value={subCatFilter ?? ""}
                onChange={(e) => setSubCatFilter(e.target.value || null)}
                className="rounded-full px-4 py-2.5 border border-gray-200 bg-white text-sm shrink-0"
              >
                <option value="">All subcategories</option>
                {subCategories.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            )}
 
            <select
              value={brandFilter ?? ""}
              onChange={(e) => setBrandFilter(e.target.value || null)}
              className="rounded-full px-4 py-2.5 border border-gray-200 bg-white text-sm shrink-0"
            >
              <option value="">All brands</option>
              {brands.map((b) => (
                <option key={b} value={b}>
                  {b}
                </option>
              ))}
            </select>
 
            <button
              onClick={() => setSortAsc((s) => !s)}
              className="rounded-full px-5 py-2.5 border border-gray-200 bg-white text-sm font-medium shrink-0 hover:bg-gray-50 transition-colors"
            >
              {sortAsc ? "A → Z" : "Z → A"}
            </button>
 
            <span className="text-sm text-gray-400 sm:ml-auto shrink-0">
              {filtered.length} {filtered.length === 1 ? "item" : "items"}
            </span>
          </div>
        </div>
 
        {filtered.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-gray-300 bg-white p-16 text-center text-gray-500">
            No products match your filters.
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filtered.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
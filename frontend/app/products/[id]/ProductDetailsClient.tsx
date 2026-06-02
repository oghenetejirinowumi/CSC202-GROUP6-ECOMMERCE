"use client";

import Image from "next/image";
import { Star, ShoppingBag } from "lucide-react";
import { useCart } from "../../../context/CartContext";

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
  "PRD-071": "Amazon Echo Show 10 HD Smart Display with Motion….jpg",
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

export default function ProductDetailsClient({ product }: { product: any }) {
  const { addToCart } = useCart();
  const imageFilename = imageMap[product.id] || "placeholder.jpg";

  let parsedSpecs: Record<string, string> = {};
  try {
    if (product.specs) {
      parsedSpecs = typeof product.specs === "string" ? JSON.parse(product.specs) : product.specs;
    }
  } catch (e) {
    console.error("Failed to parse specifications object JSON payload");
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-6 bg-white p-8 rounded-3xl shadow-sm border border-gray-100 grid grid-cols-1 md:grid-cols-2 gap-12">
        
        {/* Left Side: Product Image Visualizer */}
        <div className="relative aspect-square rounded-2xl overflow-hidden bg-gray-50 border border-gray-100">
          <Image
            src={`/productimages/${imageFilename}`}
            alt={product.name}
            fill
            className="object-cover"
            priority
            unoptimized
          />
        </div>

        {/* Right Side: Product Details info data panel */}
        <div className="flex flex-col justify-between space-y-6">
          <div className="space-y-2">
            <p className="text-sm uppercase tracking-widest text-blue-600 font-bold">{product.brand}</p>
            <h1 className="text-3xl font-extrabold text-gray-900">{product.name}</h1>
            
            <div className="flex items-center gap-2 pt-2">
              <div className="flex bg-yellow-50 text-yellow-600 px-2 py-1 rounded-lg text-sm font-semibold items-center gap-1">
                <Star size={16} className="fill-yellow-500 text-yellow-500" />
                {Number(product.rating || 0).toFixed(1)}
              </div>
              <span className="text-md text-gray-400">({product.reviewCount} user reviews)</span>
            </div>
          </div>

          <div className="border-t border-b py-4">
            <div className="flex items-baseline gap-3">
              {product.originalPrice && product.originalPrice > product.price && (
                <span className="text-2xl text-gray-400 line-through">
                  {currencyFormat.format(product.originalPrice)}
                </span>
              )}
              <span className="text-3xl font-black text-gray-900">
                {currencyFormat.format(product.price)}
              </span>
            </div>
          </div>

          <p className="text-xl text-gray-600 leading-relaxed">{product.description}</p>

          {/* Specifications Grid blocks */}
          {Object.keys(parsedSpecs).length > 0 && (
            <div className="bg-gray-50 p-0 rounded-xl space-y-2 text-sm">
              <h3 className="font-bold text-gray-700">Specifications:</h3>
              <div className="grid grid-cols-2 gap-2">
                {Object.entries(parsedSpecs).map(([key, value]) => (
                  <div key={key} className="text-gray-600">
                    <span className="font-semibold text-gray-900">{key}:</span> {value}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Action Call buttons */}
          <div className="pt-4 flex flex-col sm:flex-row gap-4">
            <button
              onClick={() => addToCart(product)}
              className="flex-1 bg-black text-white py-4 rounded-xl hover:bg-gray-800 transition-colors flex items-center justify-center gap-2 font-bold shadow-lg shadow-black/10"
            >
              <ShoppingBag size={20} />
              Add to Cart
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
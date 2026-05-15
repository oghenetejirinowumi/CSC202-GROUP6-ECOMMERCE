const fs = require("fs");
const path = require("path");
const { DatabaseSync: Database } = require("node:sqlite");
require("dotenv").config();

const resolveDbPath = () => {
  const rawUrl = process.env.DATABASE_URL || "";
  let candidate = rawUrl.replace(/^file:/, "");
  if (!candidate) {
    candidate = path.join("data", "gadget-store.db");
  }
  if (!path.isAbsolute(candidate)) {
    candidate = path.join(__dirname, candidate);
  }
  fs.mkdirSync(path.dirname(candidate), { recursive: true });
  return candidate;
};

const dbPath = resolveDbPath();
const db = new Database(dbPath);
db.exec("PRAGMA foreign_keys = ON;");

const ensureSchema = () => {
  db.exec(`
    CREATE TABLE IF NOT EXISTS User (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT NOT NULL UNIQUE,
      password_hash TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE
    );
    CREATE TABLE IF NOT EXISTS Product (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      brand TEXT NOT NULL,
      category TEXT NOT NULL,
      subCategory TEXT NOT NULL,
      price REAL NOT NULL,
      originalPrice REAL,
      rating REAL NOT NULL,
      reviewCount INTEGER NOT NULL,
      description TEXT NOT NULL,
      isFeatured INTEGER NOT NULL DEFAULT 0,
      isNewArrival INTEGER NOT NULL DEFAULT 0,
      tags TEXT,
      specs TEXT,
      stock INTEGER NOT NULL,
      image_url TEXT
    );
    CREATE TABLE IF NOT EXISTS "Order" (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      userId INTEGER,
      total REAL NOT NULL,
      date TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY (userId) REFERENCES User(id) ON DELETE SET NULL
    );
    CREATE TABLE IF NOT EXISTS OrderItem (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      orderId INTEGER NOT NULL,
      productId TEXT NOT NULL,
      quantity INTEGER NOT NULL,
      price_at_purchase REAL NOT NULL,
      FOREIGN KEY (orderId) REFERENCES "Order"(id) ON DELETE CASCADE,
      FOREIGN KEY (productId) REFERENCES Product(id)
    );
    CREATE INDEX IF NOT EXISTS idx_orderitem_orderId ON OrderItem(orderId);
    CREATE INDEX IF NOT EXISTS idx_order_userId ON "Order"(userId);
  `);
};

ensureSchema();

// Real gadget catalog organized by Menu.tsx categories with Naira pricing.
const realProducts = [
    // MOBILE & WEARABLES - Smartphones 
    { id: "PRD-001", name: "Apple iPhone 15 Pro", brand: "Apple", category: "Mobile & Wearables", subCategory: "Smartphones", price: 1199990.00, originalPrice: 1319988.00, rating: 4.9, reviewCount: 128, description: "Titanium design with A17 Pro chip and advanced camera system.", isFeatured: 1, isNewArrival: 1, tags: "iphone,smartphone,apple,ios,5g", specs: JSON.stringify({ "Display": "6.1-inch OLED", "Chip": "A17 Pro", "Storage": "256GB" }), stock: 45 },
    { id: "PRD-002", name: "Apple iPhone 15", brand: "Apple", category: "Mobile & Wearables", subCategory: "Smartphones", price: 959880.00, originalPrice: 1055988.00, rating: 4.8, reviewCount: 95, description: "Colorful and reliable smartphone with Dynamic Island.", isFeatured: 1, isNewArrival: 0, tags: "iphone,smartphone,apple,ios", specs: JSON.stringify({ "Display": "6.1-inch LCD", "Chip": "A16 Bionic", "Storage": "128GB" }), stock: 60 },
    { id: "PRD-003", name: "Samsung Galaxy S24 Ultra", brand: "Samsung", category: "Mobile & Wearables", subCategory: "Smartphones", price: 1559988.00, originalPrice: 1699988.00, rating: 4.8, reviewCount: 112, description: "AI-powered Android flagship with built-in S Pen.", isFeatured: 1, isNewArrival: 1, tags: "samsung,smartphone,android,spen,flagship", specs: JSON.stringify({ "Display": "6.8-inch AMOLED", "Chip": "Snapdragon 8 Gen3", "Storage": "256GB" }), stock: 35 },
    { id: "PRD-004", name: "Google Pixel 8 Pro", brand: "Google", category: "Mobile & Wearables", subCategory: "Smartphones", price: 1078800.00, originalPrice: 1199988.00, rating: 4.7, reviewCount: 88, description: "Ultimate Android camera experience with pure Google software.", isFeatured: 0, isNewArrival: 0, tags: "google,pixel,smartphone,android,camera", specs: JSON.stringify({ "Display": "6.7-inch OLED", "Chip": "Tensor G3", "Storage": "128GB" }), stock: 40 },
    { id: "PRD-005", name: "OnePlus 12", brand: "OnePlus", category: "Mobile & Wearables", subCategory: "Smartphones", price: 959880.00, originalPrice: 1079988.00, rating: 4.6, reviewCount: 76, description: "Flagship killer with insanely fast charging capabilities.", isFeatured: 0, isNewArrival: 1, tags: "oneplus,smartphone,android,charging", specs: JSON.stringify({ "Display": "6.7-inch AMOLED", "Chip": "Snapdragon 8 Gen3", "Charging": "100W" }), stock: 50 },

    // MOBILE & WEARABLES - Tablets 
    { id: "PRD-006", name: "Apple iPad Pro 12.9 (M2)", brand: "Apple", category: "Mobile & Wearables", subCategory: "Tablets", price: 1319880.00, originalPrice: 1439988.00, rating: 4.9, reviewCount: 104, description: "Ultimate tablet for creatives with mini-LED screen.", isFeatured: 1, isNewArrival: 0, tags: "ipad,tablet,apple,m2,creative", specs: JSON.stringify({ "Display": "12.9-inch mini-LED", "Chip": "M2", "Storage": "256GB" }), stock: 30 },
    { id: "PRD-007", name: "Samsung Galaxy Tab S9 Ultra", brand: "Samsung", category: "Mobile & Wearables", subCategory: "Tablets", price: 1439988.00, originalPrice: 1559988.00, rating: 4.7, reviewCount: 92, description: "Massive Android tablet perfect for media and multitasking.", isFeatured: 0, isNewArrival: 0, tags: "samsung,tablet,android,spen,display", specs: JSON.stringify({ "Display": "14.6-inch AMOLED", "Chip": "Snapdragon 8 Gen2", "Storage": "128GB" }), stock: 25 },

    // MOBILE & WEARABLES - Smartwatches 
    { id: "PRD-008", name: "Apple Watch Ultra 2", brand: "Apple", category: "Mobile & Wearables", subCategory: "Smartwatches", price: 959880.00, originalPrice: 1079988.00, rating: 4.8, reviewCount: 87, description: "Rugged smartwatch built for extreme sports and outdoor adventures.", isFeatured: 1, isNewArrival: 0, tags: "watch,smartwatch,apple,fitness,sport", specs: JSON.stringify({ "Display": "49mm Retina", "Battery": "36 hours", "Rating": "ATM 100m" }), stock: 35 },
    { id: "PRD-009", name: "Apple Watch Series 9", brand: "Apple", category: "Mobile & Wearables", subCategory: "Smartwatches", price: 479880.00, originalPrice: 539988.00, rating: 4.6, reviewCount: 78, description: "Advanced health tracking with brighter display and double-tap gesture.", isFeatured: 0, isNewArrival: 0, tags: "watch,smartwatch,apple,health", specs: JSON.stringify({ "Display": "45mm Retina", "Battery": "18 hours", "Health": "Advanced monitoring" }), stock: 45 },
    { id: "PRD-010", name: "Samsung Galaxy Watch 6 Classic", brand: "Samsung", category: "Mobile & Wearables", subCategory: "Smartwatches", price: 479880.00, originalPrice: 539988.00, rating: 4.5, reviewCount: 65, description: "Stylish smartwatch with rotating physical bezel.", isFeatured: 0, isNewArrival: 0, tags: "samsung,watch,smartwatch,android,bezel", specs: JSON.stringify({ "Display": "43mm AMOLED", "Battery": "40 hours", "Design": "Rotating bezel" }), stock: 40 },

    // MOBILE & WEARABLES - Audio
    { id: "PRD-011", name: "Sony WH-1000XM5", brand: "Sony", category: "Mobile & Wearables", subCategory: "Audio", price: 477600.00, originalPrice: 539988.00, rating: 4.9, reviewCount: 142, description: "Industry-leading wireless noise-canceling headphones.", isFeatured: 1, isNewArrival: 0, tags: "sony,headphones,audio,noise-canceling,wireless", specs: JSON.stringify({ "Type": "Over-ear", "ANC": "Industry-leading", "Battery": "30 hours" }), stock: 50 },
    { id: "PRD-012", name: "Apple AirPods Pro 2", brand: "Apple", category: "Mobile & Wearables", subCategory: "Audio", price: 299880.00, originalPrice: 359988.00, rating: 4.7, reviewCount: 118, description: "Active noise cancellation and spatial audio in compact fit.", isFeatured: 0, isNewArrival: 0, tags: "apple,airpods,audio,earbud,wireless", specs: JSON.stringify({ "Type": "True Wireless", "ANC": "Active", "Battery": "6 hours" }), stock: 65 },

    // COMPUTING & GAMING - Laptops
    { id: "PRD-013", name: "Apple MacBook Pro 14 M3", brand: "Apple", category: "Computing & Gaming", subCategory: "Laptops", price: 1919880.00, originalPrice: 2099988.00, rating: 4.9, reviewCount: 135, description: "High-performance Apple Silicon laptop perfect for development.", isFeatured: 1, isNewArrival: 0, tags: "apple,laptop,m3,macbook,development", specs: JSON.stringify({ "CPU": "M3 Pro", "RAM": "16GB", "SSD": "512GB", "Display": "14-inch" }), stock: 25 },
    { id: "PRD-014", name: "Apple MacBook Air M3", brand: "Apple", category: "Computing & Gaming", subCategory: "Laptops", price: 1319880.00, originalPrice: 1439988.00, rating: 4.8, reviewCount: 102, description: "Lightweight fanless design with all-day battery life.", isFeatured: 0, isNewArrival: 0, tags: "apple,laptop,m3,macbook,ultrabook", specs: JSON.stringify({ "CPU": "M3", "RAM": "8GB", "SSD": "256GB", "Display": "13-inch" }), stock: 40 },
    { id: "PRD-015", name: "Dell XPS 15", brand: "Dell", category: "Computing & Gaming", subCategory: "Laptops", price: 2099880.00, originalPrice: 2299988.00, rating: 4.7, reviewCount: 89, description: "Premium Windows ultrabook with stunning 4K OLED display.", isFeatured: 1, isNewArrival: 0, tags: "dell,laptop,xps,windows,premium", specs: JSON.stringify({ "CPU": "Intel i7", "RAM": "16GB", "SSD": "512GB", "Display": "15.6-inch 4K OLED" }), stock: 20 },
    { id: "PRD-016", name: "Razer Blade 16", brand: "Razer", category: "Computing & Gaming", subCategory: "Laptops", price: 3959880.00, originalPrice: 4319988.00, rating: 4.8, reviewCount: 76, description: "High-end gaming laptop with RTX 4090 and dual-mode mini-LED.", isFeatured: 1, isNewArrival: 1, tags: "razer,laptop,gaming,rtx4090,rgb", specs: JSON.stringify({ "CPU": "Intel i9", "GPU": "RTX 4090", "RAM": "32GB", "Display": "16-inch mini-LED" }), stock: 15 },

    // COMPUTING & GAMING - Desktop PCs
    { id: "PRD-017", name: "Asus ROG Gaming PC", brand: "Asus", category: "Computing & Gaming", subCategory: "Desktop PCs", price: 2399880.00, originalPrice: 2699988.00, rating: 4.7, reviewCount: 94, description: "High-performance gaming desktop with RTX 4080 Super.", isFeatured: 1, isNewArrival: 0, tags: "asus,desktop,gaming,rog,rgb", specs: JSON.stringify({ "CPU": "Intel i9-14900K", "GPU": "RTX 4080 Super", "RAM": "32GB", "Storage": "2TB NVMe" }), stock: 18 },

    // COMPUTING & GAMING - Gaming
    { id: "PRD-018", name: "Steam Deck OLED", brand: "Valve", category: "Computing & Gaming", subCategory: "Gaming", price: 659880.00, originalPrice: 759988.00, rating: 4.9, reviewCount: 156, description: "Portable PC gaming console with stunning HDR OLED screen.", isFeatured: 1, isNewArrival: 1, tags: "steam,handheld,gaming,pc,oled", specs: JSON.stringify({ "Display": "7.4-inch OLED", "CPU": "Custom APU", "Storage": "512GB", "Performance": "Full PC gaming" }), stock: 30 },
    { id: "PRD-019", name: "PlayStation 5 DualSense Controller", brand: "Sony", category: "Computing & Gaming", subCategory: "Gaming", price: 83988.00, originalPrice: 99988.00, rating: 4.7, reviewCount: 103, description: "Immersive controller with haptic feedback and adaptive triggers.", isFeatured: 0, isNewArrival: 0, tags: "playstation,controller,gaming,haptic", specs: JSON.stringify({ "Features": "Haptic feedback, Adaptive triggers", "Connection": "USB-C", "Battery": "4-6 hours" }), stock: 120 },

    // COMPUTING & GAMING - Accessories =====
    { id: "PRD-020", name: "Logitech G Pro X Superlight", brand: "Logitech", category: "Computing & Gaming", subCategory: "Accessories", price: 179880.00, originalPrice: 219988.00, rating: 4.8, reviewCount: 92, description: "Ultra-lightweight wireless mouse tailored for precision gaming.", isFeatured: 0, isNewArrival: 0, tags: "logitech,mouse,gaming,wireless,lightweight", specs: JSON.stringify({ "Weight": "63g", "DPI": "25,600", "Battery": "70 hours", "Connection": "2.4GHz Wireless" }), stock: 65 },
    { id: "PRD-021", name: "Keychron Q1 Pro Mechanical Keyboard", brand: "Keychron", category: "Computing & Gaming", subCategory: "Accessories", price: 239880.00, originalPrice: 299988.00, rating: 4.9, reviewCount: 78, description: "Premium custom wireless mechanical keyboard with aluminum body.", isFeatured: 1, isNewArrival: 0, tags: "keychron,keyboard,mechanical,wireless,aluminum", specs: JSON.stringify({ "Layout": "75%", "Switches": "Mechanical", "Material": "Aluminum", "Battery": "80 hours" }), stock: 45 },
    { id: "PRD-022", name: "LG UltraGear 27 OLED Monitor", brand: "LG", category: "Computing & Gaming", subCategory: "Accessories", price: 1079880.00, originalPrice: 1199988.00, rating: 4.8, reviewCount: 84, description: "240Hz OLED gaming monitor with 0.03ms response time.", isFeatured: 1, isNewArrival: 1, tags: "lg,monitor,gaming,oled,240hz", specs: JSON.stringify({ "Size": "27-inch", "Refresh": "240Hz", "Panel": "OLED", "Resolution": "1440p" }), stock: 22 },

    // HOME ENTERTAINMENT - Televisions
    { id: "PRD-023", name: "Samsung 85-inch QN85Q80D QLED", brand: "Samsung", category: "Home Entertainment", subCategory: "Televisions", price: 2399880.00, originalPrice: 2699988.00, rating: 4.8, reviewCount: 67, description: "Premium QLED TV with quantum dot technology and 120Hz.", isFeatured: 1, isNewArrival: 0, tags: "samsung,tv,qled,85inch,4k", specs: JSON.stringify({ "Size": "85-inch", "Panel": "QLED", "Resolution": "4K", "Refresh": "120Hz" }), stock: 8 },
    { id: "PRD-024", name: "LG 77-inch OLED55G3PUA", brand: "LG", category: "Home Entertainment", subCategory: "Televisions", price: 1439880.00, originalPrice: 1599988.00, rating: 4.9, reviewCount: 95, description: "Stunning OLED TV with infinite contrast and perfect blacks.", isFeatured: 1, isNewArrival: 1, tags: "lg,tv,oled,77inch,4k", specs: JSON.stringify({ "Size": "77-inch", "Panel": "OLED", "Resolution": "4K", "Brightness": "Peak 200 nits" }), stock: 12 },

    // HOME ENTERTAINMENT - Streaming
    { id: "PRD-025", name: "Apple TV 4K", brand: "Apple", category: "Home Entertainment", subCategory: "Streaming", price: 119880.00, originalPrice: 139988.00, rating: 4.7, reviewCount: 58, description: "Premium streaming device with Dolby Vision and Atmos.", isFeatured: 0, isNewArrival: 0, tags: "apple,streaming,4k,airplay", specs: JSON.stringify({ "Output": "4K HDR", "Processor": "A15", "Storage": "64GB", "Audio": "Dolby Atmos" }), stock: 50 },

    // SMART HOME & PHOTOGRAPHY - Cameras
    { id: "PRD-026", name: "Canon EOS R5 Mark II", brand: "Canon", category: "Smart Home & Photography", subCategory: "Cameras", price: 3359880.00, originalPrice: 3699988.00, rating: 4.9, reviewCount: 112, description: "Professional mirrorless camera with 45MP sensor and 8K video.", isFeatured: 1, isNewArrival: 1, tags: "canon,camera,mirrorless,professional,8k", specs: JSON.stringify({ "Sensor": "45MP Full Frame", "Video": "8K RAW", "Battery": "Canon Battery", "Weather-sealed": "Yes" }), stock: 12 },
    { id: "PRD-027", name: "Sony a7R V", brand: "Sony", category: "Smart Home & Photography", subCategory: "Cameras", price: 2879880.00, originalPrice: 3179988.00, rating: 4.8, reviewCount: 98, description: "High-resolution 61MP mirrorless camera with AI autofocus.", isFeatured: 1, isNewArrival: 0, tags: "sony,camera,mirrorless,61mp,ai", specs: JSON.stringify({ "Sensor": "61MP Full Frame", "AF": "AI-driven", "Video": "4K", "Battery": "2 days" }), stock: 14 },

    // SMART HOME & PHOTOGRAPHY - Smart Home 
    { id: "PRD-028", name: "Apple HomePod mini", brand: "Apple", category: "Smart Home & Photography", subCategory: "Smart Home", price: 79880.00, originalPrice: 99988.00, rating: 4.6, reviewCount: 76, description: "Compact smart speaker with exceptional sound quality.", isFeatured: 0, isNewArrival: 0, tags: "apple,smart-speaker,homepod,audio", specs: JSON.stringify({ "Speaker": "360-degree audio", "Voice": "Siri", "Connectivity": "Wi-Fi 6E", "Size": "3.3-inch" }), stock: 55 },
    { id: "PRD-029", name: "Google Nest Hub Max", brand: "Google", category: "Smart Home & Photography", subCategory: "Smart Home", price: 179880.00, originalPrice: 219988.00, rating: 4.5, reviewCount: 82, description: "Smart display with video calling and smart home control.", isFeatured: 0, isNewArrival: 1, tags: "google,smart-display,nest,video-calling", specs: JSON.stringify({ "Display": "10-inch touchscreen", "Camera": "6.2MP", "Voice": "Google Assistant", "Video calling": "Yes" }), stock: 35 },

    // MISCELLANEOUS - Featured Deals
    { id: "PRD-030", name: "Anker 737 Power Bank", brand: "Anker", category: "Miscellaneous", subCategory: "Featured Deals", price: 179880.00, originalPrice: 219988.00, rating: 4.7, reviewCount: 134, description: "24,000mAh portable charger capable of fast-charging a laptop.", isFeatured: 1, isNewArrival: 0, tags: "anker,powerbank,charging,portable", specs: JSON.stringify({ "Capacity": "24,000mAh", "Output": "100W", "Features": "LCD Display, Fast Charging", "Weight": "619g" }), stock: 80 },
    { id: "PRD-031", name: "CalDigit TS4 Thunderbolt 4 Dock", brand: "CalDigit", category: "Miscellaneous", subCategory: "Featured Deals", price: 479880.00, originalPrice: 559988.00, rating: 4.8, reviewCount: 67, description: "Ultimate docking station with 18 ports for massive connectivity.", isFeatured: 1, isNewArrival: 1, tags: "caldigit,dock,thunderbolt,productivity", specs: JSON.stringify({ "Ports": "18 Total", "Thunderbolt": "Daisy-chain", "Display": "Supports Dual 6K", "Data": "40Gbps" }), stock: 28 },
  ];
  const insertProduct = db.prepare(
    `INSERT INTO Product (
      id, name, brand, category, subCategory,
      price, originalPrice, rating, reviewCount, description,
      isFeatured, isNewArrival, tags, specs, stock, image_url
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
  );

  db.exec(`
    DELETE FROM OrderItem;
    DELETE FROM "Order";
    DELETE FROM Product;
    DELETE FROM User;
  `);

  for (const product of realProducts) {
    insertProduct.run(
      product.id,
      product.name,
      product.brand,
      product.category,
      product.subCategory,
      product.price,
      product.originalPrice ?? null,
      product.rating,
      product.reviewCount,
      product.description,
      product.isFeatured ? 1 : 0,
      product.isNewArrival ? 1 : 0,
      product.tags ?? null,
      product.specs ?? null,
      product.stock,
      "https://placehold.co/600x400/000000/FFFFFF?text=No+Image"
    );
  }

  console.log("Products table refreshed and seeded successfully.");
  db.close();
  console.log("SQLite database closed.");

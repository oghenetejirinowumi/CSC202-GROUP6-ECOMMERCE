const fs = require("fs");
const path = require("path");
const sqlite3 = require("sqlite3").verbose();

// Store the database file in backend/data so it is easy to find/share.
const dataDir = path.join(__dirname, "data");
const dbPath = path.join(dataDir, "gadget-store.db");

// Create the data folder if it does not exist yet.
fs.mkdirSync(dataDir, { recursive: true });

const db = new sqlite3.Database(dbPath, (openError) => {
  if (openError) {
    console.error("Could not open database:", openError.message);
    process.exit(1);
  }
  console.log(`Connected to SQLite database at: ${dbPath}`);
});

db.serialize(() => {
  // Enforce foreign key rules (important for the orders.user_id relation).
  db.run("PRAGMA foreign_keys = ON;");

  // USERS TABLE
  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT NOT NULL UNIQUE,
      password_hash TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE
    );
  `);

  // PRODUCTS TABLE
  db.run(`
    CREATE TABLE IF NOT EXISTS products (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL UNIQUE,
      description TEXT,
      price REAL NOT NULL,
      stock INTEGER NOT NULL DEFAULT 0,
      image_url TEXT
    );
  `);

  // ORDERS TABLE
  db.run(`
    CREATE TABLE IF NOT EXISTS orders (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      total REAL NOT NULL,
      date TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id)
    );
  `);

  // Real gadget catalog for presentation/demo use.
  const realProducts = [
    // Laptops & Computers
    { name: "Apple MacBook Pro 14 M3", desc: "High-performance Apple Silicon laptop, perfect for development and virtualization.", price: 1599.99, stock: 12 },
    { name: "Apple MacBook Air M3", desc: "Lightweight fanless design with all-day battery life.", price: 1099.0, stock: 25 },
    { name: "Dell XPS 15", desc: "Premium Windows ultrabook with a stunning 4K OLED display.", price: 1749.0, stock: 8 },
    { name: "Lenovo ThinkPad X1 Carbon", desc: "Durable, lightweight business laptop with a best-in-class keyboard.", price: 1399.5, stock: 15 },
    { name: "Razer Blade 16", desc: "High-end gaming laptop with an RTX 4090 and dual-mode mini-LED display.", price: 3299.99, stock: 4 },
    { name: "Asus ROG Zephyrus G14", desc: "Compact and powerful 14-inch gaming laptop.", price: 1599.0, stock: 10 },
    { name: "Microsoft Surface Laptop 7", desc: "Sleek and portable Windows 11 laptop with excellent battery.", price: 1299.0, stock: 18 },
    { name: "LG Gram 17", desc: "Incredibly light 17-inch laptop with a massive screen.", price: 1499.0, stock: 7 },
    { name: "HP Spectre x360", desc: "Versatile 2-in-1 convertible laptop with a beautiful chassis.", price: 1349.99, stock: 11 },
    { name: "Alienware m18", desc: "Desktop replacement gaming laptop with an 18-inch screen.", price: 2599.0, stock: 5 },

    // Smartphones & Tablets
    { name: "Apple iPhone 15 Pro", desc: "Titanium design with the A17 Pro chip and advanced camera system.", price: 999.99, stock: 25 },
    { name: "Apple iPhone 15", desc: "Colorful and reliable smartphone with the Dynamic Island.", price: 799.0, stock: 40 },
    { name: "Samsung Galaxy S24 Ultra", desc: "AI-powered Android flagship with built-in S Pen.", price: 1299.99, stock: 18 },
    { name: "Samsung Galaxy S24+", desc: "Excellent large-screen Android phone with all-day battery.", price: 999.99, stock: 22 },
    { name: "Google Pixel 8 Pro", desc: "The ultimate Android camera experience with pure Google software.", price: 899.0, stock: 20 },
    { name: "Google Pixel 8", desc: "Compact and powerful phone with top-tier AI photography.", price: 699.0, stock: 30 },
    { name: "OnePlus 12", desc: "Flagship killer with insanely fast charging capabilities.", price: 799.99, stock: 15 },
    { name: "Samsung Galaxy Z Fold 5", desc: "Premium foldable phone that doubles as a mini tablet.", price: 1799.99, stock: 6 },
    { name: "Apple iPad Pro 12.9 (M2)", desc: "The ultimate tablet for creatives with a mini-LED screen.", price: 1099.0, stock: 14 },
    { name: "Samsung Galaxy Tab S9 Ultra", desc: "Massive Android tablet perfect for media and multitasking.", price: 1199.99, stock: 9 },

    // Audio & Wearables
    { name: "Sony WH-1000XM5", desc: "Industry-leading wireless noise-canceling headphones.", price: 398.0, stock: 30 },
    { name: "Apple AirPods Pro 2", desc: "Active noise cancellation and spatial audio in a compact fit.", price: 249.0, stock: 50 },
    { name: "Bose QuietComfort Ultra", desc: "Premium over-ear headphones with immersive spatial audio.", price: 429.0, stock: 14 },
    { name: "Sennheiser Momentum 4", desc: "Audiophile-grade wireless headphones with 60-hour battery life.", price: 349.95, stock: 12 },
    { name: "Apple Watch Ultra 2", desc: "Rugged smartwatch built for extreme sports and outdoor adventures.", price: 799.0, stock: 10 },
    { name: "Apple Watch Series 9", desc: "Advanced health tracking with a brighter display and double-tap gesture.", price: 399.0, stock: 22 },
    { name: "Samsung Galaxy Watch 6 Classic", desc: "Stylish smartwatch with a rotating physical bezel.", price: 399.99, stock: 18 },
    { name: "Garmin Fenix 7X Sapphire Solar", desc: "Multisport GPS watch with solar charging.", price: 899.99, stock: 7 },
    { name: "Oura Ring Gen3", desc: "Discreet and highly accurate sleep and fitness tracker.", price: 299.0, stock: 15 },
    { name: "Shure SM7B Microphone", desc: "Professional dynamic microphone for podcasting and streaming.", price: 399.0, stock: 11 },

    // Gaming & Storage
    { name: "Steam Deck OLED", desc: "Portable PC gaming console with a stunning HDR OLED screen.", price: 549.0, stock: 10 },
    { name: "Asus ROG Ally", desc: "Powerful Windows 11 handheld gaming PC.", price: 699.99, stock: 12 },
    { name: "PlayStation 5 DualSense Controller", desc: "Immersive controller with haptic feedback and adaptive triggers.", price: 69.99, stock: 45 },
    { name: "Xbox Elite Wireless Controller Series 2", desc: "Highly customizable pro-level gaming controller.", price: 179.99, stock: 20 },
    { name: "Seagate 2TB Expansion HDD", desc: "External hard drive for storing massive game libraries and heavy files.", price: 79.99, stock: 40 },
    { name: "Samsung T7 2TB Portable SSD", desc: "Lightning-fast external solid-state drive.", price: 159.99, stock: 35 },
    { name: "WD_BLACK 4TB SN850X NVMe SSD", desc: "High-speed internal storage for PS5 and PC gaming.", price: 299.99, stock: 25 },
    { name: "Logitech G Pro X Superlight", desc: "Ultra-lightweight wireless mouse tailored for precision gaming.", price: 149.99, stock: 28 },
    { name: "Keychron Q1 Pro Mechanical Keyboard", desc: "Premium custom wireless mechanical keyboard with an aluminum body.", price: 199.0, stock: 16 },
    { name: "LG UltraGear 27 OLED Monitor", desc: "240Hz OLED gaming monitor with 0.03ms response time.", price: 899.99, stock: 8 },

    // Networking, Security & Accessories
    { name: "Flipper Zero", desc: "Portable multi-tool for pentesters and geeks.", price: 169.0, stock: 20 },
    { name: "Hak5 Wi-Fi Pineapple", desc: "Advanced rogue AP and Wi-Fi auditing device.", price: 119.99, stock: 15 },
    { name: "Hak5 USB Rubber Ducky", desc: "Keystroke injection tool disguised as a standard USB drive.", price: 79.99, stock: 25 },
    { name: "Alfa AWUS036ACM Wi-Fi Adapter", desc: "Long-range wireless adapter supporting packet injection and monitor mode.", price: 45.0, stock: 30 },
    { name: "YubiKey 5 NFC", desc: "Hardware authentication key for bulletproof multi-factor security.", price: 45.0, stock: 50 },
    { name: "Raspberry Pi 5 8GB", desc: "Powerful single-board computer for DIY projects and micro-servers.", price: 80.0, stock: 40 },
    { name: "Ubiquiti UniFi Dream Router", desc: "All-in-one desktop network routing and Wi-Fi security system.", price: 199.0, stock: 12 },
    { name: "Netgear Nighthawk M6 Pro", desc: "Ultra-fast 5G mobile hotspot for secure, on-the-go internet.", price: 999.0, stock: 5 },
    { name: "Anker 737 Power Bank", desc: "24,000mAh portable charger capable of fast-charging a laptop.", price: 149.99, stock: 22 },
    { name: "CalDigit TS4 Thunderbolt 4 Dock", desc: "Ultimate docking station with 18 ports for massive connectivity.", price: 399.99, stock: 14 },
  ];

  const insertProduct = db.prepare(`
    INSERT OR IGNORE INTO products (name, description, price, stock, image_url)
    VALUES (?, ?, ?, ?, ?);
  `);

  // Refresh products so rerunning this script always reflects the latest list.
  db.run("DELETE FROM products;", (deleteError) => {
    if (deleteError) {
      console.error("Error clearing products table:", deleteError.message);
      process.exitCode = 1;
      return;
    }

    realProducts.forEach((product) => {
      const imageUrl = `https://placehold.co/600x400/2a2a2a/ffffff?text=${encodeURIComponent(product.name)}`;
      insertProduct.run(
        product.name,
        product.desc,
        product.price,
        product.stock,
        imageUrl
      );
    });

    insertProduct.finalize((finalizeError) => {
      if (finalizeError) {
        console.error("Error inserting products:", finalizeError.message);
        process.exitCode = 1;
        return;
      }
      console.log("Products table refreshed and seeded successfully.");
    });
  });
});

db.close((closeError) => {
  if (closeError) {
    console.error("Error closing database:", closeError.message);
    process.exit(1);
  }
  console.log("Database connection closed.");
});

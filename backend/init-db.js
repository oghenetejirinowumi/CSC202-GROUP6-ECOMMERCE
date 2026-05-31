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
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT NOT NULL UNIQUE,
      email TEXT NOT NULL UNIQUE,
      password_hash TEXT NOT NULL,
      first_name TEXT,
      last_name TEXT,
      phone_number TEXT,
      birthday TEXT,
      email_verified_at TEXT,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS products (
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

    CREATE TABLE IF NOT EXISTS orders (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER,
      guest_email TEXT,
      guest_name TEXT,
      contact_email TEXT,
      contact_phone TEXT,
      shipping_method TEXT,
      payment_method TEXT,
      subtotal REAL NOT NULL DEFAULT 0,
      shipping_fee REAL NOT NULL DEFAULT 0,
      tax_amount REAL NOT NULL DEFAULT 0,
      total REAL NOT NULL,
      shipping_address TEXT,
      billing_address TEXT,
      delivery_notes TEXT,
      status TEXT NOT NULL DEFAULT 'placed',
      date TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
    );

    CREATE TABLE IF NOT EXISTS order_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      order_id INTEGER NOT NULL,
      product_id TEXT NOT NULL,
      quantity INTEGER NOT NULL,
      price_at_purchase REAL NOT NULL,
      FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
      FOREIGN KEY (product_id) REFERENCES products(id)
    );

    CREATE TABLE IF NOT EXISTS cart_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id TEXT NOT NULL,
      product_id TEXT NOT NULL,
      quantity INTEGER NOT NULL CHECK (quantity > 0),
      updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      UNIQUE (user_id, product_id)
    );

    CREATE TABLE IF NOT EXISTS auth_sessions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      session_hash TEXT NOT NULL UNIQUE,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      expires_at TEXT NOT NULL,
      last_used_at TEXT,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS email_verification_tokens (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      token_hash TEXT NOT NULL UNIQUE,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      expires_at TEXT NOT NULL,
      used_at TEXT,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON order_items(order_id);
    CREATE INDEX IF NOT EXISTS idx_orders_user_id ON orders(user_id);
    CREATE INDEX IF NOT EXISTS idx_cart_items_user_id ON cart_items(user_id);
    CREATE INDEX IF NOT EXISTS idx_auth_sessions_user_id ON auth_sessions(user_id);
    CREATE INDEX IF NOT EXISTS idx_email_verification_user_id ON email_verification_tokens(user_id);
  `);
};

ensureSchema();


const productImages = {
  "PRD-001": "https://images.unsplash.com/photo-1556656793-08538906a9f8?w=600&h=400&fit=crop", // iPhone
  "PRD-002": "https://images.unsplash.com/photo-1511707267537-b85faf00021e?w=600&h=400&fit=crop", // iPhone
  "PRD-003": "https://images.unsplash.com/photo-1592286927505-1def25e646c3?w=600&h=400&fit=crop", // iPhone
  "PRD-004": "https://images.unsplash.com/photo-1610945415295-d9bbf7ce3350?w=600&h=400&fit=crop", // Samsung
  "PRD-005": "https://images.unsplash.com/photo-1511454612769-582b42cd861b?w=600&h=400&fit=crop", // Samsung
  "PRD-006": "https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=600&h=400&fit=crop", // Google Pixel
  "PRD-007": "https://images.unsplash.com/photo-1586253408b8-c835f289193d?w=600&h=400&fit=crop", // Google Pixel
  "PRD-008": "https://images.unsplash.com/photo-1511946556909-4fdcd32f5486?w=600&h=400&fit=crop", // OnePlus
  "PRD-009": "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&h=400&fit=crop", // Xiaomi
  "PRD-010": "https://images.unsplash.com/photo-1606933248051-5ce98a655d3a?w=600&h=400&fit=crop", // Sony
  "PRD-011": "https://images.unsplash.com/photo-1561154464-4f26b6d1a8e5?w=600&h=400&fit=crop", // iPad Pro
  "PRD-012": "https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=600&h=400&fit=crop", // iPad
  "PRD-013": "https://images.unsplash.com/photo-1451544908441-8c89e6fc32ba?w=600&h=400&fit=crop", // iPad
  "PRD-014": "https://images.unsplash.com/photo-1591290619180-6f4ee915583e?w=600&h=400&fit=crop", // Samsung Tab
  "PRD-015": "https://images.unsplash.com/photo-1526401485004-efc9a16130f0?w=600&h=400&fit=crop", // Tablet
  "PRD-016": "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&h=400&fit=crop", // Apple Watch Ultra
  "PRD-017": "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&h=400&fit=crop", // Apple Watch
  "PRD-018": "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&h=400&fit=crop", // Samsung Watch
  "PRD-019": "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&h=400&fit=crop", // Garmin Watch
  "PRD-020": "https://images.unsplash.com/photo-1575311373937-040b3ff6141d?w=600&h=400&fit=crop", // Fitbit
  "PRD-021": "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&h=400&fit=crop", // Sony Headphones
  "PRD-022": "https://images.unsplash.com/photo-1484704849700-f032a568e944?w=600&h=400&fit=crop", // AirPods
  "PRD-023": "https://images.unsplash.com/photo-1487215078519-e21cc028cb29?w=600&h=400&fit=crop", // Bose
  "PRD-024": "https://images.unsplash.com/photo-1484704849700-f032a568e944?w=600&h=400&fit=crop", // Samsung Earbuds
  "PRD-025": "https://images.unsplash.com/photo-1487215078519-e21cc028cb29?w=600&h=400&fit=crop", // Jabra
  "PRD-026": "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=600&h=400&fit=crop", // MacBook Pro
  "PRD-027": "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=600&h=400&fit=crop", // MacBook Pro
  "PRD-028": "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=600&h=400&fit=crop", // MacBook Air
  "PRD-029": "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=600&h=400&fit=crop", // MacBook Air
  "PRD-030": "https://images.unsplash.com/photo-1588872657360-891a270be529?w=600&h=400&fit=crop", // Dell XPS
  "PRD-031": "https://images.unsplash.com/photo-1559056199-641a0ac8b3f4?w=600&h=400&fit=crop", // ThinkPad
  "PRD-032": "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&h=400&fit=crop", // Gaming Laptop
  "PRD-033": "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&h=400&fit=crop", // Gaming Laptop
  "PRD-034": "https://images.unsplash.com/photo-1593642632823-8f785ba67e45?w=600&h=400&fit=crop", // Gaming Desktop
  "PRD-035": "https://images.unsplash.com/photo-1593642632823-8f785ba67e45?w=600&h=400&fit=crop", // Mac Mini
  "PRD-036": "https://images.unsplash.com/photo-1593642632823-8f785ba67e45?w=600&h=400&fit=crop", // Mac Studio
  "PRD-037": "https://images.unsplash.com/photo-1593642632823-8f785ba67e45?w=600&h=400&fit=crop", // Gaming PC
  "PRD-038": "https://images.unsplash.com/photo-1585508161604-fb4b434f159f?w=600&h=400&fit=crop", // Steam Deck
  "PRD-039": "https://images.unsplash.com/photo-1586348943529-beaae6c28db9?w=600&h=400&fit=crop", // PS5
  "PRD-040": "https://images.unsplash.com/photo-1538481143081-39eb7a706810?w=600&h=400&fit=crop", // Xbox
  "PRD-041": "https://images.unsplash.com/photo-1552820728-8ac41f1ce891?w=600&h=400&fit=crop", // Nintendo Switch
  "PRD-042": "https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?w=600&h=400&fit=crop", // DualSense
  "PRD-043": "https://images.unsplash.com/photo-1487215078519-e21cc028cb29?w=600&h=400&fit=crop", // Gaming Headset
  "PRD-044": "https://images.unsplash.com/photo-1593642632367-c7da7e35141f?w=600&h=400&fit=crop", // Monitor
  "PRD-045": "https://images.unsplash.com/photo-1593642632367-c7da7e35141f?w=600&h=400&fit=crop", // Monitor
  "PRD-046": "https://images.unsplash.com/photo-1527814050087-3793815479db?w=600&h=400&fit=crop", // Gaming Mouse
  "PRD-047": "https://images.unsplash.com/photo-1587829191301-4b433b714bd1?w=600&h=400&fit=crop", // Mechanical Keyboard
  "PRD-048": "https://images.unsplash.com/photo-1574158622682-e40e69881006?w=600&h=400&fit=crop", // Stream Deck
  "PRD-049": "https://images.unsplash.com/photo-1625948515291-69613efd103f?w=600&h=400&fit=crop", // Dock
  "PRD-050": "https://images.unsplash.com/photo-1487215078519-e21cc028cb29?w=600&h=400&fit=crop", // Headset
  "PRD-051": "https://images.unsplash.com/photo-1522869635100-ce306e08e5d2?w=600&h=400&fit=crop", // TV
  "PRD-052": "https://images.unsplash.com/photo-1522869635100-ce306e08e5d2?w=600&h=400&fit=crop", // TV OLED
  "PRD-053": "https://images.unsplash.com/photo-1522869635100-ce306e08e5d2?w=600&h=400&fit=crop", // TV QD-OLED
  "PRD-054": "https://images.unsplash.com/photo-1522869635100-ce306e08e5d2?w=600&h=400&fit=crop", // TV Mini-LED
  "PRD-055": "https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=600&h=400&fit=crop", // Soundbar
  "PRD-056": "https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=600&h=400&fit=crop", // Subwoofer
  "PRD-057": "https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=600&h=400&fit=crop", // Soundbar
  "PRD-058": "https://images.unsplash.com/photo-1574375927938-d5a98e8ffe85?w=600&h=400&fit=crop", // Projector
  "PRD-059": "https://images.unsplash.com/photo-1599394022918-6c2286d83d8a?w=600&h=400&fit=crop", // Apple TV
  "PRD-060": "https://images.unsplash.com/photo-1599394022918-6c2286d83d8a?w=600&h=400&fit=crop", // Fire Stick
  "PRD-061": "https://images.unsplash.com/photo-1599394022918-6c2286d83d8a?w=600&h=400&fit=crop", // Chromecast
  "PRD-062": "https://images.unsplash.com/photo-1599394022918-6c2286d83d8a?w=600&h=400&fit=crop", // Shield TV
  "PRD-063": "https://images.unsplash.com/photo-1606986628025-35d57e735ae0?w=600&h=400&fit=crop", // Canon Camera
  "PRD-064": "https://images.unsplash.com/photo-1606986628025-35d57e735ae0?w=600&h=400&fit=crop", // Sony Camera
  "PRD-065": "https://images.unsplash.com/photo-1606986628025-35d57e735ae0?w=600&h=400&fit=crop", // Fujifilm
  "PRD-066": "https://images.unsplash.com/photo-1609034227505-5876f6aa4e90?w=600&h=400&fit=crop", // DJI Pocket
  "PRD-067": "https://images.unsplash.com/photo-1521047878217-2b06adf00af8?w=600&h=400&fit=crop", // GoPro
  "PRD-068": "https://images.unsplash.com/photo-1589003077984-894e133814c9?w=600&h=400&fit=crop", // HomePod
  "PRD-069": "https://images.unsplash.com/photo-1589003077984-894e133814c9?w=600&h=400&fit=crop", // HomePod mini
  "PRD-070": "https://images.unsplash.com/photo-1543269953-cbf86e604388?w=600&h=400&fit=crop", // Nest Hub
  "PRD-071": "https://images.unsplash.com/photo-1543269953-cbf86e604388?w=600&h=400&fit=crop", // Echo Show
  "PRD-072": "https://images.unsplash.com/photo-1552820728-8ac41f1ce891?w=600&h=400&fit=crop", // Smart Bulb
  "PRD-073": "https://images.unsplash.com/photo-1535016120754-fd58615ceef5?w=600&h=400&fit=crop", // Security Camera
  "PRD-074": "https://images.unsplash.com/photo-1527814050087-3793815479db?w=600&h=400&fit=crop", // Mouse
  "PRD-075": "https://images.unsplash.com/photo-1587829191301-4b433b714bd1?w=600&h=400&fit=crop", // Keyboard
  "PRD-076": "https://images.unsplash.com/photo-1593642632367-c7da7e35141f?w=600&h=400&fit=crop", // Monitor
  "PRD-077": "https://images.unsplash.com/photo-1574158622682-e40e69881006?w=600&h=400&fit=crop", // Desk Lamp
  "PRD-078": "https://images.unsplash.com/photo-1616763355603-9755a640a287?w=600&h=400&fit=crop", // Webcam
  "PRD-079": "https://images.unsplash.com/photo-1639156122415-be7d2d5b0a13?w=600&h=400&fit=crop", // Vision Pro
  "PRD-080": "https://images.unsplash.com/photo-1506240577866-86580773e655?w=600&h=400&fit=crop", // DJI Drone
  "PRD-081": "https://images.unsplash.com/photo-1584622446473-0f3e5f1dd275?w=600&h=400&fit=crop", // E-Scooter
  "PRD-082": "https://images.unsplash.com/photo-1552820728-8ac41f1ce891?w=600&h=400&fit=crop", // PSVR2
  "PRD-083": "https://images.unsplash.com/photo-1609091839311-d5365f9ff1c5?w=600&h=400&fit=crop", // Power Bank
  "PRD-084": "https://images.unsplash.com/photo-1609091839311-d5365f9ff1c5?w=600&h=400&fit=crop", // USB Charger
  "PRD-085": "https://images.unsplash.com/photo-1609091839311-d5365f9ff1c5?w=600&h=400&fit=crop", // Charging Station
  "PRD-086": "https://images.unsplash.com/photo-1597872200969-2b65d56bd16b?w=600&h=400&fit=crop", // SSD
  "PRD-087": "https://images.unsplash.com/photo-1597872200969-2b65d56bd16b?w=600&h=400&fit=crop", // SSD
};



const realProducts = [
  { id: "PRD-001", name: "Apple iPhone 15 Pro", brand: "Apple", category: "Mobile & Wearables", subCategory: "Smartphones", price: 1199990, originalPrice: 1319988, rating: 4.9, reviewCount: 128, description: "Titanium design with A17 Pro chip and a pro-grade triple camera system.", isFeatured: 1, isNewArrival: 1, tags: "iphone,smartphone,apple,ios,5g,titanium", specs: JSON.stringify({ Display: "6.1-inch Super Retina XDR OLED", Chip: "A17 Pro", Storage: "256GB", Camera: "48MP main + 12MP ultra-wide + 12MP 3× tele" }), stock: 45 },
  { id: "PRD-002", name: "Apple iPhone 15", brand: "Apple", category: "Mobile & Wearables", subCategory: "Smartphones", price: 959880, originalPrice: 1055988, rating: 4.8, reviewCount: 95, description: "Colorful iPhone with Dynamic Island and the capable A16 Bionic chip.", isFeatured: 1, isNewArrival: 0, tags: "iphone,smartphone,apple,ios,dynamic-island", specs: JSON.stringify({ Display: "6.1-inch OLED", Chip: "A16 Bionic", Storage: "128GB" }), stock: 60 },
  { id: "PRD-003", name: "Apple iPhone 14", brand: "Apple", category: "Mobile & Wearables", subCategory: "Smartphones", price: 779880, originalPrice: 899988, rating: 4.7, reviewCount: 210, description: "Reliable A15 Bionic powerhouse with excellent dual cameras.", isFeatured: 0, isNewArrival: 0, tags: "iphone,smartphone,apple,ios", specs: JSON.stringify({ Display: "6.1-inch OLED", Chip: "A15 Bionic", Storage: "128GB" }), stock: 70 },
  { id: "PRD-004", name: "Samsung Galaxy S24 Ultra", brand: "Samsung", category: "Mobile & Wearables", subCategory: "Smartphones", price: 1559988, originalPrice: 1699988, rating: 4.8, reviewCount: 112, description: "AI-powered Android flagship with built-in S Pen and 200MP camera.", isFeatured: 1, isNewArrival: 1, tags: "samsung,smartphone,android,spen,flagship,ai", specs: JSON.stringify({ Display: "6.8-inch AMOLED 2X", Chip: "Snapdragon 8 Gen 3", Storage: "256GB", Camera: "200MP main" }), stock: 35 },
  { id: "PRD-005", name: "Samsung Galaxy S24+", brand: "Samsung", category: "Mobile & Wearables", subCategory: "Smartphones", price: 1199880, originalPrice: 1319988, rating: 4.7, reviewCount: 98, description: "Large screen Galaxy with Galaxy AI and 50MP triple camera.", isFeatured: 0, isNewArrival: 1, tags: "samsung,smartphone,android,galaxy,ai", specs: JSON.stringify({ Display: "6.7-inch Dynamic AMOLED", Chip: "Snapdragon 8 Gen 3", Storage: "256GB" }), stock: 40 },
  { id: "PRD-006", name: "Google Pixel 8 Pro", brand: "Google", category: "Mobile & Wearables", subCategory: "Smartphones", price: 1078800, originalPrice: 1199988, rating: 4.7, reviewCount: 88, description: "The ultimate Android camera phone with seven years of updates.", isFeatured: 0, isNewArrival: 0, tags: "google,pixel,smartphone,android,camera,ai", specs: JSON.stringify({ Display: "6.7-inch LTPO OLED", Chip: "Tensor G3", Storage: "128GB" }), stock: 40 },
  { id: "PRD-007", name: "Google Pixel 8a", brand: "Google", category: "Mobile & Wearables", subCategory: "Smartphones", price: 719880, originalPrice: 779988, rating: 4.6, reviewCount: 74, description: "Affordable Pixel with Tensor G3 and Magic Eraser intelligence.", isFeatured: 0, isNewArrival: 1, tags: "google,pixel,smartphone,android,affordable", specs: JSON.stringify({ Display: "6.1-inch OLED 120Hz", Chip: "Tensor G3", Storage: "128GB" }), stock: 55 },
  { id: "PRD-008", name: "OnePlus 12", brand: "OnePlus", category: "Mobile & Wearables", subCategory: "Smartphones", price: 959880, originalPrice: 1079988, rating: 4.6, reviewCount: 76, description: "Flagship killer with 100W SUPERVOOC charging and Hasselblad cameras.", isFeatured: 0, isNewArrival: 1, tags: "oneplus,smartphone,android,charging,hasselblad", specs: JSON.stringify({ Display: "6.7-inch AMOLED 120Hz", Chip: "Snapdragon 8 Gen 3", Charging: "100W wired + 50W wireless" }), stock: 50 },
  { id: "PRD-009", name: "Xiaomi 14 Ultra", brand: "Xiaomi", category: "Mobile & Wearables", subCategory: "Smartphones", price: 1199880, originalPrice: 1319988, rating: 4.7, reviewCount: 63, description: "Photography-focused flagship with Leica optics and 90W charging.", isFeatured: 1, isNewArrival: 1, tags: "xiaomi,smartphone,android,leica,photography", specs: JSON.stringify({ Display: "6.73-inch AMOLED 120Hz", Chip: "Snapdragon 8 Gen 3", Camera: "Leica 1-inch sensor main" }), stock: 28 },
  { id: "PRD-010", name: "Sony Xperia 1 VI", brand: "Sony", category: "Mobile & Wearables", subCategory: "Smartphones", price: 1319880, originalPrice: 1439988, rating: 4.5, reviewCount: 47, description: "Cinematic display with variable telephoto for video creators.", isFeatured: 0, isNewArrival: 1, tags: "sony,smartphone,android,video,creator", specs: JSON.stringify({ Display: "6.5-inch 4K OLED 120Hz", Chip: "Snapdragon 8 Gen 3", Camera: "Variable tele 85–170mm" }), stock: 22 },
  { id: "PRD-011", name: "Apple iPad Pro 13-inch M4", brand: "Apple", category: "Mobile & Wearables", subCategory: "Tablets", price: 1679880, originalPrice: 1799988, rating: 4.9, reviewCount: 104, description: "Impossibly thin iPad Pro with Ultra Retina XDR tandem OLED.", isFeatured: 1, isNewArrival: 1, tags: "ipad,tablet,apple,m4,oled,creative", specs: JSON.stringify({ Display: "13-inch Ultra Retina XDR OLED", Chip: "M4", Storage: "256GB" }), stock: 25 },
  { id: "PRD-012", name: "Apple iPad Pro 11-inch M4", brand: "Apple", category: "Mobile & Wearables", subCategory: "Tablets", price: 1199880, originalPrice: 1319988, rating: 4.8, reviewCount: 89, description: "Portable powerhouse with M4 chip in a lightweight 11-inch form.", isFeatured: 0, isNewArrival: 1, tags: "ipad,tablet,apple,m4,portable", specs: JSON.stringify({ Display: "11-inch Ultra Retina XDR OLED", Chip: "M4", Storage: "256GB" }), stock: 30 },
  { id: "PRD-013", name: "Apple iPad Air M2", brand: "Apple", category: "Mobile & Wearables", subCategory: "Tablets", price: 899880, originalPrice: 959988, rating: 4.7, reviewCount: 76, description: "Versatile iPad Air now available in 11 and 13-inch sizes.", isFeatured: 0, isNewArrival: 1, tags: "ipad,tablet,apple,m2,versatile", specs: JSON.stringify({ Display: "11-inch Liquid Retina", Chip: "M2", Storage: "128GB" }), stock: 40 },
  { id: "PRD-014", name: "Samsung Galaxy Tab S9 Ultra", brand: "Samsung", category: "Mobile & Wearables", subCategory: "Tablets", price: 1439988, originalPrice: 1559988, rating: 4.7, reviewCount: 92, description: "Massive 14.6-inch AMOLED tablet perfect for media and multitasking.", isFeatured: 0, isNewArrival: 0, tags: "samsung,tablet,android,spen,display", specs: JSON.stringify({ Display: "14.6-inch Dynamic AMOLED", Chip: "Snapdragon 8 Gen 2", Storage: "128GB" }), stock: 25 },
  { id: "PRD-015", name: "Samsung Galaxy Tab S9 FE", brand: "Samsung", category: "Mobile & Wearables", subCategory: "Tablets", price: 599880, originalPrice: 659988, rating: 4.5, reviewCount: 64, description: "Fan edition Galaxy Tab with S Pen included at a great price.", isFeatured: 0, isNewArrival: 0, tags: "samsung,tablet,android,spen,value", specs: JSON.stringify({ Display: "10.9-inch TFT LCD", Chip: "Exynos 1380", Storage: "128GB" }), stock: 50 },
  { id: "PRD-016", name: "Apple Watch Ultra 2", brand: "Apple", category: "Mobile & Wearables", subCategory: "Smartwatches", price: 959880, originalPrice: 1079988, rating: 4.8, reviewCount: 87, description: "Rugged titanium smartwatch built for extreme sports and adventure.", isFeatured: 1, isNewArrival: 0, tags: "watch,smartwatch,apple,fitness,sport,rugged", specs: JSON.stringify({ Display: "49mm Retina LTPO", Battery: "36 hours", Water: "100m depth rating" }), stock: 35 },
  { id: "PRD-017", name: "Apple Watch Series 9 45mm", brand: "Apple", category: "Mobile & Wearables", subCategory: "Smartwatches", price: 479880, originalPrice: 539988, rating: 4.6, reviewCount: 78, description: "Smarter, brighter Apple Watch with double-tap gesture control.", isFeatured: 0, isNewArrival: 0, tags: "watch,smartwatch,apple,health,gesture", specs: JSON.stringify({ Display: "45mm Retina LTPO", Battery: "18 hours", Health: "ECG, Blood Oxygen, Temperature" }), stock: 45 },
  { id: "PRD-018", name: "Samsung Galaxy Watch 7", brand: "Samsung", category: "Mobile & Wearables", subCategory: "Smartwatches", price: 479880, originalPrice: 539988, rating: 4.5, reviewCount: 65, description: "Galaxy AI-powered health coach on your wrist.", isFeatured: 0, isNewArrival: 1, tags: "samsung,watch,smartwatch,android,ai,health", specs: JSON.stringify({ Display: "44mm AMOLED", Battery: "40 hours", AI: "Galaxy AI Health Coach" }), stock: 40 },
  { id: "PRD-019", name: "Garmin Forerunner 965", brand: "Garmin", category: "Mobile & Wearables", subCategory: "Smartwatches", price: 719880, originalPrice: 779988, rating: 4.8, reviewCount: 112, description: "Premium GPS running watch with AMOLED display and 31-day battery.", isFeatured: 1, isNewArrival: 0, tags: "garmin,watch,gps,running,fitness,amoled", specs: JSON.stringify({ Display: "1.4-inch AMOLED", Battery: "31 days smartwatch mode", GPS: "Multi-band" }), stock: 30 },
  { id: "PRD-020", name: "Fitbit Sense 2", brand: "Fitbit", category: "Mobile & Wearables", subCategory: "Smartwatches", price: 239880, originalPrice: 299988, rating: 4.4, reviewCount: 94, description: "Advanced health smartwatch with stress management and ECG.", isFeatured: 0, isNewArrival: 0, tags: "fitbit,watch,health,stress,ecg,affordable", specs: JSON.stringify({ Display: "1.58-inch AMOLED", Battery: "6 days", Health: "Stress, ECG, SpO2, Skin Temp" }), stock: 55 },
  { id: "PRD-021", name: "Sony WH-1000XM5", brand: "Sony", category: "Mobile & Wearables", subCategory: "Audio", price: 477600, originalPrice: 539988, rating: 4.9, reviewCount: 142, description: "Industry-leading noise cancellation with 30-hour battery life.", isFeatured: 1, isNewArrival: 0, tags: "sony,headphones,audio,anc,wireless,over-ear", specs: JSON.stringify({ Type: "Over-ear", ANC: "8 microphones", Battery: "30 hours", Codec: "LDAC, AAC" }), stock: 50 },
  { id: "PRD-022", name: "Apple AirPods Pro 2 (USB-C)", brand: "Apple", category: "Mobile & Wearables", subCategory: "Audio", price: 299880, originalPrice: 359988, rating: 4.7, reviewCount: 118, description: "ANC earbuds with Adaptive Audio and Lossless Audio via Vision Pro.", isFeatured: 0, isNewArrival: 0, tags: "apple,airpods,audio,anc,spatial-audio,usbc", specs: JSON.stringify({ Type: "True Wireless IEM", ANC: "Adaptive", Battery: "6 hours (+24 case)", Chip: "H2" }), stock: 65 },
  { id: "PRD-023", name: "Bose QuietComfort 45", brand: "Bose", category: "Mobile & Wearables", subCategory: "Audio", price: 359880, originalPrice: 419988, rating: 4.7, reviewCount: 96, description: "Ultra-comfortable ANC headphones with legendary Bose sound.", isFeatured: 0, isNewArrival: 0, tags: "bose,headphones,anc,comfort,wireless", specs: JSON.stringify({ Type: "Over-ear", ANC: "Adjustable", Battery: "24 hours", Foldable: "Yes" }), stock: 45 },
  { id: "PRD-024", name: "Samsung Galaxy Buds3 Pro", brand: "Samsung", category: "Mobile & Wearables", subCategory: "Audio", price: 239880, originalPrice: 299988, rating: 4.6, reviewCount: 73, description: "Galaxy AI-powered earbuds with blade-tip design and lossless audio.", isFeatured: 0, isNewArrival: 1, tags: "samsung,earbuds,audio,anc,lossless,ai", specs: JSON.stringify({ Type: "True Wireless IEM", ANC: "Intelligent ANC", Battery: "6 hours (+21 case)", Codec: "SSC Ultra Lossless" }), stock: 55 },
  { id: "PRD-025", name: "Jabra Evolve2 75", brand: "Jabra", category: "Mobile & Wearables", subCategory: "Audio", price: 419880, originalPrice: 479988, rating: 4.6, reviewCount: 58, description: "Professional wireless headset built for office and remote work.", isFeatured: 0, isNewArrival: 0, tags: "jabra,headset,professional,anc,wireless,work", specs: JSON.stringify({ Type: "Over-ear", ANC: "Advanced Hybrid", Battery: "36 hours", Mic: "8-mic call technology" }), stock: 30 },
  { id: "PRD-026", name: "Apple MacBook Pro 16 M3 Max", brand: "Apple", category: "Computing & Gaming", subCategory: "Laptops", price: 2999880, originalPrice: 3299988, rating: 4.9, reviewCount: 135, description: "The most powerful MacBook Pro for pros with M3 Max chip.", isFeatured: 1, isNewArrival: 0, tags: "apple,laptop,m3,macbook,pro,development,video", specs: JSON.stringify({ CPU: "M3 Max (16-core)", GPU: "40-core GPU", RAM: "48GB", SSD: "1TB", Display: "16.2-inch Liquid Retina XDR" }), stock: 20 },
  { id: "PRD-027", name: "Apple MacBook Pro 14 M3", brand: "Apple", category: "Computing & Gaming", subCategory: "Laptops", price: 1919880, originalPrice: 2099988, rating: 4.9, reviewCount: 102, description: "Compact professional powerhouse with M3 Pro and stunning mini-LED.", isFeatured: 1, isNewArrival: 0, tags: "apple,laptop,m3,macbook,compact,pro", specs: JSON.stringify({ CPU: "M3 Pro (12-core)", RAM: "18GB", SSD: "512GB", Display: "14.2-inch Liquid Retina XDR" }), stock: 25 },
  { id: "PRD-028", name: "Apple MacBook Air 15 M3", brand: "Apple", category: "Computing & Gaming", subCategory: "Laptops", price: 1559880, originalPrice: 1679988, rating: 4.8, reviewCount: 88, description: "Biggest MacBook Air ever — huge display, fanless, all-day battery.", isFeatured: 0, isNewArrival: 1, tags: "apple,laptop,m3,macbook,air,large-screen", specs: JSON.stringify({ CPU: "M3 (8-core)", RAM: "8GB", SSD: "256GB", Display: "15.3-inch Liquid Retina" }), stock: 35 },
  { id: "PRD-029", name: "Apple MacBook Air 13 M3", brand: "Apple", category: "Computing & Gaming", subCategory: "Laptops", price: 1319880, originalPrice: 1439988, rating: 4.8, reviewCount: 120, description: "Lightweight, fanless daily driver with all-day battery and M3 speed.", isFeatured: 0, isNewArrival: 0, tags: "apple,laptop,m3,macbook,air,ultrabook", specs: JSON.stringify({ CPU: "M3 (8-core)", RAM: "8GB", SSD: "256GB", Display: "13.6-inch Liquid Retina" }), stock: 40 },
  { id: "PRD-030", name: "Dell XPS 15 (2024)", brand: "Dell", category: "Computing & Gaming", subCategory: "Laptops", price: 2099880, originalPrice: 2299988, rating: 4.7, reviewCount: 89, description: "Premium Windows ultrabook with stunning 4K OLED touch display.", isFeatured: 1, isNewArrival: 0, tags: "dell,laptop,xps,windows,oled,4k,premium", specs: JSON.stringify({ CPU: "Intel Core Ultra 7", GPU: "RTX 4060", RAM: "16GB", SSD: "512GB", Display: "15.6-inch 4K OLED Touch" }), stock: 20 },
  { id: "PRD-031", name: "Lenovo ThinkPad X1 Carbon Gen 12", brand: "Lenovo", category: "Computing & Gaming", subCategory: "Laptops", price: 1919880, originalPrice: 2099988, rating: 4.7, reviewCount: 67, description: "Business ultrabook with legendary keyboard and military-grade durability.", isFeatured: 0, isNewArrival: 1, tags: "lenovo,thinkpad,laptop,business,durability,ultrabook", specs: JSON.stringify({ CPU: "Intel Core Ultra 7", RAM: "16GB", SSD: "512GB", Display: "14-inch IPS 2.8K", Weight: "1.12kg" }), stock: 22 },
  { id: "PRD-032", name: "Razer Blade 16 (RTX 4090)", brand: "Razer", category: "Computing & Gaming", subCategory: "Laptops", price: 3959880, originalPrice: 4319988, rating: 4.8, reviewCount: 76, description: "Desktop-class RTX 4090 in a sleek 16-inch gaming laptop chassis.", isFeatured: 1, isNewArrival: 1, tags: "razer,laptop,gaming,rtx4090,rgb,beast", specs: JSON.stringify({ CPU: "Intel i9-14900HX", GPU: "RTX 4090 175W", RAM: "32GB DDR5", SSD: "2TB", Display: "16-inch mini-LED 240Hz" }), stock: 15 },
  { id: "PRD-033", name: "Asus ROG Zephyrus G16", brand: "Asus", category: "Computing & Gaming", subCategory: "Laptops", price: 2639880, originalPrice: 2879988, rating: 4.7, reviewCount: 58, description: "Ultra-slim gaming laptop with OLED display and RTX 4080.", isFeatured: 0, isNewArrival: 1, tags: "asus,rog,laptop,gaming,oled,slim,rtx4080", specs: JSON.stringify({ CPU: "Intel Core Ultra 9", GPU: "RTX 4080", RAM: "16GB DDR5", SSD: "1TB", Display: "16-inch OLED 240Hz" }), stock: 18 },
  { id: "PRD-034", name: "Asus ROG Strix GT15 Gaming Desktop", brand: "Asus", category: "Computing & Gaming", subCategory: "Desktop PCs", price: 2399880, originalPrice: 2699988, rating: 4.7, reviewCount: 94, description: "High-performance gaming desktop with RTX 4080 Super and RGB.", isFeatured: 1, isNewArrival: 0, tags: "asus,desktop,gaming,rog,rgb,rtx4080", specs: JSON.stringify({ CPU: "Intel i9-14900K", GPU: "RTX 4080 Super 16GB", RAM: "32GB DDR5", Storage: "2TB NVMe + 2TB HDD" }), stock: 18 },
  { id: "PRD-035", name: "Apple Mac Mini M4", brand: "Apple", category: "Computing & Gaming", subCategory: "Desktop PCs", price: 599880, originalPrice: 659988, rating: 4.8, reviewCount: 88, description: "The most affordable Mac ever with the powerful M4 chip.", isFeatured: 1, isNewArrival: 1, tags: "apple,mac,desktop,m4,compact,affordable", specs: JSON.stringify({ Chip: "M4 (10-core CPU, 10-core GPU)", RAM: "16GB", SSD: "256GB", Ports: "3× USB-C Thunderbolt 4, 2× USB-A" }), stock: 35 },
  { id: "PRD-036", name: "Apple Mac Studio M2 Ultra", brand: "Apple", category: "Computing & Gaming", subCategory: "Desktop PCs", price: 3959880, originalPrice: 4319988, rating: 4.9, reviewCount: 56, description: "Workstation-class performance for 3D, video and ML professionals.", isFeatured: 0, isNewArrival: 0, tags: "apple,mac,workstation,m2,ultra,professional", specs: JSON.stringify({ Chip: "M2 Ultra (24-core CPU, 76-core GPU)", RAM: "64GB", SSD: "1TB", Ports: "6× Thunderbolt 4" }), stock: 10 },
  { id: "PRD-037", name: "MSI MEG Aegis Ti5 Gaming PC", brand: "MSI", category: "Computing & Gaming", subCategory: "Desktop PCs", price: 4799880, originalPrice: 5279988, rating: 4.6, reviewCount: 42, description: "Monster gaming tower with RTX 4090 and liquid cooling.", isFeatured: 0, isNewArrival: 0, tags: "msi,desktop,gaming,rtx4090,liquid-cooling", specs: JSON.stringify({ CPU: "Intel i9-14900K", GPU: "RTX 4090 24GB", RAM: "64GB DDR5", Storage: "4TB NVMe" }), stock: 8 },
  { id: "PRD-038", name: "Steam Deck OLED 1TB", brand: "Valve", category: "Computing & Gaming", subCategory: "Gaming", price: 779880, originalPrice: 899988, rating: 4.9, reviewCount: 156, description: "Handheld PC gaming with a gorgeous HDR OLED screen and long battery.", isFeatured: 1, isNewArrival: 1, tags: "steam,handheld,gaming,pc,oled,portable", specs: JSON.stringify({ Display: "7.4-inch OLED HDR 90Hz", CPU: "Zen 2 APU", Storage: "1TB NVMe", Battery: "50Whr" }), stock: 30 },
  { id: "PRD-039", name: "PlayStation 5 Slim", brand: "Sony", category: "Computing & Gaming", subCategory: "Gaming", price: 539880, originalPrice: 599988, rating: 4.9, reviewCount: 234, description: "Slimmer PS5 with detachable disc drive and 1TB SSD.", isFeatured: 1, isNewArrival: 0, tags: "playstation,ps5,console,gaming,sony", specs: JSON.stringify({ CPU: "8-core Zen 2", GPU: "Custom RDNA 2 10.3 TFLOPS", Storage: "1TB NVMe SSD", Output: "4K 120fps, 8K" }), stock: 40 },
  { id: "PRD-040", name: "Xbox Series X", brand: "Microsoft", category: "Computing & Gaming", subCategory: "Gaming", price: 539880, originalPrice: 599988, rating: 4.8, reviewCount: 198, description: "The most powerful Xbox ever with 12 teraflops and 4K at 120fps.", isFeatured: 0, isNewArrival: 0, tags: "xbox,microsoft,console,gaming,4k", specs: JSON.stringify({ CPU: "8-core Zen 2 3.8GHz", GPU: "12 TFLOPS RDNA 2", Storage: "1TB NVMe SSD", Output: "4K 120fps, 8K HDR" }), stock: 35 },
  { id: "PRD-041", name: "Nintendo Switch OLED", brand: "Nintendo", category: "Computing & Gaming", subCategory: "Gaming", price: 359880, originalPrice: 419988, rating: 4.7, reviewCount: 312, description: "Versatile hybrid console with a large vibrant OLED screen.", isFeatured: 0, isNewArrival: 0, tags: "nintendo,switch,console,handheld,portable,family", specs: JSON.stringify({ Display: "7-inch OLED", Battery: "4.5–9 hours", Modes: "TV, Tabletop, Handheld" }), stock: 60 },
  { id: "PRD-042", name: "PlayStation 5 DualSense Edge", brand: "Sony", category: "Computing & Gaming", subCategory: "Gaming", price: 239880, originalPrice: 299988, rating: 4.7, reviewCount: 87, description: "Pro-level DualSense with customizable back buttons and trigger stops.", isFeatured: 0, isNewArrival: 0, tags: "playstation,controller,pro,dualsense,gaming", specs: JSON.stringify({ Features: "Haptic, Adaptive triggers, Remappable back buttons, Trigger stops", Battery: "Up to 12 hours" }), stock: 45 },
  { id: "PRD-043", name: "Astro A50 X Wireless Headset", brand: "Astro", category: "Computing & Gaming", subCategory: "Gaming", price: 479880, originalPrice: 539988, rating: 4.6, reviewCount: 74, description: "Multi-platform wireless headset for PlayStation, Xbox and PC.", isFeatured: 0, isNewArrival: 1, tags: "astro,headset,gaming,wireless,dolby-atmos,multi-platform", specs: JSON.stringify({ Audio: "Dolby Atmos", Battery: "24 hours", Platforms: "PS5, Xbox, PC, Mac" }), stock: 28 },
  { id: "PRD-044", name: "LG UltraGear 27-inch OLED 240Hz", brand: "LG", category: "Computing & Gaming", subCategory: "Accessories", price: 1079880, originalPrice: 1199988, rating: 4.8, reviewCount: 84, description: "Lightning-fast OLED gaming monitor with 0.03ms response time.", isFeatured: 1, isNewArrival: 1, tags: "lg,monitor,oled,240hz,gaming,1440p", specs: JSON.stringify({ Size: "27-inch", Panel: "OLED", Resolution: "2560×1440", Refresh: "240Hz", Response: "0.03ms" }), stock: 22 },
  { id: "PRD-045", name: "Samsung 32-inch Odyssey OLED G8", brand: "Samsung", category: "Computing & Gaming", subCategory: "Accessories", price: 1199880, originalPrice: 1319988, rating: 4.7, reviewCount: 62, description: "4K OLED curved gaming monitor with 175Hz and smart TV features.", isFeatured: 0, isNewArrival: 1, tags: "samsung,monitor,oled,curved,4k,175hz", specs: JSON.stringify({ Size: "32-inch", Panel: "OLED", Resolution: "3840×2160 4K", Refresh: "175Hz", Curve: "1800R" }), stock: 18 },
  { id: "PRD-046", name: "Logitech G Pro X Superlight 2", brand: "Logitech", category: "Computing & Gaming", subCategory: "Accessories", price: 179880, originalPrice: 219988, rating: 4.8, reviewCount: 92, description: "57g wireless precision gaming mouse with HERO 2 sensor.", isFeatured: 0, isNewArrival: 0, tags: "logitech,mouse,gaming,wireless,lightweight,esports", specs: JSON.stringify({ Weight: "57g", Sensor: "HERO 2 (25600 DPI)", Battery: "95 hours", Connection: "LIGHTSPEED 2.4GHz" }), stock: 65 },
  { id: "PRD-047", name: "Keychron Q1 Pro Mechanical Keyboard", brand: "Keychron", category: "Computing & Gaming", subCategory: "Accessories", price: 239880, originalPrice: 299988, rating: 4.9, reviewCount: 78, description: "Premium custom wireless mechanical keyboard with CNC aluminum body.", isFeatured: 1, isNewArrival: 0, tags: "keychron,keyboard,mechanical,wireless,aluminum,custom", specs: JSON.stringify({ Layout: "75% TKL", Switches: "Keychron K Pro (hot-swap)", Material: "CNC Aluminum", Battery: "4000mAh" }), stock: 45 },
  { id: "PRD-048", name: "Elgato Stream Deck MK.2", brand: "Elgato", category: "Computing & Gaming", subCategory: "Accessories", price: 179880, originalPrice: 219988, rating: 4.8, reviewCount: 118, description: "15 LCD key command deck for streamers, creators and power users.", isFeatured: 0, isNewArrival: 0, tags: "elgato,streamdeck,creator,streaming,productivity", specs: JSON.stringify({ Keys: "15 customizable LCD keys", Connection: "USB-C", Software: "Stream Deck App", Compatibility: "Windows, macOS" }), stock: 50 },
  { id: "PRD-049", name: "CalDigit TS4 Thunderbolt 4 Dock", brand: "CalDigit", category: "Computing & Gaming", subCategory: "Accessories", price: 479880, originalPrice: 559988, rating: 4.8, reviewCount: 67, description: "The ultimate 18-port Thunderbolt 4 dock for Mac and PC.", isFeatured: 1, isNewArrival: 0, tags: "caldigit,dock,thunderbolt,productivity,usbc,hub", specs: JSON.stringify({ Ports: "18 total (3× TB4, 5× USB-A, SD, audio…)", DisplaySupport: "Dual 6K", Data: "40Gbps", PowerDelivery: "98W" }), stock: 28 },
  { id: "PRD-050", name: "SteelSeries Arctis Nova Pro Wireless", brand: "SteelSeries", category: "Computing & Gaming", subCategory: "Accessories", price: 359880, originalPrice: 419988, rating: 4.7, reviewCount: 93, description: "Dual-wireless gaming headset with hot-swap battery and ANC.", isFeatured: 0, isNewArrival: 0, tags: "steelseries,headset,gaming,wireless,anc,dual-wireless", specs: JSON.stringify({ Audio: "Hi-Res certified 40mm drivers", ANC: "Active Noise Cancelling", Battery: "Hot-swap, unlimited play", Platforms: "PC, PS5, Switch" }), stock: 35 },
  { id: "PRD-051", name: "Samsung 85-inch QN90D Neo QLED", brand: "Samsung", category: "Home Entertainment", subCategory: "Televisions", price: 2999880, originalPrice: 3299988, rating: 4.8, reviewCount: 67, description: "Brilliant Neo QLED TV with AI-upscaling and 144Hz gaming mode.", isFeatured: 1, isNewArrival: 1, tags: "samsung,tv,qled,85inch,4k,gaming,ai", specs: JSON.stringify({ Size: "85-inch", Panel: "Neo QLED", Resolution: "4K", Refresh: "144Hz", HDR: "Quantum HDR 32X" }), stock: 8 },
  { id: "PRD-052", name: "LG 77-inch G4 OLED evo", brand: "LG", category: "Home Entertainment", subCategory: "Televisions", price: 2399880, originalPrice: 2699988, rating: 4.9, reviewCount: 95, description: "Stunning Gallery OLED with infinite contrast and MLA brightness.", isFeatured: 1, isNewArrival: 1, tags: "lg,tv,oled,77inch,4k,gallery,hdr", specs: JSON.stringify({ Size: "77-inch", Panel: "OLED evo MLA", Resolution: "4K", Refresh: "144Hz", HDR: "Dolby Vision IQ" }), stock: 10 },
  { id: "PRD-053", name: "Sony 65-inch A95L QD-OLED", brand: "Sony", category: "Home Entertainment", subCategory: "Televisions", price: 1919880, originalPrice: 2159988, rating: 4.9, reviewCount: 78, description: "QD-OLED panel with Sony's unmatched Cognitive Processor XR.", isFeatured: 0, isNewArrival: 0, tags: "sony,tv,qd-oled,65inch,4k,cognitive,xr", specs: JSON.stringify({ Size: "65-inch", Panel: "QD-OLED", Resolution: "4K", HDR: "XR Triluminos Pro", Processor: "Cognitive Processor XR" }), stock: 12 },
  { id: "PRD-054", name: "TCL 75-inch QM8 Mini-LED", brand: "TCL", category: "Home Entertainment", subCategory: "Televisions", price: 959880, originalPrice: 1079988, rating: 4.6, reviewCount: 142, description: "Massive 75-inch 4K Mini-LED TV with Dolby Vision and 144Hz at great value.", isFeatured: 0, isNewArrival: 0, tags: "tcl,tv,mini-led,75inch,4k,value,dolby", specs: JSON.stringify({ Size: "75-inch", Panel: "Mini-LED QLED", Resolution: "4K", Refresh: "144Hz", HDR: "Dolby Vision IQ" }), stock: 20 },
  { id: "PRD-055", name: "Sonos Arc Soundbar", brand: "Sonos", category: "Home Entertainment", subCategory: "Home Theater", price: 719880, originalPrice: 799988, rating: 4.8, reviewCount: 96, description: "Premium Dolby Atmos soundbar with spatial audio and AirPlay 2.", isFeatured: 1, isNewArrival: 0, tags: "sonos,soundbar,dolby-atmos,home-theater,wifi", specs: JSON.stringify({ Channels: "3.0 (11 drivers)", Audio: "Dolby Atmos, DTS:X", Connectivity: "HDMI eARC, Optical, WiFi", Voice: "Amazon Alexa, Google, Sonos Voice" }), stock: 25 },
  { id: "PRD-056", name: "Sonos Sub Gen 3", brand: "Sonos", category: "Home Entertainment", subCategory: "Home Theater", price: 959880, originalPrice: 1079988, rating: 4.7, reviewCount: 64, description: "Wireless subwoofer that pairs with any Sonos system for deep bass.", isFeatured: 0, isNewArrival: 0, tags: "sonos,subwoofer,bass,wireless,home-theater", specs: JSON.stringify({ Driver: "Dual force-canceling woofers", Connection: "WiFi", Pairing: "Any Sonos system" }), stock: 20 },
  { id: "PRD-057", name: "Samsung HW-Q990D 11.1.4ch Soundbar", brand: "Samsung", category: "Home Entertainment", subCategory: "Home Theater", price: 1439880, originalPrice: 1599988, rating: 4.7, reviewCount: 48, description: "Immersive 11.1.4ch Dolby Atmos soundbar with wireless rear speakers.", isFeatured: 0, isNewArrival: 1, tags: "samsung,soundbar,dolby-atmos,11ch,wireless-rears", specs: JSON.stringify({ Channels: "11.1.4", Audio: "Dolby Atmos, DTS:X Pro", Subwoofer: "Wireless", Rears: "Wireless rear speakers included" }), stock: 12 },
  { id: "PRD-058", name: "Epson EH-TW9400 4K Projector", brand: "Epson", category: "Home Entertainment", subCategory: "Home Theater", price: 2399880, originalPrice: 2699988, rating: 4.7, reviewCount: 38, description: "True 4K home cinema projector with HDR and 2600 lumens.", isFeatured: 0, isNewArrival: 0, tags: "epson,projector,4k,hdr,home-cinema", specs: JSON.stringify({ Resolution: "4K PRO-UHD (3840×2160)", Brightness: "2600 lumens", HDR: "HDR10+, HLG", Throw: "1.35:1 to 2.84:1" }), stock: 8 },
  { id: "PRD-059", name: "Apple TV 4K (3rd gen Wi-Fi + Ethernet)", brand: "Apple", category: "Home Entertainment", subCategory: "Streaming", price: 179880, originalPrice: 219988, rating: 4.7, reviewCount: 58, description: "Fastest Apple TV with A15 chip, thread networking and Dolby Vision.", isFeatured: 0, isNewArrival: 0, tags: "apple,streaming,4k,airplay,dolby-vision", specs: JSON.stringify({ Output: "4K HDR Dolby Vision", Processor: "A15 Bionic", Storage: "64GB", Audio: "Dolby Atmos", Networking: "Wi-Fi 6 + Ethernet" }), stock: 50 },
  { id: "PRD-060", name: "Amazon Fire TV Stick 4K Max (2nd gen)", brand: "Amazon", category: "Home Entertainment", subCategory: "Streaming", price: 59880, originalPrice: 79988, rating: 4.6, reviewCount: 312, description: "Budget 4K streaming stick with Wi-Fi 6E and ambient display mode.", isFeatured: 0, isNewArrival: 0, tags: "amazon,firetv,streaming,4k,wifi6e,affordable", specs: JSON.stringify({ Output: "4K Ultra HD", WiFi: "Wi-Fi 6E", HDR: "Dolby Vision, HDR10+, HLG", Remote: "Alexa Voice Remote" }), stock: 100 },
  { id: "PRD-061", name: "Google Chromecast with Google TV 4K", brand: "Google", category: "Home Entertainment", subCategory: "Streaming", price: 59880, originalPrice: 79988, rating: 4.5, reviewCount: 234, description: "Turn any TV smart with Google TV and Google Assistant built-in.", isFeatured: 0, isNewArrival: 0, tags: "google,chromecast,streaming,4k,googletv", specs: JSON.stringify({ Output: "4K HDR", HDR: "Dolby Vision, HDR10+", OS: "Google TV", Remote: "Google TV Remote" }), stock: 80 },
  { id: "PRD-062", name: "Nvidia Shield TV Pro", brand: "Nvidia", category: "Home Entertainment", subCategory: "Streaming", price: 239880, originalPrice: 279988, rating: 4.8, reviewCount: 96, description: "Most powerful Android TV streamer with AI upscaling and Dolby Atmos.", isFeatured: 1, isNewArrival: 0, tags: "nvidia,shield,streaming,4k,ai-upscaling,android-tv", specs: JSON.stringify({ Output: "4K HDR AI upscaling", Chip: "Tegra X1+", Storage: "16GB", Ports: "2× USB 3.0, Gigabit Ethernet" }), stock: 30 },
  { id: "PRD-063", name: "Canon EOS R5 Mark II", brand: "Canon", category: "Smart Home & Photography", subCategory: "Cameras", price: 3359880, originalPrice: 3699988, rating: 4.9, reviewCount: 112, description: "45MP professional mirrorless with 8K RAW video and IBIS.", isFeatured: 1, isNewArrival: 1, tags: "canon,camera,mirrorless,professional,8k,45mp", specs: JSON.stringify({ Sensor: "45MP Full Frame CMOS", Video: "8K RAW / 4K 120fps", Stabilisation: "In-body 8-stop IBIS", AF: "Dual Pixel CMOS AF II" }), stock: 12 },
  { id: "PRD-064", name: "Sony a7R V", brand: "Sony", category: "Smart Home & Photography", subCategory: "Cameras", price: 2879880, originalPrice: 3179988, rating: 4.8, reviewCount: 98, description: "61MP high-resolution mirrorless with AI-driven autofocus.", isFeatured: 1, isNewArrival: 0, tags: "sony,camera,mirrorless,61mp,ai,highres", specs: JSON.stringify({ Sensor: "61MP BSI Full Frame", AF: "AI Autofocus 693 points", Video: "4K 60fps", Stabilisation: "5-axis IBIS" }), stock: 14 },
  { id: "PRD-065", name: "Fujifilm X100VI", brand: "Fujifilm", category: "Smart Home & Photography", subCategory: "Cameras", price: 1199880, originalPrice: 1319988, rating: 4.9, reviewCount: 156, description: "Iconic compact fixed-lens camera with 40MP sensor and IBIS.", isFeatured: 1, isNewArrival: 1, tags: "fujifilm,camera,compact,fixed-lens,40mp,ibis,street", specs: JSON.stringify({ Sensor: "40MP X-Trans CMOS 5 HR", Lens: "23mm f/2 (35mm equiv)", IBIS: "6-stop", Video: "6.2K 30fps" }), stock: 20 },
  { id: "PRD-066", name: "DJI Osmo Pocket 3", brand: "DJI", category: "Smart Home & Photography", subCategory: "Cameras", price: 479880, originalPrice: 539988, rating: 4.7, reviewCount: 88, description: "Pocket-size 3-axis gimbal camera with 1-inch CMOS and 4K 120fps.", isFeatured: 0, isNewArrival: 1, tags: "dji,osmo,pocket,gimbal,4k,vlog,creator", specs: JSON.stringify({ Sensor: "1-inch CMOS", Video: "4K 120fps", Gimbal: "3-axis motorized", Display: "2-inch touchscreen" }), stock: 35 },
  { id: "PRD-067", name: "GoPro HERO12 Black", brand: "GoPro", category: "Smart Home & Photography", subCategory: "Cameras", price: 479880, originalPrice: 539988, rating: 4.6, reviewCount: 102, description: "Rugged action camera with 5.3K video and improved HyperSmooth 6.0.", isFeatured: 0, isNewArrival: 0, tags: "gopro,action,camera,waterproof,5.3k,sport", specs: JSON.stringify({ Video: "5.3K 60fps", Stabilisation: "HyperSmooth 6.0", Waterproof: "10m without housing", Battery: "Enduro battery" }), stock: 50 },
  { id: "PRD-068", name: "Apple HomePod 2nd Generation", brand: "Apple", category: "Smart Home & Photography", subCategory: "Smart Home", price: 299880, originalPrice: 359988, rating: 4.7, reviewCount: 76, description: "Full-size smart speaker with room-sensing spatial audio and S7 chip.", isFeatured: 0, isNewArrival: 0, tags: "apple,homepod,smart-speaker,spatial-audio,homekit", specs: JSON.stringify({ Speaker: "5 tweeters + 4-inch woofer", Chip: "S7", Voice: "Siri", Home: "Apple Home hub" }), stock: 35 },
  { id: "PRD-069", name: "Apple HomePod mini", brand: "Apple", category: "Smart Home & Photography", subCategory: "Smart Home", price: 79880, originalPrice: 99988, rating: 4.6, reviewCount: 95, description: "Compact smart speaker with 360-degree audio and intercom features.", isFeatured: 0, isNewArrival: 0, tags: "apple,homepod,mini,smart-speaker,homekit", specs: JSON.stringify({ Speaker: "360-degree audio", Chip: "S5", Voice: "Siri", Home: "Thread, UWB" }), stock: 55 },
  { id: "PRD-070", name: "Google Nest Hub Max", brand: "Google", category: "Smart Home & Photography", subCategory: "Smart Home", price: 179880, originalPrice: 219988, rating: 4.5, reviewCount: 82, description: "10-inch smart display with video calling, YouTube and home control.", isFeatured: 0, isNewArrival: 0, tags: "google,nest,smart-display,video-calling,homeautomation", specs: JSON.stringify({ Display: "10-inch touchscreen", Camera: "6.2MP", Voice: "Google Assistant", Smart: "Matter, Zigbee hub" }), stock: 35 },
  { id: "PRD-071", name: "Amazon Echo Show 10 (3rd gen)", brand: "Amazon", category: "Smart Home & Photography", subCategory: "Smart Home", price: 239880, originalPrice: 279988, rating: 4.5, reviewCount: 118, description: "Motion-tracking smart display that automatically follows you around.", isFeatured: 0, isNewArrival: 0, tags: "amazon,echo,alexa,smart-display,motion,homeautomation", specs: JSON.stringify({ Display: "10.1-inch HD", Camera: "13MP motorized 350° rotation", Voice: "Alexa", Smart: "Zigbee, Matter hub" }), stock: 30 },
  { id: "PRD-072", name: "Philips Hue Starter Kit (4 bulbs + Bridge)", brand: "Philips", category: "Smart Home & Photography", subCategory: "Smart Home", price: 179880, originalPrice: 219988, rating: 4.7, reviewCount: 234, description: "Smart LED lighting starter kit with millions of colours and automations.", isFeatured: 0, isNewArrival: 0, tags: "philips,hue,smart-lighting,led,rgb,homeautomation", specs: JSON.stringify({ Bulbs: "4× A19 E27 White & Colour Ambiance", Bridge: "Hue Bridge v2", Protocols: "Zigbee, Matter", Lumens: "800lm per bulb" }), stock: 60 },
  { id: "PRD-073", name: "Arlo Pro 5S 2K Outdoor Camera", brand: "Arlo", category: "Smart Home & Photography", subCategory: "Smart Home", price: 299880, originalPrice: 359988, rating: 4.6, reviewCount: 78, description: "Wire-free 2K outdoor security camera with colour night vision.", isFeatured: 0, isNewArrival: 1, tags: "arlo,security,camera,outdoor,wireless,2k,night-vision", specs: JSON.stringify({ Resolution: "2K HDR", Night: "Colour night vision", Audio: "2-way", Power: "Rechargeable + solar compatible", Weather: "IP65" }), stock: 40 },
  { id: "PRD-074", name: "Logitech MX Master 3S", brand: "Logitech", category: "Smart Home & Photography", subCategory: "Office", price: 119880, originalPrice: 139988, rating: 4.8, reviewCount: 312, description: "Flagship ergonomic wireless mouse with MagSpeed scroll and 8K DPI.", isFeatured: 1, isNewArrival: 0, tags: "logitech,mouse,wireless,ergonomic,productivity,office", specs: JSON.stringify({ Sensor: "8000 DPI Darkfield", Battery: "70 days", Connection: "Logi Bolt + Bluetooth", Scroll: "MagSpeed electromagnetic" }), stock: 80 },
  { id: "PRD-075", name: "Logitech MX Keys S", brand: "Logitech", category: "Smart Home & Photography", subCategory: "Office", price: 119880, originalPrice: 139988, rating: 4.7, reviewCount: 198, description: "Premium backlit wireless keyboard for multi-device productivity.", isFeatured: 0, isNewArrival: 0, tags: "logitech,keyboard,wireless,backlit,productivity,office", specs: JSON.stringify({ Backlight: "Smart per-key backlighting", Battery: "10 days backlit / 5 months without", Devices: "3 device switch", Connection: "Logi Bolt + Bluetooth" }), stock: 70 },
  { id: "PRD-076", name: "Dell UltraSharp 27 4K USB-C Monitor", brand: "Dell", category: "Smart Home & Photography", subCategory: "Office", price: 719880, originalPrice: 799988, rating: 4.8, reviewCount: 94, description: "Colour-accurate 4K IPS monitor perfect for design and creative work.", isFeatured: 1, isNewArrival: 0, tags: "dell,monitor,4k,ultrasharp,usbc,colour-accurate,office", specs: JSON.stringify({ Size: "27-inch", Panel: "IPS Black", Resolution: "3840×2160 4K", Coverage: "99% sRGB, 99% Rec. 709", USB_C: "90W power delivery" }), stock: 28 },
  { id: "PRD-077", name: "BenQ ScreenBar Plus Monitor Light", brand: "BenQ", category: "Smart Home & Photography", subCategory: "Office", price: 119880, originalPrice: 149988, rating: 4.7, reviewCount: 156, description: "Asymmetric LED desk lamp that lights your workspace without screen glare.", isFeatured: 0, isNewArrival: 0, tags: "benq,screenbar,light,desk,office,monitor-lamp,ergonomics", specs: JSON.stringify({ Color_Temp: "2700K–6500K adjustable", Dimming: "0–100%", Control: "Wireless dial controller", Power: "USB from monitor" }), stock: 65 },
  { id: "PRD-078", name: "Anker PowerConf C300 Webcam", brand: "Anker", category: "Smart Home & Photography", subCategory: "Office", price: 59880, originalPrice: 79988, rating: 4.6, reviewCount: 112, description: "1080p AI-framing webcam with noise-cancelling mics for video calls.", isFeatured: 0, isNewArrival: 0, tags: "anker,webcam,1080p,ai-framing,mic,video-calls,office", specs: JSON.stringify({ Resolution: "1080p 60fps", FOV: "65°/78°/90° adjustable", Mic: "2× noise-cancelling", AI: "Auto-framing" }), stock: 60 },
  { id: "PRD-079", name: "Apple Vision Pro", brand: "Apple", category: "Miscellaneous", subCategory: "Wishlist Items", price: 3599880, originalPrice: null, rating: 4.6, reviewCount: 312, description: "Spatial computing headset that blends digital content with the real world.", isFeatured: 1, isNewArrival: 1, tags: "apple,visionpro,spatial-computing,ar,vr,mixed-reality", specs: JSON.stringify({ Display: "Micro-OLED per eye (23M pixels)", Chip: "M2 + R1", Memory: "16GB", Storage: "256GB", Battery: "2–2.5 hours external" }), stock: 5 },
  { id: "PRD-080", name: "DJI Air 3 Drone", brand: "DJI", category: "Miscellaneous", subCategory: "Wishlist Items", price: 1199880, originalPrice: 1319988, rating: 4.8, reviewCount: 78, description: "Dual-camera drone with 46-min flight time and 4K 100fps main cam.", isFeatured: 1, isNewArrival: 1, tags: "dji,drone,aerial,4k,video,photography", specs: JSON.stringify({ Main: "4K 100fps 1/1.3-inch CMOS", Tele: "4K 60fps 3× zoom", Flight: "46 minutes", Range: "20km transmission" }), stock: 18 },
  { id: "PRD-081", name: "Segway Ninebot MAX G2 E-Scooter", brand: "Segway", category: "Miscellaneous", subCategory: "Wishlist Items", price: 719880, originalPrice: 799988, rating: 4.6, reviewCount: 64, description: "Long-range commuter e-scooter with 70km range and 25km/h top speed.", isFeatured: 0, isNewArrival: 1, tags: "segway,scooter,electric,commuter,urban", specs: JSON.stringify({ Range: "70km", Speed: "25km/h max", Motor: "450W nominal / 900W peak", Battery: "551Wh", Weight: "23kg" }), stock: 12 },
  { id: "PRD-082", name: "Sony PlayStation VR2", brand: "Sony", category: "Miscellaneous", subCategory: "Wishlist Items", price: 599880, originalPrice: 719988, rating: 4.5, reviewCount: 96, description: "Next-gen PS5 VR headset with foveated rendering and eye tracking.", isFeatured: 0, isNewArrival: 0, tags: "sony,psvr2,vr,playstation,eye-tracking,haptic", specs: JSON.stringify({ Display: "OLED 2000×2040 per eye", FOV: "110°", Tracking: "Eye tracking + 4 cameras", Features: "Adaptive triggers, haptic feedback" }), stock: 20 },
  { id: "PRD-083", name: "Anker 737 Power Bank 24000mAh", brand: "Anker", category: "Miscellaneous", subCategory: "Featured Deals", price: 179880, originalPrice: 219988, rating: 4.7, reviewCount: 134, description: "24,000mAh laptop-class power bank with 140W bi-directional USB-C.", isFeatured: 1, isNewArrival: 0, tags: "anker,powerbank,charging,portable,140w,laptop", specs: JSON.stringify({ Capacity: "24,000mAh", MaxOutput: "140W USB-C", Ports: "2× USB-C + 1× USB-A", Display: "LCD level indicator", Weight: "619g" }), stock: 80 },
  { id: "PRD-084", name: "Baseus 65W GaN USB-C Charger (3-port)", brand: "Baseus", category: "Miscellaneous", subCategory: "Featured Deals", price: 39880, originalPrice: 59988, rating: 4.6, reviewCount: 234, description: "Compact 65W GaN charger with 2× USB-C + 1× USB-A for all your devices.", isFeatured: 0, isNewArrival: 0, tags: "baseus,charger,gan,usbc,fast-charging,compact", specs: JSON.stringify({ Power: "65W max", Ports: "2× USB-C + 1× USB-A", Technology: "GaN III", Size: "Compact cube" }), stock: 120 },
  { id: "PRD-085", name: "Ugreen 200W 6-Port GaN Charging Station", brand: "Ugreen", category: "Miscellaneous", subCategory: "Featured Deals", price: 119880, originalPrice: 159988, rating: 4.8, reviewCount: 112, description: "Desktop charging station for 6 devices at once with 200W total output.", isFeatured: 1, isNewArrival: 1, tags: "ugreen,charger,gan,desktop,multi-port,200w", specs: JSON.stringify({ Power: "200W total", Ports: "4× USB-C + 2× USB-A", Technology: "GaN", Compatible: "MacBook Pro, iPad, iPhone, Samsung" }), stock: 60 },
  { id: "PRD-086", name: "SanDisk Extreme Pro 4TB Portable SSD", brand: "SanDisk", category: "Miscellaneous", subCategory: "Featured Deals", price: 479880, originalPrice: 559988, rating: 4.7, reviewCount: 88, description: "Rugged 4TB SSD with 2000MB/s speeds for creators on the go.", isFeatured: 0, isNewArrival: 1, tags: "sandisk,ssd,portable,4tb,fast,rugged,creator", specs: JSON.stringify({ Capacity: "4TB", Speed: "Up to 2000MB/s read", Connector: "USB-C 3.2 Gen 2×2", Durability: "IP55, 2m drop-proof" }), stock: 35 },
  { id: "PRD-087", name: "Samsung T9 4TB Portable SSD", brand: "Samsung", category: "Miscellaneous", subCategory: "Featured Deals", price: 419880, originalPrice: 479988, rating: 4.6, reviewCount: 76, description: "Ruggedized 4TB Samsung SSD with 2000MB/s and USB 3.2 Gen 2×2.", isFeatured: 0, isNewArrival: 0, tags: "samsung,ssd,portable,4tb,rugged,fast", specs: JSON.stringify({ Capacity: "4TB", Speed: "2000MB/s read / 1950MB/s write", Connector: "USB-C 3.2 Gen 2×2", Durability: "IP65, 3m drop-proof" }), stock: 30 },
];



const insertProduct = db.prepare(
  `INSERT INTO products (
    id, name, brand, category, subCategory,
    price, originalPrice, rating, reviewCount, description,
    isFeatured, isNewArrival, tags, specs, stock, image_url
  ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
);

db.exec(`
  DELETE FROM auth_sessions;
  DELETE FROM email_verification_tokens;
  DELETE FROM cart_items;
  DELETE FROM order_items;
  DELETE FROM orders;
  DELETE FROM products;
  DELETE FROM users;
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
    productImages[product.id] || "https://placehold.co/600x400/000000/FFFFFF?text=No+Image",
  );
}

console.log(`Seeded ${realProducts.length} products successfully with images.`);
db.close();
console.log("SQLite database closed.");
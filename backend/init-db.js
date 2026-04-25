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

  // Sample products for testing/demo.
  const sampleProducts = [
    [
      "iPhone 15",
      "Apple smartphone with high-performance camera and chip.",
      999.99,
      20,
      "https://example.com/images/iphone-15.jpg",
    ],
    [
      "MacBook Air M3",
      "Lightweight Apple laptop for school and daily productivity.",
      1299.99,
      10,
      "https://example.com/images/macbook-air-m3.jpg",
    ],
    [
      "Noise-Cancelling Headphones",
      "Wireless over-ear headphones with active noise cancellation.",
      199.99,
      35,
      "https://example.com/images/headphones.jpg",
    ],
  ];

  const insertProduct = db.prepare(`
    INSERT OR IGNORE INTO products (name, description, price, stock, image_url)
    VALUES (?, ?, ?, ?, ?);
  `);

  sampleProducts.forEach((product) => {
    insertProduct.run(product);
  });

  insertProduct.finalize((finalizeError) => {
    if (finalizeError) {
      console.error("Error inserting sample products:", finalizeError.message);
      process.exitCode = 1;
      return;
    }
    console.log("Database initialized and sample gadgets inserted.");
  });
});

db.close((closeError) => {
  if (closeError) {
    console.error("Error closing database:", closeError.message);
    process.exit(1);
  }
  console.log("Database connection closed.");
});

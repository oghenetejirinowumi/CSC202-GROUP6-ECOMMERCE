const fs = require("fs");
const path = require("path");
const express = require("express");
const cors = require("cors");
const bcrypt = require("bcrypt");
const { DatabaseSync: Database } = require("node:sqlite");
require("dotenv").config();

const app = express();
const PORT = Number(process.env.PORT) || 50000;
const FRONTEND_ORIGIN = process.env.FRONTEND_ORIGIN || "http://localhost:3000";

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
console.log(`SQLite database ready at ${dbPath}`);

app.use(
  cors({
    origin: FRONTEND_ORIGIN,
    methods: ["GET", "POST"],
    credentials: false,
  })
);
app.use(express.json());

app.get("/", (_req, res) => {
  res.json({ message: "Gadget Store API is running." });
});

app.get("/api/products", (_req, res) => {
  try {
    const rows = db.prepare("SELECT * FROM Product ORDER BY id ASC").all();
    return res.status(200).json(rows);
  } catch (_error) {
    return res.status(500).json({ error: "Failed to fetch products." });
  }
});

app.post("/api/register", async (req, res) => {
  const { username, email, password } = req.body;

  if (!username || !email || !password) {
    return res
      .status(400)
      .json({ error: "username, email, and password are required." });
  }

  try {
    const passwordHash = await bcrypt.hash(password, 10);
    const info = db
      .prepare(
        "INSERT INTO User (username, password_hash, email) VALUES (?, ?, ?)"
      )
      .run(username, passwordHash, email);

    return res.status(201).json({
      message: "User registered successfully.",
      userId: info.lastInsertRowid,
    });
  } catch (error) {
    if (
      error?.code === "SQLITE_CONSTRAINT" ||
      String(error?.message || "").includes("UNIQUE")
    ) {
      return res.status(409).json({ error: "Username or email already exists." });
    }
    return res.status(500).json({ error: "Failed to register user." });
  }
});

app.post("/api/login", async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: "email and password are required." });
  }

  try {
    const userRow = db
      .prepare(
        "SELECT id, username, email, password_hash FROM User WHERE email = ?"
      )
      .get(email);

    if (!userRow) {
      return res.status(401).json({ error: "Invalid email or password." });
    }

    const passwordMatches = await bcrypt.compare(password, userRow.password_hash);
    if (!passwordMatches) {
      return res.status(401).json({ error: "Invalid email or password." });
    }

    return res.status(200).json({
      message: "Login successful.",
      user: {
        id: userRow.id,
        username: userRow.username,
        email: userRow.email,
      },
    });
  } catch (_error) {
    return res.status(500).json({ error: "Failed to process login." });
  }
});

app.get("/api/orders/:id", (req, res) => {
  const orderId = Number(req.params.id);

  if (!Number.isInteger(orderId) || orderId <= 0) {
    return res.status(400).json({ error: "Order id must be a positive integer." });
  }

  try {
    const order = db
      .prepare(
        `SELECT o.id, o.userId, o.total, o.date, u.username, u.email
         FROM "Order" o
         LEFT JOIN User u ON o.userId = u.id
         WHERE o.id = ?`
      )
      .get(orderId);

    if (!order) {
      return res.status(404).json({ error: "Order not found." });
    }

    const items = db
      .prepare(
        `SELECT oi.id, oi.productId, p.name AS product_name, oi.quantity, oi.price_at_purchase
         FROM OrderItem oi
         LEFT JOIN Product p ON oi.productId = p.id
         WHERE oi.orderId = ?
         ORDER BY oi.id ASC`
      )
      .all(orderId);

    const itemRows = items.map((it) => ({
      id: it.id,
      product_id: it.productId,
      product_name: it.product_name ?? null,
      quantity: it.quantity,
      price_at_purchase: it.price_at_purchase,
    }));

    return res.status(200).json({
      order: {
        id: order.id,
        user_id: order.userId,
        total: order.total,
        date: order.date,
        username: order.username ?? null,
        email: order.email ?? null,
      },
      items: itemRows,
    });
  } catch (_error) {
    return res.status(500).json({ error: "Failed to fetch order." });
  }
});

app.post("/api/orders", (req, res) => {
  const { user_id, items } = req.body;

  const userId = Number(user_id);

  if (
    !Number.isInteger(userId) ||
    userId <= 0 ||
    !Array.isArray(items) ||
    items.length === 0
  ) {
    return res
      .status(400)
      .json({ error: "user_id and non-empty items array are required." });
  }

  const normalizedItems = [];
  for (const item of items) {
    const productId = String(item.product_id || "").trim();
    const quantity = Number(item.quantity);

    if (!productId || !Number.isInteger(quantity) || quantity <= 0) {
      return res.status(400).json({
        error: "Each item must include valid product_id and quantity > 0.",
      });
    }

    normalizedItems.push({ product_id: productId, quantity });
  }

  try {
    const userRow = db.prepare("SELECT id FROM User WHERE id = ?").get(userId);
    if (!userRow) {
      return res.status(400).json({ error: "Invalid user_id." });
    }

    const productIds = normalizedItems.map((i) => i.product_id);
    const placeholders = productIds.map(() => "?").join(", ");
    const products = db
      .prepare(`SELECT id, price, stock FROM Product WHERE id IN (${placeholders})`)
      .all(...productIds);

    const productMap = new Map(products.map((p) => [p.id, p]));

    let total = 0;
    const orderLines = [];

    for (const item of normalizedItems) {
      const dbProduct = productMap.get(item.product_id);

      if (!dbProduct) {
        return res.status(400).json({
          error: `Product ${item.product_id} does not exist.`,
        });
      }

      if (dbProduct.stock < item.quantity) {
        return res.status(400).json({
          error: `Not enough stock for product ${item.product_id}.`,
        });
      }

      total += dbProduct.price * item.quantity;
      orderLines.push({
        product_id: item.product_id,
        quantity: item.quantity,
        price_at_purchase: dbProduct.price,
      });
    }

    total = Number(total.toFixed(2));

    db.exec("BEGIN");
    try {
      const orderInfo = db.prepare(`INSERT INTO "Order" (userId, total, date) VALUES (?, ?, datetime('now'))`).run(userId, total);
      const orderId = Number(orderInfo.lastInsertRowid);
      
      for (const line of orderLines) {
        db.prepare("INSERT INTO OrderItem (orderId, productId, quantity, price_at_purchase) VALUES (?, ?, ?, ?)").run(orderId, line.product_id, line.quantity, line.price_at_purchase);
        db.prepare("UPDATE Product SET stock = stock - ? WHERE id = ?").run(line.quantity, line.product_id);
      }
      
      db.exec("COMMIT");
      
      return res.status(201).json({ message: "Order created successfully.", orderId, total, items: orderLines });
    } catch (err) {
      db.exec("ROLLBACK");
      return res.status(500).json({ error: "Failed while saving order items." });
    }

    const orderId = createOrder(userId, orderLines, total);

    return res.status(201).json({
      message: "Order created successfully.",
      orderId,
      total,
      items: orderLines,
    });
  } catch (_error) {
    return res.status(500).json({ error: "Failed while saving order items." });
  }
});

const server = app.listen(PORT, () => {
  console.log(`API server running on http://localhost:${PORT}`);
});

server.on("error", (error) => {
  if (error.code === "EADDRINUSE") {
    console.error(
      `Port ${PORT} is already in use. Start with another port, e.g. PORT=50001 pnpm start`
    );
    process.exit(1);
  }

  console.error("Server startup error:", error.message);
  process.exit(1);
});

process.on("SIGINT", () => {
  db.close();
  console.log("\nSQLite database closed. Server stopped.");
  process.exit(0);
});

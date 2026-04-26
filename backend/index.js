const path = require("path");
const express = require("express");
const cors = require("cors");
const bcrypt = require("bcrypt");
const sqlite3 = require("sqlite3").verbose();

const app = express();
const PORT = 5000;

// Keep CORS strict by default (frontend dev server), but configurable via env.
const allowedOrigin = process.env.FRONTEND_ORIGIN || "http://localhost:3000";

app.use(
  cors({
    origin: allowedOrigin,
    methods: ["GET", "POST"],
    credentials: false,
  })
);
app.use(express.json());

// Connect to the existing SQLite database file.
const dbPath = path.join(__dirname, "data", "gadget-store.db");
const db = new sqlite3.Database(dbPath, (error) => {
  if (error) {
    console.error("Failed to connect to SQLite database:", error.message);
    process.exit(1);
  }
  console.log(`Connected to SQLite database at: ${dbPath}`);
});

// Health check route (useful for quick browser checks).
app.get("/", (_req, res) => {
  res.json({ message: "Gadget Store API is running." });
});

// GET /api/products
// Returns all products from the products table.
app.get("/api/products", (_req, res) => {
  const sql = "SELECT * FROM products ORDER BY id ASC";

  db.all(sql, [], (error, rows) => {
    if (error) {
      return res.status(500).json({ error: "Failed to fetch products." });
    }
    return res.status(200).json(rows);
  });
});

// POST /api/register
// Accepts username, email, password; hashes the password; stores user.
app.post("/api/register", async (req, res) => {
  const { username, email, password } = req.body;

  if (!username || !email || !password) {
    return res
      .status(400)
      .json({ error: "username, email, and password are required." });
  }

  try {
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    const sql =
      "INSERT INTO users (username, password_hash, email) VALUES (?, ?, ?)";

    db.run(sql, [username, passwordHash, email], function onInsert(error) {
      if (error) {
        // UNIQUE constraint failures are common for duplicate username/email.
        if (error.message.includes("UNIQUE")) {
          return res
            .status(409)
            .json({ error: "Username or email already exists." });
        }
        return res.status(500).json({ error: "Failed to register user." });
      }

      return res.status(201).json({
        message: "User registered successfully.",
        userId: this.lastID,
      });
    });
  } catch (error) {
    return res.status(500).json({ error: "Failed to hash password." });
  }
});

// POST /api/orders
// Accepts user_id and total, then creates a new order row.
app.post("/api/orders", (req, res) => {
  const { user_id, total } = req.body;

  if (!user_id || typeof total !== "number") {
    return res
      .status(400)
      .json({ error: "user_id and numeric total are required." });
  }

  const sql = "INSERT INTO orders (user_id, total) VALUES (?, ?)";

  db.run(sql, [user_id, total], function onInsert(error) {
    if (error) {
      // Foreign key failure usually means user_id does not exist.
      if (error.message.includes("FOREIGN KEY")) {
        return res.status(400).json({ error: "Invalid user_id." });
      }
      return res.status(500).json({ error: "Failed to create order." });
    }

    return res.status(201).json({
      message: "Order created successfully.",
      orderId: this.lastID,
    });
  });
});

app.listen(PORT, () => {
  console.log(`API server running on http://localhost:${PORT}`);
});


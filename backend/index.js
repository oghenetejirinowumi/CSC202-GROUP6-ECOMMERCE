// backend/index.js
const fs = require("fs");
const path = require("path");
const express = require("express");
const cors = require("cors");
const bcrypt = require("bcrypt");
const sqlite3 = require("sqlite3").verbose();

const app = express();
const PORT = Number(process.env.PORT) || 50000;
const FRONTEND_ORIGIN = process.env.FRONTEND_ORIGIN || "http://localhost:3000";
const dbPath = path.join(__dirname, "data", "gadget-store.db");

app.use(
  cors({
    origin: FRONTEND_ORIGIN,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
    credentials: false,
  })
);
app.use(express.json());

if (!fs.existsSync(dbPath)) {
  console.error(`Database not found at: ${dbPath}`);
  console.error("Run `pnpm run init-db` first, then restart the API.");
  process.exit(1);
}

const db = new sqlite3.Database(dbPath, (error) => {
  if (error) {
    console.error("Failed to connect to SQLite database:", error.message);
    process.exit(1);
  }
  console.log(`Connected to SQLite database at: ${dbPath}`);
});

const ensureCartSchema = () => {
  db.run("PRAGMA foreign_keys = OFF;"); // 🌟 Turn off strict foreign key constraints so Guest ID 0 doesn't crash on users table lookup
  db.run(`
    CREATE TABLE IF NOT EXISTS cart_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id TEXT NOT NULL,          -- Changed to TEXT to support generic identifiers
      product_id TEXT NOT NULL,       -- 🌟 Changed to TEXT to match your string IDs (like "172")
      quantity INTEGER NOT NULL CHECK (quantity > 0),
      updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      UNIQUE (user_id, product_id)
    );
  `);
};

ensureCartSchema();

const fetchCartItems = (userId, callback) => {
  db.all(
    `
      SELECT
        ci.id,
        ci.user_id,
        ci.product_id,
        ci.quantity,
        ci.updated_at,
        p.name AS product_name,
        p.description,
        p.price,
        p.stock,
        p.image_url
      FROM cart_items ci
      JOIN products p ON p.id = ci.product_id
      WHERE ci.user_id = ?
      ORDER BY ci.updated_at DESC
    `,
    [String(userId)],
    (error, rows) => {
      if (error) {
        callback(error);
        return;
      }

      const items = rows.map((row) => ({
        id: row.id,
        user_id: row.user_id,
        product_id: row.product_id,
        quantity: row.quantity,
        updated_at: row.updated_at,
        product: {
          name: row.product_name,
          description: row.description,
          price: row.price,
          stock: row.stock,
          image_url: row.image_url,
        },
        line_total: Number((row.price * row.quantity).toFixed(2)),
      }));

      const subtotal = Number(
        items.reduce((sum, item) => sum + item.line_total, 0).toFixed(2)
      );
      const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

      callback(null, { user_id: userId, item_count: itemCount, subtotal, items });
    }
  );
};

app.get("/", (_req, res) => {
  res.json({ message: "Gadget Store API is running." });
});

app.get("/api/products", (_req, res) => {
  db.all("SELECT * FROM products ORDER BY id ASC", [], (error, rows) => {
    if (error) {
      return res.status(500).json({ error: "Failed to fetch products." });
    }
    return res.status(200).json(rows);
  });
});

// 1. Load cart endpoint (Defaults to guest layout automatically)
app.get("/api/cart/:userId", (req, res) => {
  const userId = req.params.userId || "guest";

  fetchCartItems(userId, (cartError, cart) => {
    if (cartError) {
      return res.status(500).json({ error: "Failed to fetch cart data layers." });
    }
    return res.status(200).json(cart);
  });
});

// 2. Add product endpoint (Handles string product IDs perfectly)
app.post("/api/cart", (req, res) => {
  const { user_id, product_id, quantity } = req.body;
  const userId = user_id || "guest"; // 🌟 Fallback to 'guest' text profile if undefined
  const productId = String(product_id);

  if (!productId || productId.trim() === "" || productId === "undefined") {
    return res.status(400).json({ error: "A valid product_id string parameter is required." });
  }

  const addQuantity = Number(quantity) || 1;

  db.get(
    "SELECT id, stock FROM products WHERE id = ?",
    [productId],
    (productError, productRow) => {
      if (productError) {
        return res.status(500).json({ error: "Database error validating product context." });
      }

      if (!productRow) {
        return res.status(404).json({ error: `Product target context matching ID "${productId}" not found.` });
      }

      db.get(
        "SELECT id, quantity FROM cart_items WHERE user_id = ? AND product_id = ?",
        [userId, productId],
        (cartError, cartRow) => {
          if (cartError) {
            return res.status(500).json({ error: "Failed to scan existing table indexes." });
          }

          const nextQuantity = cartRow ? cartRow.quantity + addQuantity : addQuantity;

          if (nextQuantity > productRow.stock) {
            return res.status(400).json({
              error: `Not enough stock available. Maximum allocation threshold limit is ${productRow.stock}.`,
            });
          }

          const saveCartItem = () => {
            fetchCartItems(userId, (fetchError, cart) => {
              if (fetchError) {
                return res.status(500).json({ error: "Failed to parse synchronized collection structures." });
              }
              return res.status(cartRow ? 200 : 201).json({
                message: "Cart operational data index update completed successfully.",
                cart,
              });
            });
          };

          if (cartRow) {
            db.run(
              "UPDATE cart_items SET quantity = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?",
              [nextQuantity, cartRow.id],
              (updateError) => {
                if (updateError) return res.status(500).json({ error: "Failed to increment index quantity context rows." });
                saveCartItem();
              }
            );
            return;
          }

          db.run(
            "INSERT INTO cart_items (user_id, product_id, quantity) VALUES (?, ?, ?)",
            [userId, productId, addQuantity],
            (insertError) => {
              if (insertError) return res.status(500).json({ error: "Failed to execute row data stream initialization." });
              saveCartItem();
            }
          );
        }
      );
    }
  );
});

// 3. Update active item rows (PUT handler configuration values)
app.put("/api/cart", (req, res) => {
  const { user_id, product_id, quantity } = req.body;
  const userId = user_id || "guest";
  const productId = String(product_id);

  const nextQuantity = Number(quantity);
  if (!Number.isInteger(nextQuantity) || nextQuantity < 0) {
    return res.status(400).json({ error: "Quantity must be a positive tracking index counter integer." });
  }

  if (nextQuantity === 0) {
    db.run(
      "DELETE FROM cart_items WHERE user_id = ? AND product_id = ?",
      [userId, productId],
      function onDelete(deleteError) {
        if (deleteError) return res.status(500).json({ error: "Failed to purge targeted array dataset row." });
        
        fetchCartItems(userId, (fetchError, cart) => {
          if (fetchError) return res.status(500).json({ error: "Failed to compute clean fallback layout values." });
          return res.status(200).json({ message: "Cart item deleted.", cart });
        });
      }
    );
    return;
  }

  db.get(
    "SELECT stock FROM products WHERE id = ?",
    [productId],
    (productError, productRow) => {
      if (!productRow) return res.status(404).json({ error: "Product matrix target mapping reference mismatch." });

      if (nextQuantity > productRow.stock) {
        return res.status(400).json({ error: `Allocation threshold limit hit. Current safe stock capacity cap is ${productRow.stock}.` });
      }

      db.run(
        "UPDATE cart_items SET quantity = ?, updated_at = CURRENT_TIMESTAMP WHERE user_id = ? AND product_id = ?",
        [nextQuantity, userId, productId],
        function onUpdate(updateError) {
          if (updateError) return res.status(500).json({ error: "Database execution target error encountered." });

          fetchCartItems(userId, (fetchError, cart) => {
            if (fetchError) return res.status(500).json({ error: "Failed to compile clean state array payloads." });
            return res.status(200).json({ message: "Quantity tracking variables modified cleanly.", cart });
          });
        }
      );
    }
  );
});

// 4. Delete individual data streams
app.delete("/api/cart/:userId/:productId", (req, res) => {
  const userId = req.params.userId || "guest";
  const productId = String(req.params.productId);

  db.run(
    "DELETE FROM cart_items WHERE user_id = ? AND product_id = ?",
    [userId, productId],
    function onDelete(deleteError) {
      if (deleteError) return res.status(500).json({ error: "Failed to drop specific data entry pointer." });

      fetchCartItems(userId, (fetchError, cart) => {
        if (fetchError) return res.status(500).json({ error: "State parsing payload recovery error." });
        return res.status(200).json({ message: "Target element dropped.", cart });
      });
    }
  );
});

// 5. Order Execution Pipeline (Now safely processable with an optional or Guest User setup)
app.post("/api/orders", (req, res) => {
  const { user_id, items } = req.body;
  const userId = user_id || "guest"; // 🌟 Universal anonymous guest tracking string

  if (!Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ error: "A structured item parameters array data collection block payload is required." });
  }

  let total = 0;
  const orderLines = [];

  // Parse list map parameters
  for (const item of items) {
    orderLines.push({
      product_id: String(item.product_id),
      quantity: Number(item.quantity),
      price_at_purchase: Number(item.price || 0)
    });
    total += (Number(item.price || 0) * Number(item.quantity));
  }

  total = Number(total.toFixed(2));

  // Write transactional entry lines straight down to operations record tables
  db.run(
    "INSERT INTO orders (user_id, total) VALUES (?, ?)",
    [userId, total],
    function onOrderInsert(orderError) {
      if (orderError) return res.status(500).json({ error: "Failed to execute order master transaction index generation values." });

      const orderId = this.lastID;

      // Automatically wipe guest cart items once checkout completes successfully
      db.run("DELETE FROM cart_items WHERE user_id = ?", [userId], () => {
        return res.status(201).json({
          message: "Guest order processing layout loop pipeline executed cleanly!",
          orderId,
          total,
          items: orderLines,
        });
      });
    }
  );
});

const server = app.listen(PORT, () => {
  console.log(`API server running on http://localhost:${PORT}`);
});
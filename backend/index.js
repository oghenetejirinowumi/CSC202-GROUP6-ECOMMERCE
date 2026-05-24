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
  db.run("PRAGMA foreign_keys = ON;");
  db.run(`
    CREATE TABLE IF NOT EXISTS cart_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      product_id INTEGER NOT NULL,
      quantity INTEGER NOT NULL CHECK (quantity > 0),
      updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
      UNIQUE (user_id, product_id)
    );
  `);
};

ensureCartSchema();

const parsePositiveInt = (value, fieldName, res) => {
  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed <= 0) {
    res.status(400).json({ error: `${fieldName} must be a positive integer.` });
    return null;
  }
  return parsed;
};

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
    [userId],
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

app.post("/api/register", async (req, res) => {
  const { username, email, password } = req.body;

  if (!username || !email || !password) {
    return res
      .status(400)
      .json({ error: "username, email, and password are required." });
  }

  try {
    const passwordHash = await bcrypt.hash(password, 10);
    const sql =
      "INSERT INTO users (username, password_hash, email) VALUES (?, ?, ?)";

    db.run(sql, [username, passwordHash, email], function onInsert(error) {
      if (error) {
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
  } catch (_error) {
    return res.status(500).json({ error: "Failed to hash password." });
  }
});

app.post("/api/login", (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: "email and password are required." });
  }

  db.get(
    "SELECT id, username, email, password_hash FROM users WHERE email = ?",
    [email],
    async (error, userRow) => {
      if (error) {
        return res.status(500).json({ error: "Failed to process login." });
      }

      if (!userRow) {
        return res.status(401).json({ error: "Invalid email or password." });
      }

      try {
        const passwordMatches = await bcrypt.compare(
          password,
          userRow.password_hash
        );

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
      } catch (_compareError) {
        return res.status(500).json({ error: "Failed to process login." });
      }
    }
  );
});

// Returns the cart for a user, including product details and totals.
app.get("/api/cart/:userId", (req, res) => {
  const userId = parsePositiveInt(req.params.userId, "user id", res);
  if (userId === null) {
    return;
  }

  db.get("SELECT id FROM users WHERE id = ?", [userId], (userError, userRow) => {
    if (userError) {
      return res.status(500).json({ error: "Failed to validate user." });
    }

    if (!userRow) {
      return res.status(404).json({ error: "User not found." });
    }

    fetchCartItems(userId, (cartError, cart) => {
      if (cartError) {
        return res.status(500).json({ error: "Failed to fetch cart." });
      }

      return res.status(200).json(cart);
    });
  });
});

// Adds a product to the cart or increases quantity if it already exists.
app.post("/api/cart", (req, res) => {
  const { user_id, product_id, quantity } = req.body;
  const userId = parsePositiveInt(user_id, "user_id", res);
  if (userId === null) {
    return;
  }

  const productId = parsePositiveInt(product_id, "product_id", res);
  if (productId === null) {
    return;
  }

  const addQuantity = Number(quantity);
  if (!Number.isInteger(addQuantity) || addQuantity <= 0) {
    return res.status(400).json({ error: "quantity must be a positive integer." });
  }

  db.get("SELECT id FROM users WHERE id = ?", [userId], (userError, userRow) => {
    if (userError) {
      return res.status(500).json({ error: "Failed to validate user." });
    }

    if (!userRow) {
      return res.status(404).json({ error: "User not found." });
    }

    db.get(
      "SELECT id, stock FROM products WHERE id = ?",
      [productId],
      (productError, productRow) => {
        if (productError) {
          return res.status(500).json({ error: "Failed to validate product." });
        }

        if (!productRow) {
          return res.status(404).json({ error: "Product not found." });
        }

        db.get(
          "SELECT id, quantity FROM cart_items WHERE user_id = ? AND product_id = ?",
          [userId, productId],
          (cartError, cartRow) => {
            if (cartError) {
              return res.status(500).json({ error: "Failed to read cart item." });
            }

            const nextQuantity = cartRow ? cartRow.quantity + addQuantity : addQuantity;

            if (nextQuantity > productRow.stock) {
              return res.status(400).json({
                error: `Not enough stock. Only ${productRow.stock} available.`,
              });
            }

            const saveCartItem = () => {
              fetchCartItems(userId, (fetchError, cart) => {
                if (fetchError) {
                  return res.status(500).json({ error: "Failed to fetch cart." });
                }

                return res.status(cartRow ? 200 : 201).json({
                  message: cartRow
                    ? "Cart item quantity updated."
                    : "Product added to cart.",
                  cart,
                });
              });
            };

            if (cartRow) {
              db.run(
                `
                  UPDATE cart_items
                  SET quantity = ?, updated_at = CURRENT_TIMESTAMP
                  WHERE id = ?
                `,
                [nextQuantity, cartRow.id],
                (updateError) => {
                  if (updateError) {
                    return res.status(500).json({ error: "Failed to update cart item." });
                  }
                  saveCartItem();
                }
              );
              return;
            }

            db.run(
              `
                INSERT INTO cart_items (user_id, product_id, quantity)
                VALUES (?, ?, ?)
              `,
              [userId, productId, addQuantity],
              (insertError) => {
                if (insertError) {
                  return res.status(500).json({ error: "Failed to add item to cart." });
                }
                saveCartItem();
              }
            );
          }
        );
      }
    );
  });
});

// Sets the quantity for a cart line. quantity 0 removes the item.
app.put("/api/cart", (req, res) => {
  const { user_id, product_id, quantity } = req.body;
  const userId = parsePositiveInt(user_id, "user_id", res);
  if (userId === null) {
    return;
  }

  const productId = parsePositiveInt(product_id, "product_id", res);
  if (productId === null) {
    return;
  }

  const nextQuantity = Number(quantity);
  if (!Number.isInteger(nextQuantity) || nextQuantity < 0) {
    return res.status(400).json({ error: "quantity must be a non-negative integer." });
  }

  if (nextQuantity === 0) {
    db.run(
      "DELETE FROM cart_items WHERE user_id = ? AND product_id = ?",
      [userId, productId],
      function onDelete(deleteError) {
        if (deleteError) {
          return res.status(500).json({ error: "Failed to remove cart item." });
        }

        if (this.changes === 0) {
          return res.status(404).json({ error: "Cart item not found." });
        }

        fetchCartItems(userId, (fetchError, cart) => {
          if (fetchError) {
            return res.status(500).json({ error: "Failed to fetch cart." });
          }

          return res.status(200).json({
            message: "Cart item removed.",
            cart,
          });
        });
      }
    );
    return;
  }

  db.get(
    "SELECT stock FROM products WHERE id = ?",
    [productId],
    (productError, productRow) => {
      if (productError) {
        return res.status(500).json({ error: "Failed to validate product." });
      }

      if (!productRow) {
        return res.status(404).json({ error: "Product not found." });
      }

      if (nextQuantity > productRow.stock) {
        return res.status(400).json({
          error: `Not enough stock. Only ${productRow.stock} available.`,
        });
      }

      db.run(
        `
          UPDATE cart_items
          SET quantity = ?, updated_at = CURRENT_TIMESTAMP
          WHERE user_id = ? AND product_id = ?
        `,
        [nextQuantity, userId, productId],
        function onUpdate(updateError) {
          if (updateError) {
            return res.status(500).json({ error: "Failed to update cart item." });
          }

          if (this.changes === 0) {
            return res.status(404).json({ error: "Cart item not found." });
          }

          fetchCartItems(userId, (fetchError, cart) => {
            if (fetchError) {
              return res.status(500).json({ error: "Failed to fetch cart." });
            }

            return res.status(200).json({
              message: "Cart item quantity updated.",
              cart,
            });
          });
        }
      );
    }
  );
});

// Removes one product from the user's cart.
app.delete("/api/cart/:userId/:productId", (req, res) => {
  const userId = parsePositiveInt(req.params.userId, "user id", res);
  if (userId === null) {
    return;
  }

  const productId = parsePositiveInt(req.params.productId, "product id", res);
  if (productId === null) {
    return;
  }

  db.run(
    "DELETE FROM cart_items WHERE user_id = ? AND product_id = ?",
    [userId, productId],
    function onDelete(deleteError) {
      if (deleteError) {
        return res.status(500).json({ error: "Failed to remove cart item." });
      }

      if (this.changes === 0) {
        return res.status(404).json({ error: "Cart item not found." });
      }

      fetchCartItems(userId, (fetchError, cart) => {
        if (fetchError) {
          return res.status(500).json({ error: "Failed to fetch cart." });
        }

        return res.status(200).json({
          message: "Cart item removed.",
          cart,
        });
      });
    }
  );
});

// Clears every item from the user's cart.
app.delete("/api/cart/:userId", (req, res) => {
  const userId = parsePositiveInt(req.params.userId, "user id", res);
  if (userId === null) {
    return;
  }

  db.run("DELETE FROM cart_items WHERE user_id = ?", [userId], function onClear(clearError) {
    if (clearError) {
      return res.status(500).json({ error: "Failed to clear cart." });
    }

    return res.status(200).json({
      message: "Cart cleared.",
      cart: {
        user_id: userId,
        item_count: 0,
        subtotal: 0,
        items: [],
      },
      removed_items: this.changes,
    });
  });
});

// Returns a single order plus all of its line items.
app.get("/api/orders/:id", (req, res) => {
  const orderId = Number(req.params.id);

  if (!Number.isInteger(orderId) || orderId <= 0) {
    return res.status(400).json({ error: "Order id must be a positive integer." });
  }

  db.get(
    `
      SELECT o.id, o.user_id, o.total, o.date, u.username, u.email
      FROM orders o
      LEFT JOIN users u ON u.id = o.user_id
      WHERE o.id = ?
    `,
    [orderId],
    (orderError, orderRow) => {
      if (orderError) {
        return res.status(500).json({ error: "Failed to fetch order." });
      }

      if (!orderRow) {
        return res.status(404).json({ error: "Order not found." });
      }

      db.all(
        `
          SELECT
            oi.id,
            oi.product_id,
            p.name AS product_name,
            oi.quantity,
            oi.price_at_purchase
          FROM order_items oi
          JOIN products p ON p.id = oi.product_id
          WHERE oi.order_id = ?
          ORDER BY oi.id ASC
        `,
        [orderId],
        (itemsError, itemRows) => {
          if (itemsError) {
            return res.status(500).json({ error: "Failed to fetch order items." });
          }

          return res.status(200).json({
            order: orderRow,
            items: itemRows,
          });
        }
      );
    }
  );
});

app.post("/api/orders", (req, res) => {
  const { user_id, items } = req.body;

  if (!user_id || !Array.isArray(items) || items.length === 0) {
    return res
      .status(400)
      .json({ error: "user_id and non-empty items array are required." });
  }

  const normalizedItems = [];
  for (const item of items) {
    const productId = Number(item.product_id);
    const quantity = Number(item.quantity);

    if (!productId || !Number.isInteger(quantity) || quantity <= 0) {
      return res.status(400).json({
        error: "Each item must include valid product_id and quantity > 0.",
      });
    }

    normalizedItems.push({ product_id: productId, quantity });
  }

  const productIds = normalizedItems.map((item) => item.product_id);
  const placeholders = productIds.map(() => "?").join(", ");

  // Step 1: fetch products for price and stock verification.
  db.all(
    `SELECT id, price, stock FROM products WHERE id IN (${placeholders})`,
    productIds,
    (productError, products) => {
      if (productError) {
        return res.status(500).json({ error: "Failed to validate products." });
      }

      const productMap = new Map(products.map((p) => [p.id, p]));
      let total = 0;
      const orderLines = [];

      for (const item of normalizedItems) {
        const dbProduct = productMap.get(item.product_id);

        if (!dbProduct) {
          return res
            .status(400)
            .json({ error: `Product ${item.product_id} does not exist.` });
        }

        if (dbProduct.stock < item.quantity) {
          return res.status(400).json({
            error: `Not enough stock for product ${item.product_id}.`,
          });
        }

        const lineTotal = dbProduct.price * item.quantity;
        total += lineTotal;

        orderLines.push({
          product_id: item.product_id,
          quantity: item.quantity,
          price_at_purchase: dbProduct.price,
        });
      }

      total = Number(total.toFixed(2));

      // Step 2: transaction for order + order_items + stock update.
      db.run("BEGIN TRANSACTION", (beginError) => {
        if (beginError) {
          return res.status(500).json({ error: "Failed to start transaction." });
        }

        db.run(
          "INSERT INTO orders (user_id, total) VALUES (?, ?)",
          [user_id, total],
          function onOrderInsert(orderError) {
            if (orderError) {
              db.run("ROLLBACK");
              if (orderError.message.includes("FOREIGN KEY")) {
                return res.status(400).json({ error: "Invalid user_id." });
              }
              return res.status(500).json({ error: "Failed to create order." });
            }

            const orderId = this.lastID;
            const insertOrderItem = db.prepare(
              "INSERT INTO order_items (order_id, product_id, quantity, price_at_purchase) VALUES (?, ?, ?, ?)"
            );
            const updateStock = db.prepare(
              "UPDATE products SET stock = stock - ? WHERE id = ?"
            );

            let hasError = false;
            let pendingStatements = orderLines.length * 2;

            const handleStepDone = () => {
              if (hasError) {
                return;
              }

              pendingStatements -= 1;
              if (pendingStatements > 0) {
                return;
              }

              insertOrderItem.finalize();
              updateStock.finalize();

              db.run("COMMIT", (commitError) => {
                if (commitError) {
                  db.run("ROLLBACK");
                  return res
                    .status(500)
                    .json({ error: "Failed to commit order transaction." });
                }

                return res.status(201).json({
                  message: "Order created successfully.",
                  orderId,
                  total,
                  items: orderLines,
                });
              });
            };

            const handleStepError = () => {
              if (hasError) {
                return;
              }
              hasError = true;
              insertOrderItem.finalize();
              updateStock.finalize();
              db.run("ROLLBACK", () => {
                return res
                  .status(500)
                  .json({ error: "Failed while saving order items." });
              });
            };

            for (const line of orderLines) {
              insertOrderItem.run(
                [orderId, line.product_id, line.quantity, line.price_at_purchase],
                (insertItemError) => {
                  if (insertItemError) {
                    handleStepError();
                    return;
                  }
                  handleStepDone();
                }
              );

              updateStock.run([line.quantity, line.product_id], (stockError) => {
                if (stockError) {
                  handleStepError();
                  return;
                }
                handleStepDone();
              });
            }
          }
        );
      });
    }
  );
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
  db.close(() => {
    console.log("\nSQLite connection closed. Server stopped.");
    process.exit(0);
  });
});


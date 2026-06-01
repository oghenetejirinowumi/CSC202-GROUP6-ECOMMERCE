const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const express = require("express");
const cors = require("cors");
const bcrypt = require("bcrypt");
const sqlite3 = require("sqlite3").verbose();
require("dotenv").config();

const app = express();
const PORT = Number(process.env.PORT) || 50000;
const FRONTEND_ORIGIN = process.env.FRONTEND_ORIGIN || "http://localhost:3000";
const APP_BASE_URL = process.env.APP_BASE_URL || FRONTEND_ORIGIN;
const RESEND_API_KEY = process.env.RESEND_API_KEY || "";
const EMAIL_FROM = process.env.EMAIL_FROM || "";
const SESSION_COOKIE_NAME = "teckvora_session";
const SESSION_TTL_MS = 1000 * 60 * 60 * 24 * 7;
const EXTENDED_SESSION_TTL_MS = 1000 * 60 * 60 * 24 * 30;
const EMAIL_VERIFICATION_TTL_MS = 1000 * 60 * 60 * 24;
const IS_PROD = process.env.NODE_ENV === "production";
const SHIPPING_METHODS = {
  standard: { label: "Standard Delivery", fee: 5000 },
  express: { label: "Express Delivery", fee: 12000 },
};
const VALID_PAYMENT_METHODS = new Set([
  "pay_on_delivery",
  "bank_transfer",
  "card",
]);
const dbPath = path.join(__dirname, "data", "gadget-store.db");

app.use(
  cors({
    origin: FRONTEND_ORIGIN,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
    credentials: true,
  }),
);
app.use(express.json());

if (!fs.existsSync(dbPath)) {
  console.error(`Database not found at: ${dbPath}`);
  console.error(
    "Run `npm run init-db` or `pnpm run init-db` first, then restart the API.",
  );
  process.exit(1);
}

const db = new sqlite3.Database(dbPath, (error) => {
  if (error) {
    console.error("Failed to connect to SQLite database:", error.message);
    process.exit(1);
  }
  console.log(`Connected to SQLite database at: ${dbPath}`);
});

db.serialize(() => {
  db.run("PRAGMA foreign_keys = ON;");
});

const dbRun = (sql, params = []) =>
  new Promise((resolve, reject) => {
    db.run(sql, params, function onRun(error) {
      if (error) {
        reject(error);
        return;
      }
      resolve({ lastID: this.lastID, changes: this.changes });
    });
  });

const dbGet = (sql, params = []) =>
  new Promise((resolve, reject) => {
    db.get(sql, params, (error, row) => {
      if (error) {
        reject(error);
        return;
      }
      resolve(row || null);
    });
  });

const dbAll = (sql, params = []) =>
  new Promise((resolve, reject) => {
    db.all(sql, params, (error, rows) => {
      if (error) {
        reject(error);
        return;
      }
      resolve(rows || []);
    });
  });

const dbExec = (sql) =>
  new Promise((resolve, reject) => {
    db.exec(sql, (error) => {
      if (error) {
        reject(error);
        return;
      }
      resolve();
    });
  });

const asyncHandler = (handler) => async (req, res) => {
  try {
    await handler(req, res);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error." });
  }
};

const nowIso = (offsetMs = 0) => new Date(Date.now() + offsetMs).toISOString();
const sha256 = (value) =>
  crypto.createHash("sha256").update(value).digest("hex");
const normalizeEmail = (value) =>
  String(value || "")
    .trim()
    .toLowerCase();
const normalizeText = (value) => String(value || "").trim();
const isValidEmail = (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
const normalizeAddress = (value = {}) => ({
  firstName: normalizeText(value.firstName),
  lastName: normalizeText(value.lastName),
  company: normalizeText(value.company),
  addressLine1: normalizeText(value.addressLine1),
  addressLine2: normalizeText(value.addressLine2),
  city: normalizeText(value.city),
  state: normalizeText(value.state),
  postalCode: normalizeText(value.postalCode),
  country: normalizeText(value.country),
});
const isCompleteAddress = (address) =>
  Boolean(
    address.firstName &&
    address.lastName &&
    address.addressLine1 &&
    address.city &&
    address.state &&
    address.postalCode &&
    address.country,
  );

const getCookieValue = (req, cookieName) => {
  const cookieHeader = req.headers.cookie || "";
  const cookies = cookieHeader.split(";").map((part) => part.trim());

  for (const cookie of cookies) {
    if (!cookie) continue;
    const separatorIndex = cookie.indexOf("=");
    if (separatorIndex === -1) continue;
    const name = cookie.slice(0, separatorIndex);
    const rawValue = cookie.slice(separatorIndex + 1);
    if (name === cookieName) {
      return decodeURIComponent(rawValue);
    }
  }

  return null;
};

const setSessionCookie = (res, token, maxAge) => {
  res.cookie(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: IS_PROD,
    maxAge,
    path: "/",
  });
};

const clearSessionCookie = (res) => {
  res.clearCookie(SESSION_COOKIE_NAME, {
    httpOnly: true,
    sameSite: "lax",
    secure: IS_PROD,
    path: "/",
  });
};

const mapUser = (row) => ({
  id: row.id,
  username: row.username,
  email: row.email,
  firstName: row.first_name || null,
  lastName: row.last_name || null,
  phoneNumber: row.phone_number || null,
  birthday: row.birthday || null,
  emailVerified: Boolean(row.email_verified_at),
  emailVerifiedAt: row.email_verified_at || null,
  createdAt: row.created_at || null,
});

const ensureColumn = async (tableName, columnName, columnDefinition) => {
  const columns = await dbAll(`PRAGMA table_info(${tableName})`);
  const exists = columns.some((column) => column.name === columnName);
  if (!exists) {
    await dbExec(`ALTER TABLE ${tableName} ADD COLUMN ${columnDefinition}`);
  }
};

const migrateCartItemsTable = async () => {
  const existing = await dbGet(
    "SELECT name FROM sqlite_master WHERE type = 'table' AND name = 'cart_items'",
  );

  if (!existing) {
    await dbExec(`
      CREATE TABLE cart_items (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id TEXT NOT NULL,
        product_id TEXT NOT NULL,
        quantity INTEGER NOT NULL CHECK (quantity > 0),
        updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
        UNIQUE (user_id, product_id)
      );
    `);
    return;
  }

  const columns = await dbAll("PRAGMA table_info(cart_items)");
  const foreignKeys = await dbAll("PRAGMA foreign_key_list(cart_items)");
  const userIdColumn = columns.find((column) => column.name === "user_id");
  const alreadyCompatible =
    userIdColumn &&
    String(userIdColumn.type || "").toUpperCase() === "TEXT" &&
    foreignKeys.length === 0;

  if (alreadyCompatible) {
    return;
  }

  const legacyTable = `cart_items_legacy_${Date.now()}`;
  const hasUpdatedAt = columns.some((column) => column.name === "updated_at");
  const hasUserId = columns.some((column) => column.name === "user_id");
  const hasOwnerId = columns.some((column) => column.name === "owner_id");
  const sourceUserColumn = hasUserId
    ? "CAST(user_id AS TEXT)"
    : hasOwnerId
      ? "CAST(owner_id AS TEXT)"
      : "'guest'";
  const sourceUpdatedAt = hasUpdatedAt ? "updated_at" : "CURRENT_TIMESTAMP";

  await dbExec(`ALTER TABLE cart_items RENAME TO ${legacyTable};`);
  await dbExec(`
    CREATE TABLE cart_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id TEXT NOT NULL,
      product_id TEXT NOT NULL,
      quantity INTEGER NOT NULL CHECK (quantity > 0),
      updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      UNIQUE (user_id, product_id)
    );
  `);
  await dbExec(`
    INSERT INTO cart_items (id, user_id, product_id, quantity, updated_at)
    SELECT id, ${sourceUserColumn}, product_id, quantity, ${sourceUpdatedAt}
    FROM ${legacyTable};
  `);
  await dbExec(`DROP TABLE ${legacyTable};`);
};

const ensureSchema = async () => {
  await dbExec(`
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
      date TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
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
    CREATE INDEX IF NOT EXISTS idx_auth_sessions_user_id ON auth_sessions(user_id);
    CREATE INDEX IF NOT EXISTS idx_auth_sessions_hash ON auth_sessions(session_hash);
    CREATE INDEX IF NOT EXISTS idx_email_verification_user_id ON email_verification_tokens(user_id);
    CREATE INDEX IF NOT EXISTS idx_email_verification_hash ON email_verification_tokens(token_hash);
  `);

  await ensureColumn("users", "first_name", "first_name TEXT");
  await ensureColumn("users", "last_name", "last_name TEXT");
  await ensureColumn("users", "phone_number", "phone_number TEXT");
  await ensureColumn("users", "birthday", "birthday TEXT");
  await ensureColumn("users", "email_verified_at", "email_verified_at TEXT");
  await ensureColumn(
    "users",
    "created_at",
    "created_at TEXT DEFAULT CURRENT_TIMESTAMP",
  );
  await ensureColumn(
    "users",
    "updated_at",
    "updated_at TEXT DEFAULT CURRENT_TIMESTAMP",
  );
  await ensureColumn("orders", "guest_email", "guest_email TEXT");
  await ensureColumn("orders", "guest_name", "guest_name TEXT");
  await ensureColumn("orders", "contact_email", "contact_email TEXT");
  await ensureColumn("orders", "contact_phone", "contact_phone TEXT");
  await ensureColumn("orders", "shipping_method", "shipping_method TEXT");
  await ensureColumn("orders", "payment_method", "payment_method TEXT");
  await ensureColumn("orders", "subtotal", "subtotal REAL NOT NULL DEFAULT 0");
  await ensureColumn(
    "orders",
    "shipping_fee",
    "shipping_fee REAL NOT NULL DEFAULT 0",
  );
  await ensureColumn(
    "orders",
    "tax_amount",
    "tax_amount REAL NOT NULL DEFAULT 0",
  );
  await ensureColumn("orders", "shipping_address", "shipping_address TEXT");
  await ensureColumn("orders", "billing_address", "billing_address TEXT");
  await ensureColumn("orders", "delivery_notes", "delivery_notes TEXT");
  await ensureColumn(
    "orders",
    "status",
    "status TEXT NOT NULL DEFAULT 'placed'",
  );

  await migrateCartItemsTable();
};

const buildVerificationEmail = (verificationLink, firstName) => {
  const greeting = firstName ? `Hi ${firstName},` : "Hello,";
  return {
    subject: "Verify your Teckvora account",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 560px; margin: 0 auto; color: #111827; line-height: 1.6;">
        <h2 style="margin-bottom: 8px;">Verify your email address</h2>
        <p>${greeting}</p>
        <p>Thanks for creating your Teckvora account. Please confirm your email address to activate your account and sign in securely.</p>
        <p style="margin: 24px 0;">
          <a href="${verificationLink}" style="display: inline-block; background: #111827; color: #ffffff; text-decoration: none; padding: 12px 20px; border-radius: 8px; font-weight: 600;">Verify my email</a>
        </p>
        <p>If the button does not work, copy and paste this link into your browser:</p>
        <p><a href="${verificationLink}">${verificationLink}</a></p>
        <p>This link expires in 24 hours.</p>
        <p>If you did not create this account, you can ignore this email.</p>
      </div>
    `,
    text: `${greeting}\n\nVerify your Teckvora account by visiting this link:\n${verificationLink}\n\nThis link expires in 24 hours.`,
  };
};

const sendEmail = async ({ to, subject, html, text }) => {
  if (!RESEND_API_KEY || !EMAIL_FROM) {
    console.warn(
      "RESEND_API_KEY or EMAIL_FROM is not configured. Email was not sent via Resend.",
    );
    console.log(`Email preview for ${to}: ${subject}`);
    console.log(text);
    return { delivered: false, provider: "console" };
  }

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${RESEND_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: EMAIL_FROM,
      to: [to],
      subject,
      html,
      text,
    }),
  });

  if (!response.ok) {
    const details = await response.text();
    throw new Error(`Resend email request failed: ${details}`);
  }

  return { delivered: true, provider: "resend" };
};

const issueVerificationToken = async (userId) => {
  await dbRun("DELETE FROM email_verification_tokens WHERE user_id = ?", [
    userId,
  ]);

  const rawToken = crypto.randomBytes(32).toString("hex");
  const tokenHash = sha256(rawToken);
  const expiresAt = nowIso(EMAIL_VERIFICATION_TTL_MS);

  await dbRun(
    `INSERT INTO email_verification_tokens (user_id, token_hash, expires_at)
     VALUES (?, ?, ?)`,
    [userId, tokenHash, expiresAt],
  );

  return rawToken;
};

const sendVerificationEmail = async (userRow) => {
  const rawToken = await issueVerificationToken(userRow.id);
  const verificationLink = `${APP_BASE_URL}/verify-email?token=${encodeURIComponent(rawToken)}`;
  const email = buildVerificationEmail(verificationLink, userRow.first_name);
  await sendEmail({ to: userRow.email, ...email });
};

const getUserByIdentifier = async (identifier) => {
  const normalized = normalizeText(identifier);
  if (!normalized) return null;

  return dbGet(
    `SELECT *
     FROM users
     WHERE LOWER(email) = LOWER(?) OR LOWER(username) = LOWER(?)`,
    [normalized, normalized],
  );
};

const getSessionUser = async (req) => {
  const sessionToken = getCookieValue(req, SESSION_COOKIE_NAME);
  if (!sessionToken) return null;

  const sessionHash = sha256(sessionToken);
  const row = await dbGet(
    `SELECT
        s.id AS session_id,
        u.*
     FROM auth_sessions s
     JOIN users u ON u.id = s.user_id
     WHERE s.session_hash = ? AND s.expires_at > ?`,
    [sessionHash, nowIso()],
  );

  if (!row) return null;

  await dbRun("UPDATE auth_sessions SET last_used_at = ? WHERE id = ?", [
    nowIso(),
    row.session_id,
  ]).catch(() => {});

  return mapUser(row);
};

const fetchCartItems = async (userId) => {
  const items = await dbAll(
    `SELECT
        ci.id,
        ci.user_id,
        ci.product_id,
        ci.quantity,
        ci.updated_at,
        p.name AS product_name,
        p.brand AS product_brand,
        p.description,
        p.price,
        p.stock,
        p.image_url
     FROM cart_items ci
     JOIN products p ON p.id = ci.product_id
     WHERE ci.user_id = ?
     ORDER BY ci.updated_at DESC`,
    [String(userId)],
  );

  const mappedItems = items.map((row) => ({
    id: row.id,
    user_id: row.user_id,
    product_id: row.product_id,
    quantity: row.quantity,
    updated_at: row.updated_at,
    product: {
      id: row.product_id,
      name: row.product_name,
      brand: row.product_brand,
      description: row.description,
      price: row.price,
      stock: row.stock,
      image_url: row.image_url,
    },
    line_total: Number((row.price * row.quantity).toFixed(2)),
  }));

  const subtotal = Number(
    mappedItems.reduce((sum, item) => sum + item.line_total, 0).toFixed(2),
  );
  const itemCount = mappedItems.reduce((sum, item) => sum + item.quantity, 0);

  return {
    user_id: String(userId),
    item_count: itemCount,
    subtotal,
    items: mappedItems,
  };
};

const mergeCartOwners = async (sourceOwnerId, targetOwnerId) => {
  if (!sourceOwnerId || !targetOwnerId || sourceOwnerId === targetOwnerId) {
    return fetchCartItems(targetOwnerId || sourceOwnerId || "guest");
  }

  const sourceItems = await dbAll(
    "SELECT product_id, quantity FROM cart_items WHERE user_id = ?",
    [String(sourceOwnerId)],
  );

  for (const item of sourceItems) {
    const product = await dbGet("SELECT stock FROM products WHERE id = ?", [
      item.product_id,
    ]);
    if (!product) {
      continue;
    }

    const existing = await dbGet(
      "SELECT id, quantity FROM cart_items WHERE user_id = ? AND product_id = ?",
      [String(targetOwnerId), item.product_id],
    );

    const mergedQuantity = Math.min(
      product.stock,
      (existing?.quantity || 0) + item.quantity,
    );
    if (mergedQuantity <= 0) {
      continue;
    }

    if (existing) {
      await dbRun(
        "UPDATE cart_items SET quantity = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?",
        [mergedQuantity, existing.id],
      );
    } else {
      await dbRun(
        "INSERT INTO cart_items (user_id, product_id, quantity) VALUES (?, ?, ?)",
        [String(targetOwnerId), item.product_id, mergedQuantity],
      );
    }
  }

  await dbRun("DELETE FROM cart_items WHERE user_id = ?", [
    String(sourceOwnerId),
  ]);
  return fetchCartItems(targetOwnerId);
};

app.get(
  "/",
  asyncHandler(async (_req, res) => {
    res.json({ message: "Teckvora API is running." });
  }),
);

app.get(
  "/api/products",
  asyncHandler(async (_req, res) => {
    const rows = await dbAll("SELECT * FROM products ORDER BY id ASC");
    res.status(200).json(rows);
  }),
);

const registerHandler = async (req, res) => {
  const firstName = normalizeText(req.body.firstName);
  const lastName = normalizeText(req.body.lastName);
  const email = normalizeEmail(req.body.email);
  const username = normalizeText(req.body.username);
  const password = String(req.body.password || "");
  const phoneNumber = normalizeText(req.body.phoneNumber);
  const birthday = normalizeText(req.body.birthday);

  if (!firstName || !lastName || !email || !username || !password) {
    res.status(400).json({
      error:
        "First name, last name, email, username, and password are required.",
    });
    return;
  }

  if (!isValidEmail(email)) {
    res.status(400).json({ error: "Please enter a valid email address." });
    return;
  }

  if (password.length < 8) {
    res
      .status(400)
      .json({ error: "Password must be at least 8 characters long." });
    return;
  }

  const existingByEmail = await dbGet(
    "SELECT id FROM users WHERE LOWER(email) = LOWER(?)",
    [email],
  );
  if (existingByEmail) {
    res
      .status(409)
      .json({ error: "An account with that email already exists." });
    return;
  }

  const existingByUsername = await dbGet(
    "SELECT id FROM users WHERE LOWER(username) = LOWER(?)",
    [username],
  );
  if (existingByUsername) {
    res.status(409).json({ error: "That username is already in use." });
    return;
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const insertResult = await dbRun(
    `INSERT INTO users (
      username,
      email,
      password_hash,
      first_name,
      last_name,
      phone_number,
      birthday,
      created_at,
      updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      username,
      email,
      passwordHash,
      firstName,
      lastName,
      phoneNumber || null,
      birthday || null,
      nowIso(),
      nowIso(),
    ],
  );

  const userRow = await dbGet("SELECT * FROM users WHERE id = ?", [
    insertResult.lastID,
  ]);
  await sendVerificationEmail(userRow);

  res.status(201).json({
    message:
      "Account created. Please check your email to verify your account before signing in.",
  });
};

const loginHandler = async (req, res) => {
  const identifier = normalizeText(
    req.body.identifier || req.body.email || req.body.username,
  );
  const password = String(req.body.password || "");
  const rememberMe = Boolean(req.body.rememberMe);

  if (!identifier || !password) {
    res
      .status(400)
      .json({ error: "Email or username and password are required." });
    return;
  }

  const userRow = await getUserByIdentifier(identifier);
  if (!userRow) {
    res.status(401).json({ error: "Invalid email/username or password." });
    return;
  }

  const passwordMatches = await bcrypt.compare(password, userRow.password_hash);
  if (!passwordMatches) {
    res.status(401).json({ error: "Invalid email/username or password." });
    return;
  }

  if (!userRow.email_verified_at) {
    res.status(403).json({
      error: "Please verify your email before signing in.",
      code: "EMAIL_NOT_VERIFIED",
    });
    return;
  }

  const rawSessionToken = crypto.randomBytes(32).toString("hex");
  const sessionHash = sha256(rawSessionToken);
  const maxAge = rememberMe ? EXTENDED_SESSION_TTL_MS : SESSION_TTL_MS;
  const expiresAt = nowIso(maxAge);

  await dbRun(
    `INSERT INTO auth_sessions (user_id, session_hash, expires_at, last_used_at)
     VALUES (?, ?, ?, ?)`,
    [userRow.id, sessionHash, expiresAt, nowIso()],
  );

  setSessionCookie(res, rawSessionToken, maxAge);
  res.status(200).json({ user: mapUser(userRow) });
};

app.post("/api/auth/register", asyncHandler(registerHandler));
app.post("/api/register", asyncHandler(registerHandler));

app.post("/api/auth/login", asyncHandler(loginHandler));
app.post("/api/login", asyncHandler(loginHandler));

app.post(
  "/api/auth/logout",
  asyncHandler(async (req, res) => {
    const sessionToken = getCookieValue(req, SESSION_COOKIE_NAME);
    if (sessionToken) {
      await dbRun("DELETE FROM auth_sessions WHERE session_hash = ?", [
        sha256(sessionToken),
      ]).catch(() => {});
    }

    clearSessionCookie(res);
    res.status(200).json({ message: "Signed out successfully." });
  }),
);

app.get(
  "/api/auth/me",
  asyncHandler(async (req, res) => {
    const user = await getSessionUser(req);
    if (!user) {
      clearSessionCookie(res);
      res.status(401).json({ error: "Not authenticated." });
      return;
    }

    res.status(200).json({ user });
  }),
);

app.post(
  "/api/auth/resend-verification",
  asyncHandler(async (req, res) => {
    const identifier = normalizeText(req.body.identifier || req.body.email);
    if (!identifier) {
      res.status(400).json({ error: "Email or username is required." });
      return;
    }

    const userRow = await getUserByIdentifier(identifier);
    if (!userRow) {
      res
        .status(404)
        .json({ error: "No account found for that email or username." });
      return;
    }

    if (userRow.email_verified_at) {
      res.status(400).json({ error: "This account is already verified." });
      return;
    }

    await sendVerificationEmail(userRow);
    res.status(200).json({ message: "Verification email sent." });
  }),
);

app.get(
  "/api/auth/verify-email",
  asyncHandler(async (req, res) => {
    const token = normalizeText(req.query.token);
    if (!token) {
      res.status(400).json({ error: "Verification token is required." });
      return;
    }

    const tokenHash = sha256(token);
    const verificationRow = await dbGet(
      `SELECT evt.id, evt.user_id, u.email_verified_at
       FROM email_verification_tokens evt
       JOIN users u ON u.id = evt.user_id
       WHERE evt.token_hash = ? AND evt.used_at IS NULL AND evt.expires_at > ?`,
      [tokenHash, nowIso()],
    );

    if (!verificationRow) {
      res
        .status(400)
        .json({ error: "This verification link is invalid or has expired." });
      return;
    }

    if (!verificationRow.email_verified_at) {
      await dbRun(
        "UPDATE users SET email_verified_at = ?, updated_at = ? WHERE id = ?",
        [nowIso(), nowIso(), verificationRow.user_id],
      );
    }

    await dbRun(
      "UPDATE email_verification_tokens SET used_at = ? WHERE id = ?",
      [nowIso(), verificationRow.id],
    );

    res
      .status(200)
      .json({ message: "Email verified successfully. You can now sign in." });
  }),
);

app.get(
  "/api/cart/:userId",
  asyncHandler(async (req, res) => {
    const cart = await fetchCartItems(req.params.userId || "guest");
    res.status(200).json(cart);
  }),
);

app.post(
  "/api/cart",
  asyncHandler(async (req, res) => {
    const userId = normalizeText(req.body.user_id) || "guest";
    const productId = normalizeText(req.body.product_id);
    const quantity = Number(req.body.quantity) || 1;

    if (!productId) {
      res.status(400).json({ error: "A valid product_id is required." });
      return;
    }

    if (!Number.isInteger(quantity) || quantity <= 0) {
      res.status(400).json({ error: "Quantity must be a positive integer." });
      return;
    }

    const product = await dbGet("SELECT id, stock FROM products WHERE id = ?", [
      productId,
    ]);
    if (!product) {
      res.status(404).json({ error: "Product not found." });
      return;
    }

    const existingCartItem = await dbGet(
      "SELECT id, quantity FROM cart_items WHERE user_id = ? AND product_id = ?",
      [userId, productId],
    );

    const nextQuantity = (existingCartItem?.quantity || 0) + quantity;
    if (nextQuantity > product.stock) {
      res.status(400).json({
        error: `Only ${product.stock} unit(s) are available in stock.`,
      });
      return;
    }

    if (existingCartItem) {
      await dbRun(
        "UPDATE cart_items SET quantity = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?",
        [nextQuantity, existingCartItem.id],
      );
    } else {
      await dbRun(
        "INSERT INTO cart_items (user_id, product_id, quantity) VALUES (?, ?, ?)",
        [userId, productId, quantity],
      );
    }

    res.status(existingCartItem ? 200 : 201).json({
      message: "Cart updated successfully.",
      cart: await fetchCartItems(userId),
    });
  }),
);

app.put(
  "/api/cart",
  asyncHandler(async (req, res) => {
    const userId = normalizeText(req.body.user_id) || "guest";
    const productId = normalizeText(req.body.product_id);
    const quantity = Number(req.body.quantity);

    if (!productId) {
      res.status(400).json({ error: "A valid product_id is required." });
      return;
    }

    if (!Number.isInteger(quantity) || quantity < 0) {
      res
        .status(400)
        .json({ error: "Quantity must be zero or a positive integer." });
      return;
    }

    if (quantity === 0) {
      await dbRun(
        "DELETE FROM cart_items WHERE user_id = ? AND product_id = ?",
        [userId, productId],
      );
      res.status(200).json({
        message: "Cart item removed.",
        cart: await fetchCartItems(userId),
      });
      return;
    }

    const product = await dbGet("SELECT stock FROM products WHERE id = ?", [
      productId,
    ]);
    if (!product) {
      res.status(404).json({ error: "Product not found." });
      return;
    }

    if (quantity > product.stock) {
      res.status(400).json({
        error: `Only ${product.stock} unit(s) are available in stock.`,
      });
      return;
    }

    const updateResult = await dbRun(
      "UPDATE cart_items SET quantity = ?, updated_at = CURRENT_TIMESTAMP WHERE user_id = ? AND product_id = ?",
      [quantity, userId, productId],
    );

    if (!updateResult.changes) {
      res.status(404).json({ error: "Cart item not found." });
      return;
    }

    res.status(200).json({
      message: "Cart updated successfully.",
      cart: await fetchCartItems(userId),
    });
  }),
);

app.post(
  "/api/cart/merge",
  asyncHandler(async (req, res) => {
    const sourceOwnerId = normalizeText(req.body.source_owner_id);
    const targetOwnerId = normalizeText(req.body.target_owner_id);

    if (!sourceOwnerId || !targetOwnerId) {
      res.status(400).json({
        error: "Both source_owner_id and target_owner_id are required.",
      });
      return;
    }

    const cart = await mergeCartOwners(sourceOwnerId, targetOwnerId);
    res.status(200).json({ message: "Cart merged successfully.", cart });
  }),
);

app.delete(
  "/api/cart/:userId/:productId",
  asyncHandler(async (req, res) => {
    const userId = normalizeText(req.params.userId) || "guest";
    const productId = normalizeText(req.params.productId);

    await dbRun("DELETE FROM cart_items WHERE user_id = ? AND product_id = ?", [
      userId,
      productId,
    ]);
    res.status(200).json({
      message: "Cart item removed.",
      cart: await fetchCartItems(userId),
    });
  }),
);

app.delete(
  "/api/cart/:userId",
  asyncHandler(async (req, res) => {
    const userId = normalizeText(req.params.userId) || "guest";
    await dbRun("DELETE FROM cart_items WHERE user_id = ?", [userId]);
    res
      .status(200)
      .json({ message: "Cart cleared.", cart: await fetchCartItems(userId) });
  }),
);

app.post(
  "/api/orders",
  asyncHandler(async (req, res) => {
    const user = await getSessionUser(req);
    const ownerId = normalizeText(req.body.owner_id);
    const rawItems = Array.isArray(req.body.items) ? req.body.items : [];
    const contactEmail = normalizeEmail(
      req.body.contact?.email || req.body.guest_email || (user?.email ?? ""),
    );
    const contactPhone = normalizeText(
      req.body.contact?.phone || user?.phoneNumber || "",
    );
    const shippingAddress = normalizeAddress(req.body.shippingAddress);
    const billingSameAsShipping = req.body.billingSameAsShipping !== false;
    const billingAddress = billingSameAsShipping
      ? { ...shippingAddress }
      : normalizeAddress(req.body.billingAddress);
    const shippingMethod = normalizeText(
      req.body.shippingMethod || "standard",
    ).toLowerCase();
    const paymentMethod = normalizeText(
      req.body.paymentMethod || "pay_on_delivery",
    ).toLowerCase();
    const deliveryNotes = normalizeText(req.body.deliveryNotes);

    if (!rawItems.length) {
      res
        .status(400)
        .json({ error: "At least one item is required to place an order." });
      return;
    }

    if (!isValidEmail(contactEmail)) {
      res.status(400).json({ error: "A valid contact email is required." });
      return;
    }

    if (!contactPhone) {
      res.status(400).json({ error: "A contact phone number is required." });
      return;
    }

    if (!isCompleteAddress(shippingAddress)) {
      res
        .status(400)
        .json({ error: "Please complete the full shipping address." });
      return;
    }

    if (!billingSameAsShipping && !isCompleteAddress(billingAddress)) {
      res
        .status(400)
        .json({ error: "Please complete the full billing address." });
      return;
    }

    const shippingConfig = SHIPPING_METHODS[shippingMethod];
    if (!shippingConfig) {
      res.status(400).json({ error: "A valid shipping method is required." });
      return;
    }

    if (!VALID_PAYMENT_METHODS.has(paymentMethod)) {
      res.status(400).json({ error: "A valid payment method is required." });
      return;
    }

    const items = rawItems.map((item) => ({
      productId: normalizeText(item.product_id || item.id),
      quantity: Number(item.quantity),
    }));

    if (
      items.some(
        (item) =>
          !item.productId ||
          !Number.isInteger(item.quantity) ||
          item.quantity <= 0,
      )
    ) {
      res.status(400).json({
        error: "Each order item must include a valid product_id and quantity.",
      });
      return;
    }

    const uniqueProductIds = [...new Set(items.map((item) => item.productId))];
    const placeholders = uniqueProductIds.map(() => "?").join(", ");
    const products = await dbAll(
      `SELECT id, name, price, stock FROM products WHERE id IN (${placeholders})`,
      uniqueProductIds,
    );
    const productMap = new Map(
      products.map((product) => [product.id, product]),
    );

    for (const item of items) {
      const product = productMap.get(item.productId);
      if (!product) {
        res
          .status(404)
          .json({ error: `Product ${item.productId} was not found.` });
        return;
      }
      if (item.quantity > product.stock) {
        res.status(400).json({
          error: `${product.name} only has ${product.stock} unit(s) left in stock.`,
        });
        return;
      }
    }

    const subtotal = Number(
      items
        .reduce((sum, item) => {
          const product = productMap.get(item.productId);
          return sum + product.price * item.quantity;
        }, 0)
        .toFixed(2),
    );
    const shippingFee = shippingConfig.fee;
    const taxAmount = 0;
    const total = Number((subtotal + shippingFee + taxAmount).toFixed(2));
    const guestName = [shippingAddress.firstName, shippingAddress.lastName]
      .filter(Boolean)
      .join(" ");

    await dbExec("BEGIN IMMEDIATE TRANSACTION;");

    try {
      const orderInsert = await dbRun(
        `INSERT INTO orders (
          user_id,
          guest_email,
          guest_name,
          contact_email,
          contact_phone,
          shipping_method,
          payment_method,
          subtotal,
          shipping_fee,
          tax_amount,
          total,
          shipping_address,
          billing_address,
          delivery_notes,
          status,
          date
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          user ? user.id : null,
          user ? null : contactEmail,
          user ? null : guestName,
          contactEmail,
          contactPhone,
          shippingMethod,
          paymentMethod,
          subtotal,
          shippingFee,
          taxAmount,
          total,
          JSON.stringify(shippingAddress),
          JSON.stringify(billingAddress),
          deliveryNotes || null,
          "placed",
          nowIso(),
        ],
      );

      const orderItems = [];

      for (const item of items) {
        const product = productMap.get(item.productId);
        await dbRun(
          `INSERT INTO order_items (order_id, product_id, quantity, price_at_purchase)
           VALUES (?, ?, ?, ?)`,
          [orderInsert.lastID, item.productId, item.quantity, product.price],
        );

        const stockUpdate = await dbRun(
          "UPDATE products SET stock = stock - ? WHERE id = ? AND stock >= ?",
          [item.quantity, item.productId, item.quantity],
        );

        if (!stockUpdate.changes) {
          throw new Error(
            `Stock changed while placing the order for ${product.name}.`,
          );
        }

        orderItems.push({
          product_id: item.productId,
          name: product.name,
          quantity: item.quantity,
          price_at_purchase: product.price,
        });
      }

      if (ownerId) {
        await dbRun("DELETE FROM cart_items WHERE user_id = ?", [ownerId]);
      }

      await dbExec("COMMIT;");

      res.status(201).json({
        message: "Order placed successfully.",
        order: {
          id: orderInsert.lastID,
          subtotal,
          shippingFee,
          taxAmount,
          total,
          shippingMethod,
          paymentMethod,
          status: "placed",
          items: orderItems,
        },
      });
    } catch (error) {
      await dbExec("ROLLBACK;").catch(() => {});
      throw error;
    }
  }),
);

app.get(
  "/api/orders/my",
  asyncHandler(async (req, res) => {
    const user = await getSessionUser(req);
    if (!user) {
      res.status(401).json({ error: "Not authenticated." });
      return;
    }

    const orders = await dbAll(
      `SELECT
         id,
         subtotal,
         shipping_fee,
         tax_amount,
         total,
         status,
         date,
         contact_email,
         contact_phone,
         shipping_method,
         payment_method,
         shipping_address,
         billing_address,
         delivery_notes
       FROM orders
       WHERE user_id = ?
       ORDER BY date DESC`,
      [user.id],
    );

    if (!orders.length) {
      res.status(200).json({ orders: [] });
      return;
    }

    const orderIds = orders.map((order) => order.id);
    const placeholders = orderIds.map(() => "?").join(", ");
    const items = await dbAll(
      `SELECT
          oi.order_id,
          oi.product_id,
          oi.quantity,
          oi.price_at_purchase,
          p.name,
          p.image_url
       FROM order_items oi
       LEFT JOIN products p ON p.id = oi.product_id
       WHERE oi.order_id IN (${placeholders})
       ORDER BY oi.id ASC`,
      orderIds,
    );

    const itemsByOrderId = new Map();
    for (const item of items) {
      if (!itemsByOrderId.has(item.order_id)) {
        itemsByOrderId.set(item.order_id, []);
      }
      itemsByOrderId.get(item.order_id).push({
        productId: item.product_id,
        name: item.name,
        quantity: item.quantity,
        priceAtPurchase: item.price_at_purchase,
        imageUrl: item.image_url || null,
      });
    }

    res.status(200).json({
      orders: orders.map((order) => ({
        id: order.id,
        subtotal: order.subtotal,
        shippingFee: order.shipping_fee,
        taxAmount: order.tax_amount,
        total: order.total,
        status: order.status,
        date: order.date,
        contactEmail: order.contact_email,
        contactPhone: order.contact_phone,
        shippingMethod: order.shipping_method,
        paymentMethod: order.payment_method,
        shippingAddress: order.shipping_address
          ? JSON.parse(order.shipping_address)
          : null,
        billingAddress: order.billing_address
          ? JSON.parse(order.billing_address)
          : null,
        deliveryNotes: order.delivery_notes || null,
        items: itemsByOrderId.get(order.id) || [],
      })),
    });
  }),
);

const startServer = async () => {
  try {
    await ensureSchema();
    app.listen(PORT, () => {
      console.log(`API server running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("Failed to initialize database schema:", error);
    process.exit(1);
  }
};

startServer();

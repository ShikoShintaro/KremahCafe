
const express = require("express");
const crypto = require("node:crypto");
const bcrypt = require("bcryptjs");
const rateLimit = require("express-rate-limit");
const db = require("../database/connection");

const {
  requireCustomer,
  hashToken,
  CUSTOMER_COOKIE,
  customerCookieOptions,
} = require("../middleware/require-customer");

const router = express.Router();

const SESSION_DURATION_MS = 30 * 24 * 60 * 60 * 1000;

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: "draft-7",
  legacyHeaders: false,
});

const registerLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  limit: 5,
  standardHeaders: "draft-7",
  legacyHeaders: false,
});

function validateEmail(email) {
  return (
    typeof email === "string" &&
    email.length <= 254 &&
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
  );
}

function createSession(customerId) {
  const token = crypto.randomBytes(32).toString("base64url");
  const expiresAt = new Date(
    Date.now() + SESSION_DURATION_MS
  ).toISOString();

  db.prepare(`
    DELETE FROM customer_sessions
    WHERE expires_at <= ?
  `).run(new Date().toISOString());

  db.prepare(`
    INSERT INTO customer_sessions (
      customer_id,
      token_hash,
      expires_at
    ) VALUES (?, ?, ?)
  `).run(customerId, hashToken(token), expiresAt);

  return token;
}

router.post("/register", registerLimiter, async (req, res, next) => {
  try {
    const fullName = typeof req.body?.fullName === "string"
      ? req.body.fullName.trim()
      : "";

    const email = typeof req.body?.email === "string"
      ? req.body.email.trim().toLowerCase()
      : "";

    const phone = typeof req.body?.phone === "string"
      ? req.body.phone.trim()
      : "";

    const password = typeof req.body?.password === "string"
      ? req.body.password
      : "";

    if (
      fullName.length < 2 ||
      fullName.length > 120 ||
      !validateEmail(email) ||
      phone.length > 40 ||
      password.length < 8 ||
      password.length > 128
    ) {
      return res.status(400).json({
        success: false,
        message: "Please provide valid registration information. Password must contain at least 8 characters.",
      });
    }

    const passwordHash = await bcrypt.hash(password, 12);

    const register = db.transaction(() => {
      const result = db.prepare(`
        INSERT INTO customers (
          email,
          password_hash,
          full_name,
          phone
        ) VALUES (?, ?, ?, ?)
      `).run(email, passwordHash, fullName, phone);

      const customerId = Number(result.lastInsertRowid);
      const token = createSession(customerId);

      return { customerId, token };
    });

    const { customerId, token } = register();

    res.cookie(CUSTOMER_COOKIE, token, {
      ...customerCookieOptions(),
      maxAge: SESSION_DURATION_MS,
    });

    res.status(201).json({
      success: true,
      message: "Account created successfully",
      data: {
        id: customerId,
        fullName,
        email,
        phone,
      },
    });
  } catch (error) {
    if (error.code === "SQLITE_CONSTRAINT_UNIQUE") {
      return res.status(409).json({
        success: false,
        message: "An account with this email already exists",
      });
    }

    next(error);
  }
});

router.post("/login", loginLimiter, async (req, res, next) => {
  try {
    const email = typeof req.body?.email === "string"
      ? req.body.email.trim().toLowerCase()
      : "";

    const password = typeof req.body?.password === "string"
      ? req.body.password
      : "";

    if (!validateEmail(email) || !password || password.length > 128) {
      return res.status(400).json({
        success: false,
        message: "Enter a valid email and password",
      });
    }

    const customer = db.prepare(`
      SELECT id, email, password_hash, full_name, phone, status
      FROM customers
      WHERE email = ?
    `).get(email);

    const valid = customer
      ? await bcrypt.compare(password, customer.password_hash)
      : false;

    if (!valid || customer.status !== "active") {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password, or account unavailable",
      });
    }

    const token = createSession(customer.id);

    res.cookie(CUSTOMER_COOKIE, token, {
      ...customerCookieOptions(),
      maxAge: SESSION_DURATION_MS,
    });

    res.json({
      success: true,
      message: "Login successful",
      data: {
        id: customer.id,
        email: customer.email,
        fullName: customer.full_name,
        phone: customer.phone,
      },
    });
  } catch (error) {
    next(error);
  }
});

router.get("/me", requireCustomer, (req, res) => {
  res.json({
    success: true,
    data: req.customer,
  });
});

router.post("/logout", requireCustomer, (req, res, next) => {
  try {
    db.prepare(`
      DELETE FROM customer_sessions
      WHERE id = ?
    `).run(req.customer.sessionId);

    res.clearCookie(CUSTOMER_COOKIE, customerCookieOptions());

    res.json({
      success: true,
      message: "Logged out successfully",
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
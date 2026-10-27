
const express = require("express");
const crypto = require("node:crypto");
const bcrypt = require("bcryptjs");
const rateLimit = require("express-rate-limit");
const db = require("../database/connection");

const {
  requireAdmin,
  hashToken,
  COOKIE_NAME,
  cookieOptions,
} = require("../middleware/require-admin");

const router = express.Router();

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many login attempts. Try again later.",
  },
});

const SESSION_DURATION_MS = 8 * 60 * 60 * 1000;

router.post("/login", loginLimiter, async (req, res, next) => {
  try {
    const email = typeof req.body?.email === "string"
      ? req.body.email.trim().toLowerCase()
      : "";

    const password = typeof req.body?.password === "string"
      ? req.body.password
      : "";

    if (
      !email ||
      email.length > 254 ||
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ||
      !password ||
      password.length > 1024
    ) {
      return res.status(400).json({
        success: false,
        message: "Enter a valid email and password",
      });
    }

    const user = db.prepare(`
      SELECT id, email, password_hash, role
      FROM admin_users
      WHERE email = ? AND is_active = 1
    `).get(email);

    // Use a generic error to avoid revealing whether an account exists.
    const valid = user
      ? await bcrypt.compare(password, user.password_hash)
      : false;

    if (!valid) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    const token = crypto.randomBytes(32).toString("base64url");
    const now = Date.now();
    const expiresAt = new Date(now + SESSION_DURATION_MS).toISOString();

    const createSession = db.transaction(() => {
      db.prepare(`
        DELETE FROM auth_sessions
        WHERE expires_at <= ?
      `).run(new Date(now).toISOString());

      db.prepare(`
        INSERT INTO auth_sessions (admin_user_id, token_hash, expires_at)
        VALUES (?, ?, ?)
      `).run(user.id, hashToken(token), expiresAt);
    });

    createSession();

    res.cookie(COOKIE_NAME, token, {
      ...cookieOptions(),
      maxAge: SESSION_DURATION_MS,
    });

    res.json({
      success: true,
      data: {
        id: user.id,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    next(error);
  }
});

router.get("/me", requireAdmin, (req, res) => {
  res.json({
    success: true,
    data: req.admin,
  });
});

router.post("/logout", requireAdmin, (req, res, next) => {
  try {
    db.prepare(`
      DELETE FROM auth_sessions WHERE id = ?
    `).run(req.admin.sessionId);

    res.clearCookie(COOKIE_NAME, cookieOptions());

    res.json({
      success: true,
      message: "Logged out successfully",
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;

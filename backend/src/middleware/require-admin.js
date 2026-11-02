
const crypto = require("node:crypto");
const db = require("../database/connection");

const COOKIE_NAME = "kremah_admin_session";

function hashToken(token) {
  return crypto.createHash("sha256").update(token).digest("hex");
}

function requireAdmin(req, res, next) {
  const token = req.cookies?.[COOKIE_NAME];

  if (!token || typeof token !== "string") {
    return res.status(401).json({
      success: false,
      message: "Authentication required",
    });
  }

  try {
    const session = db.prepare(`
      SELECT
        s.id AS session_id,
        s.expires_at,
        u.id,
        u.email,
        u.role,
        u.is_active
      FROM auth_sessions s
      JOIN admin_users u ON u.id = s.admin_user_id
      WHERE s.token_hash = ?
        AND s.expires_at > ?
        AND u.is_active = 1
    `).get(hashToken(token), new Date().toISOString());

    if (!session) {
      res.clearCookie(COOKIE_NAME, cookieOptions());
      return res.status(401).json({
        success: false,
        message: "Session expired or invalid",
      });
    }

    db.prepare(`
      UPDATE auth_sessions
      SET last_seen_at = ?
      WHERE id = ?
    `).run(new Date().toISOString(), session.session_id);

    req.admin = {
      id: session.id,
      email: session.email,
      role: session.role,
      sessionId: session.session_id,
    };

    next();
  } catch (error) {
    next(error);
  }
}

function cookieOptions() {
  return {
    httpOnly: true,
    secure: true,
    sameSite: "none",
    path: "/",
  };
}

module.exports = {
  requireAdmin,
  hashToken,
  COOKIE_NAME,
  cookieOptions,
};

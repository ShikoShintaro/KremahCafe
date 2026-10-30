
const crypto = require("node:crypto");
const db = require("../database/connection");

const CUSTOMER_COOKIE = "kremah_customer_session";

function hashToken(token) {
  return crypto.createHash("sha256").update(token).digest("hex");
}

function customerCookieOptions() {
  const crossSite = process.env.COOKIE_CROSS_SITE === "true";

  return {
    httpOnly: true,
    secure: crossSite || process.env.NODE_ENV === "production",
    sameSite: crossSite ? "none" : "lax",
    path: "/",
  };
}

function requireCustomer(req, res, next) {
  const token = req.cookies?.[CUSTOMER_COOKIE];

  if (!token || typeof token !== "string") {
    return res.status(401).json({
      success: false,
      message: "Customer authentication required",
    });
  }

  try {
    const session = db.prepare(`
      SELECT
        s.id AS session_id,
        s.expires_at,
        c.id,
        c.email,
        c.full_name,
        c.phone,
        c.status
      FROM customer_sessions s
      JOIN customers c ON c.id = s.customer_id
      WHERE s.token_hash = ?
        AND s.expires_at > ?
        AND c.status = 'active'
    `).get(hashToken(token), new Date().toISOString());

    if (!session) {
      res.clearCookie(CUSTOMER_COOKIE, customerCookieOptions());

      return res.status(401).json({
        success: false,
        message: "Customer session expired or invalid",
      });
    }

    db.prepare(`
      UPDATE customer_sessions
      SET last_seen_at = ?
      WHERE id = ?
    `).run(new Date().toISOString(), session.session_id);

    req.customer = {
      id: session.id,
      email: session.email,
      fullName: session.full_name,
      phone: session.phone,
      sessionId: session.session_id,
    };

    next();
  } catch (error) {
    next(error);
  }
}

module.exports = {
  requireCustomer,
  hashToken,
  CUSTOMER_COOKIE,
  customerCookieOptions,
};
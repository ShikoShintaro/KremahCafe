
const express = require("express");
const router = express.Router();
const db = require("../database/connection");

router.get("/", (req, res) => {
  try {
    const counts = {
      categories: db.prepare(
        "SELECT COUNT(*) AS total FROM categories"
      ).get().total,
      products: db.prepare(
        "SELECT COUNT(*) AS total FROM products"
      ).get().total,
    };

    res.json({
      success: true,
      message: "KremahCafe API is running",
      database: "connected",
      counts,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Health check failed:", error.message);
    res.status(500).json({
      success: false,
      message: "Database health check failed",
    });
  }
});

module.exports = router;

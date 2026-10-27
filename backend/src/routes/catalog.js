
const express = require("express");
const router = express.Router();
const db = require("../database/connection");

// GET /api/v1/categories
router.get("/categories", (req, res) => {
  try {
    const categories = db.prepare(`
      SELECT id, name, slug, sort_order
      FROM categories
      WHERE is_active = 1
      ORDER BY sort_order ASC, name ASC
    `).all();

    res.json({ success: true, data: categories });
  } catch (error) {
    console.error("Categories query failed:", error.message);
    res.status(500).json({
      success: false,
      message: "Unable to load categories",
    });
  }
});

// GET /api/v1/products
router.get("/products", (req, res) => {
  try {
    const { category, search } = req.query;

    let sql = `
      SELECT
        p.id,
        p.name,
        p.description,
        p.price_cents,
        p.emoji,
        p.badge,
        p.stock_quantity,
        p.is_available,
        c.name AS category_name,
        c.slug AS category_slug
      FROM products p
      JOIN categories c ON c.id = p.category_id
      WHERE p.is_available = 1
        AND c.is_active = 1
    `;

    const params = {};

    if (category) {
      sql += " AND c.slug = @category";
      params.category = String(category).slice(0, 100);
    }

    if (search) {
      sql += " AND p.name LIKE @search";
      params.search = `%${String(search).slice(0, 100)}%`;
    }

    sql += " ORDER BY p.sort_order ASC, p.name ASC";

    const products = db.prepare(sql).all(params).map(product => ({
      ...product,
      price: product.price_cents / 100,
    }));

    res.json({ success: true, data: products });
  } catch (error) {
    console.error("Products query failed:", error.message);
    res.status(500).json({
      success: false,
      message: "Unable to load products",
    });
  }
});

module.exports = router;

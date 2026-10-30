
const express = require("express");
const db = require("../database/connection");
const { requireAdmin } = require("../middleware/require-admin");

const router = express.Router();

router.use(requireAdmin);

const slugify = (value) =>
  value
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

const validText = (value, max = 200) =>
  typeof value === "string" &&
  value.trim().length > 0 &&
  value.trim().length <= max;

function validateProduct(body) {
  if (!validText(body.name, 200)) return "Name is required (max 200 characters).";
  if (!Number.isSafeInteger(body.priceCents) || body.priceCents < 0) {
    return "priceCents must be a non-negative integer.";
  }
  if (!Number.isInteger(body.categoryId) || body.categoryId <= 0) {
    return "A valid categoryId is required.";
  }
  if (body.description != null &&
      (typeof body.description !== "string" || body.description.length > 5000)) {
    return "Description must be at most 5000 characters.";
  }
  if (body.emoji != null &&
      (typeof body.emoji !== "string" || body.emoji.length > 32)) {
    return "Emoji must be at most 32 characters.";
  }
  if (body.badge != null &&
      (typeof body.badge !== "string" || body.badge.length > 50)) {
    return "Badge must be at most 50 characters.";
  }
  if (body.stockQuantity != null &&
      (!Number.isInteger(body.stockQuantity) || body.stockQuantity < 0)) {
    return "stockQuantity must be a non-negative integer or null.";
  }
  if (body.trackInventory != null && typeof body.trackInventory !== "boolean") {
    return "trackInventory must be a boolean.";
  }
  if (body.isAvailable != null && typeof body.isAvailable !== "boolean") {
    return "isAvailable must be a boolean.";
  }
  if (body.sortOrder != null &&
      (!Number.isInteger(body.sortOrder) || body.sortOrder < 0)) {
    return "sortOrder must be a non-negative integer.";
  }
  return null;
}

function categoryExists(id) {
  return !!db.prepare("SELECT id FROM categories WHERE id = ?").get(id);
}

// ---------------- PRODUCTS ----------------

// List all products, including unavailable products.
router.get("/products", (req, res, next) => {
  try {
    const data = db.prepare(`
      SELECT p.*, c.name AS category_name, c.slug AS category_slug
      FROM products p
      LEFT JOIN categories c ON c.id = p.category_id
      ORDER BY p.sort_order ASC, p.name ASC
    `).all();

    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
});

// Create product.
router.post("/products", (req, res, next) => {
  try {
    const body = req.body || {};
    const validationError = validateProduct(body);

    if (validationError) {
      return res.status(400).json({ success: false, message: validationError });
    }

    if (!categoryExists(body.categoryId)) {
      return res.status(400).json({
        success: false,
        message: "Selected category does not exist.",
      });
    }

    const result = db.prepare(`
      INSERT INTO products (
        category_id, name, description, price_cents, emoji, badge,
        stock_quantity, track_inventory, is_available, sort_order
      ) VALUES (
        @categoryId, @name, @description, @priceCents, @emoji, @badge,
        @stockQuantity, @trackInventory, @isAvailable, @sortOrder
      )
    `).run({
      categoryId: body.categoryId,
      name: body.name.trim(),
      description: body.description?.trim() || "",
      priceCents: body.priceCents,
      emoji: body.emoji || "☕",
      badge: body.badge || null,
      stockQuantity: body.stockQuantity ?? null,
      trackInventory: body.trackInventory ? 1 : 0,
      isAvailable: body.isAvailable === false ? 0 : 1,
      sortOrder: body.sortOrder ?? 0,
    });

    const product = db.prepare(`
      SELECT * FROM products WHERE id = ?
    `).get(result.lastInsertRowid);

    res.status(201).json({ success: true, data: product });
  } catch (error) {
    next(error);
  }
});

// Update product.
router.put("/products/:id", (req, res, next) => {
  try {
    const id = Number(req.params.id);
    const body = req.body || {};

    if (!Number.isSafeInteger(id) || id <= 0) {
      return res.status(400).json({ success: false, message: "Invalid product ID." });
    }

    const existing = db.prepare("SELECT * FROM products WHERE id = ?").get(id);
    if (!existing) {
      return res.status(404).json({ success: false, message: "Product not found." });
    }

    const validationError = validateProduct(body);
    if (validationError) {
      return res.status(400).json({ success: false, message: validationError });
    }

    if (!categoryExists(body.categoryId)) {
      return res.status(400).json({
        success: false,
        message: "Selected category does not exist.",
      });
    }

    db.prepare(`
      UPDATE products SET
        category_id = @categoryId,
        name = @name,
        description = @description,
        price_cents = @priceCents,
        emoji = @emoji,
        badge = @badge,
        stock_quantity = @stockQuantity,
        track_inventory = @trackInventory,
        is_available = @isAvailable,
        sort_order = @sortOrder,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = @id
    `).run({
      id,
      categoryId: body.categoryId,
      name: body.name.trim(),
      description: body.description?.trim() || "",
      priceCents: body.priceCents,
      emoji: body.emoji || "☕",
      badge: body.badge || null,
      stockQuantity: body.stockQuantity ?? null,
      trackInventory: body.trackInventory ? 1 : 0,
      isAvailable: body.isAvailable === false ? 0 : 1,
      sortOrder: body.sortOrder ?? 0,
    });

    res.json({
      success: true,
      data: db.prepare("SELECT * FROM products WHERE id = ?").get(id),
    });
  } catch (error) {
    next(error);
  }
});

// Delete product. Existing order history is preserved by the schema.
router.delete("/products/:id", (req, res, next) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isSafeInteger(id) || id <= 0) {
      return res.status(400).json({ success: false, message: "Invalid product ID." });
    }

    const result = db.prepare("DELETE FROM products WHERE id = ?").run(id);

    if (!result.changes) {
      return res.status(404).json({ success: false, message: "Product not found." });
    }

    res.json({ success: true, message: "Product deleted." });
  } catch (error) {
    next(error);
  }
});

// ---------------- CATEGORIES ----------------

router.get("/categories", (req, res, next) => {
  try {
    const data = db.prepare(`
      SELECT * FROM categories
      ORDER BY sort_order ASC, name ASC
    `).all();

    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
});

router.post("/categories", (req, res, next) => {
  try {
    const body = req.body || {};

    if (!validText(body.name, 100)) {
      return res.status(400).json({
        success: false,
        message: "Category name is required (max 100 characters).",
      });
    }

    const slug = slugify(body.slug || body.name);
    if (!slug || slug.length > 120) {
      return res.status(400).json({ success: false, message: "Invalid category slug." });
    }

    const sortOrder = body.sortOrder ?? 0;
    if (!Number.isInteger(sortOrder) || sortOrder < 0) {
      return res.status(400).json({ success: false, message: "Invalid sortOrder." });
    }

    const result = db.prepare(`
      INSERT INTO categories (name, slug, sort_order, is_active)
      VALUES (?, ?, ?, ?)
    `).run(body.name.trim(), slug, sortOrder, body.isActive === false ? 0 : 1);

    res.status(201).json({
      success: true,
      data: db.prepare("SELECT * FROM categories WHERE id = ?").get(result.lastInsertRowid),
    });
  } catch (error) {
    if (error.code === "SQLITE_CONSTRAINT_UNIQUE") {
      return res.status(409).json({
        success: false,
        message: "A category with that slug already exists.",
      });
    }
    next(error);
  }
});

router.put("/categories/:id", (req, res, next) => {
  try {
    const id = Number(req.params.id);
    const body = req.body || {};

    if (!Number.isSafeInteger(id) || id <= 0) {
      return res.status(400).json({ success: false, message: "Invalid category ID." });
    }

    if (!db.prepare("SELECT id FROM categories WHERE id = ?").get(id)) {
      return res.status(404).json({ success: false, message: "Category not found." });
    }

    if (!validText(body.name, 100)) {
      return res.status(400).json({ success: false, message: "Category name is required." });
    }

    const slug = slugify(body.slug || body.name);
    const sortOrder = body.sortOrder ?? 0;

    if (!slug || slug.length > 120 ||
        !Number.isInteger(sortOrder) || sortOrder < 0 ||
        (body.isActive != null && typeof body.isActive !== "boolean")) {
      return res.status(400).json({ success: false, message: "Invalid category fields." });
    }

    db.prepare(`
      UPDATE categories
      SET name = ?, slug = ?, sort_order = ?, is_active = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).run(body.name.trim(), slug, sortOrder, body.isActive === false ? 0 : 1, id);

    res.json({
      success: true,
      data: db.prepare("SELECT * FROM categories WHERE id = ?").get(id),
    });
  } catch (error) {
    if (error.code === "SQLITE_CONSTRAINT_UNIQUE") {
      return res.status(409).json({
        success: false,
        message: "A category with that slug already exists.",
      });
    }
    next(error);
  }
});

router.delete("/categories/:id", (req, res, next) => {
  try {
    const id = Number(req.params.id);

    if (!Number.isSafeInteger(id) || id <= 0) {
      return res.status(400).json({ success: false, message: "Invalid category ID." });
    }

    const category = db.prepare("SELECT id FROM categories WHERE id = ?").get(id);
    if (!category) {
      return res.status(404).json({ success: false, message: "Category not found." });
    }

    const productCount = db.prepare(`
      SELECT COUNT(*) AS count FROM products WHERE category_id = ?
    `).get(id).count;

    if (productCount > 0) {
      return res.status(409).json({
        success: false,
        message: "Move or delete this category's products before deleting it.",
        productCount,
      });
    }

    db.prepare("DELETE FROM categories WHERE id = ?").run(id);
    res.json({ success: true, message: "Category deleted." });
  } catch (error) {
    next(error);
  }
});

module.exports = router;

const fs = require("node:fs");
const path = require("node:path");
const Database = require("better-sqlite3");

const projectRoot = path.resolve(__dirname, "../../../");
const legacyPath = path.join(projectRoot, "data", "kremah.sqlite");
const targetPath = path.join(
  projectRoot,
  "backend",
  "data",
  "kremah-dev.sqlite"
);

function parsePriceToCents(value) {
  if (typeof value === "number" && Number.isFinite(value)) {
    if (value < 0) throw new Error("Negative price encountered");
    return Math.round(value * 100);
  }

  if (typeof value !== "string") {
    throw new Error("Invalid legacy price");
  }

  const normalized = value
    .replace(/[₱,\s]/g, "")
    .trim();

  if (!/^\d+(?:\.\d{1,2})?$/.test(normalized)) {
    throw new Error(`Invalid legacy price format: ${value}`);
  }

  const amount = Number(normalized);

  if (!Number.isSafeInteger(Math.round(amount * 100))) {
    throw new Error("Price exceeds the supported range");
  }

  return Math.round(amount * 100);
}

function parseLegacyMoney(value) {
  const amount = Number(value);

  if (!Number.isFinite(amount) || amount < 0) {
    throw new Error(`Invalid legacy monetary amount: ${value}`);
  }

  return Math.round(amount * 100);
}

function slugify(value) {
  return value
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function requiredString(value, field) {
  if (typeof value !== "string" || !value.trim()) {
    throw new Error(`Missing or invalid ${field}`);
  }

  return value.trim();
}

function openDatabase(filename, options = {}) {
  return new Database(filename, options);
}

function main() {
  if (!fs.existsSync(legacyPath)) {
    throw new Error(`Legacy database not found: ${legacyPath}`);
  }

  if (!fs.existsSync(targetPath)) {
    throw new Error(
      `Target database not found: ${targetPath}\n` +
      "Run npm run db:migrate first."
    );
  }

  const legacy = openDatabase(legacyPath, {
    readonly: true,
    fileMustExist: true
  });

  const target = openDatabase(targetPath);

  try {
    legacy.pragma("foreign_keys = ON");
    target.pragma("foreign_keys = ON");

    const hasTable = (db, name) =>
      Boolean(
        db.prepare(`
          SELECT 1
          FROM sqlite_master
          WHERE type = 'table' AND name = ?
        `).get(name)
      );

    for (const table of [
      "site_config",
      "orders",
      "order_items"
    ]) {
      if (!hasTable(legacy, table)) {
        throw new Error(`Legacy database is missing table: ${table}`);
      }
    }

    const configRow = legacy
      .prepare("SELECT data FROM site_config WHERE id = 1")
      .get();

    if (!configRow) {
      throw new Error("Legacy site_config row id=1 was not found");
    }

    const config = JSON.parse(configRow.data);

    if (
      !Array.isArray(config.categories) ||
      !Array.isArray(config.items) ||
      typeof config.store !== "object" ||
      typeof config.hero !== "object"
    ) {
      throw new Error("Legacy site configuration has an unexpected format");
    }

    const counts = {
      categories: 0,
      products: 0,
      settings: 0,
      orders: 0,
      orderItems: 0
    };

    const warnings = [];

    const importData = target.transaction(() => {
      // Prevent accidental merging with existing data.
      const existing = target.prepare(`
        SELECT
          (SELECT COUNT(*) FROM categories) AS categories,
          (SELECT COUNT(*) FROM products) AS products,
          (SELECT COUNT(*) FROM site_settings) AS settings,
          (SELECT COUNT(*) FROM orders) AS orders,
          (SELECT COUNT(*) FROM order_items) AS order_items
      `).get();

      if (Object.values(existing).some((count) => count > 0)) {
        throw new Error(
          "Target database already contains imported data. " +
          "Use a fresh development database or create a deliberate merge migration."
        );
      }

      const insertCategory = target.prepare(`
        INSERT INTO categories (
          legacy_key, name, slug, sort_order, is_active
        ) VALUES (?, ?, ?, ?, 1)
      `);

      const categoryIds = new Map();

      config.categories.forEach((category, index) => {
        const key = requiredString(category.key, "category key");
        const name = requiredString(category.name, "category name");
        const slug = slugify(key || name);

        const result = insertCategory.run(
          key,
          name,
          slug,
          index
        );

        categoryIds.set(key, Number(result.lastInsertRowid));
        counts.categories++;
      });

      const insertProduct = target.prepare(`
        INSERT INTO products (
          legacy_id,
          category_id,
          name,
          description,
          price_cents,
          emoji,
          badge,
          is_available,
          sort_order
        ) VALUES (?, ?, ?, ?, ?, ?, ?, 1, ?)
      `);

      config.items.forEach((item, index) => {
        const legacyId = requiredString(item.id, "product ID");
        const name = requiredString(item.name, "product name");
        const categoryKey = requiredString(
          item.category,
          "product category"
        );

        const categoryId = categoryIds.get(categoryKey);

        if (!categoryId) {
          throw new Error(
            `Product ${legacyId} references unknown category key: ${categoryKey}`
          );
        }

        const priceCents = parsePriceToCents(item.price);

        if (priceCents > 10000000) {
          warnings.push(
            `Product ID ${legacyId} has a price above ₱100,000. Verify it.`
          );
        }

        insertProduct.run(
          legacyId,
          categoryId,
          name,
          typeof item.desc === "string" ? item.desc : "",
          priceCents,
          typeof item.emoji === "string" ? item.emoji : "",
          typeof item.badge === "string" && item.badge
            ? item.badge
            : null,
          index
        );

        counts.products++;
      });

      const insertSetting = target.prepare(`
        INSERT INTO site_settings (setting_key, value_json)
        VALUES (?, ?)
      `);

      for (const [key, value] of [
        ["store", config.store],
        ["hero", config.hero]
      ]) {
        insertSetting.run(key, JSON.stringify(value));
        counts.settings++;
      }

      // Preserve legacy order IDs and timestamps.
      const insertOrder = target.prepare(`
        INSERT INTO orders (
          id,
          customer_name,
          customer_email,
          phone,
          address,
          subtotal_cents,
          total_price_cents,
          status,
          created_at,
          updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);

      const insertOrderItem = target.prepare(`
        INSERT INTO order_items (
          id,
          order_id,
          item_name,
          unit_price_cents,
          quantity,
          line_total_cents
        ) VALUES (?, ?, ?, ?, ?, ?)
      `);

      const validStatuses = new Set([
        "pending",
        "accepted",
        "preparing",
        "ready",
        "completed",
        "cancelled"
      ]);

      const orders = legacy.prepare(`
        SELECT * FROM orders ORDER BY id
      `).all();

      const orderItems = legacy.prepare(`
        SELECT * FROM order_items ORDER BY id
      `).all();

      const orderIds = new Set(orders.map((order) => order.id));

      for (const item of orderItems) {
        if (!orderIds.has(item.order_id)) {
          throw new Error(
            `Legacy order item ${item.id} references missing order ${item.order_id}`
          );
        }
      }

      for (const order of orders) {
        const status = validStatuses.has(order.status)
          ? order.status
          : "pending";

        if (status !== order.status) {
          warnings.push(
            `Order ${order.id} had an unknown status; imported as pending.`
          );
        }

        const totalCents = parseLegacyMoney(order.total_price);

        insertOrder.run(
          order.id,
          requiredString(order.customer_name, "order customer name"),
          order.customer_email || null,
          requiredString(order.phone, "order phone"),
          requiredString(order.address, "order address"),
          totalCents,
          totalCents,
          status,
          order.created_at || new Date().toISOString(),
          order.created_at || new Date().toISOString()
        );

        counts.orders++;
      }

      for (const item of orderItems) {
        const quantity = Number(item.quantity);

        if (!Number.isSafeInteger(quantity) || quantity <= 0) {
          throw new Error(
            `Order item ${item.id} has an invalid quantity`
          );
        }

        const unitPriceCents = parseLegacyMoney(item.price);

        insertOrderItem.run(
          item.id,
          item.order_id,
          requiredString(item.item_name, "order item name"),
          unitPriceCents,
          quantity,
          unitPriceCents * quantity
        );

        counts.orderItems++;
      }

      // Record the import as a one-time operation.
      target.prepare(`
        INSERT OR IGNORE INTO schema_migrations (version)
        VALUES ('legacy-data-import-v1')
      `).run();
    });

    importData();

    const verification = {
      categories: target.prepare(
        "SELECT COUNT(*) AS count FROM categories"
      ).get().count,
      products: target.prepare(
        "SELECT COUNT(*) AS count FROM products"
      ).get().count,
      settings: target.prepare(
        "SELECT COUNT(*) AS count FROM site_settings"
      ).get().count,
      orders: target.prepare(
        "SELECT COUNT(*) AS count FROM orders"
      ).get().count,
      orderItems: target.prepare(
        "SELECT COUNT(*) AS count FROM order_items"
      ).get().count
    };

    console.log("Legacy import completed.");
    console.log(JSON.stringify({ imported: counts, verified: verification }, null, 2));

    if (warnings.length) {
      console.warn("\nReview these data-quality warnings:");
      for (const warning of warnings) {
        console.warn(`- ${warning}`);
      }
    }
  } finally {
    legacy.close();
    target.close();
  }
}

try {
  main();
} catch (error) {
  console.error("Legacy import failed:", error.message);
  process.exitCode = 1;
}

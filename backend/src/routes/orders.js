
const express = require("express");
const crypto = require("node:crypto");
const db = require("../database/connection");

const router = express.Router();

const validText = (value, max) =>
  typeof value === "string" &&
  value.trim().length > 0 &&
  value.trim().length <= max;

router.post("/", (req, res, next) => {
  try {
    const body = req.body || {};
    const { customerName, customerEmail, phone, address, notes, items } = body;

    if (!validText(customerName, 120)) {
      return res.status(400).json({
        success: false,
        message: "Customer name is required (max 120 characters).",
      });
    }

    if (!validText(phone, 40)) {
      return res.status(400).json({
        success: false,
        message: "A valid contact number is required.",
      });
    }

    if (!validText(address, 500)) {
      return res.status(400).json({
        success: false,
        message: "Delivery address is required (max 500 characters).",
      });
    }

    if (
      customerEmail != null &&
      customerEmail !== "" &&
      (typeof customerEmail !== "string" ||
        customerEmail.length > 254 ||
        !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customerEmail))
    ) {
      return res.status(400).json({
        success: false,
        message: "Please provide a valid email address.",
      });
    }

    if (notes != null && (typeof notes !== "string" || notes.length > 1000)) {
      return res.status(400).json({
        success: false,
        message: "Notes must be at most 1000 characters.",
      });
    }

    if (!Array.isArray(items) || items.length === 0 || items.length > 50) {
      return res.status(400).json({
        success: false,
        message: "An order must contain between 1 and 50 line items.",
      });
    }

    // Merge duplicate product IDs and validate all quantities.
    const quantities = new Map();

    for (const item of items) {
      if (
        !item ||
        !Number.isSafeInteger(item.productId) ||
        item.productId <= 0 ||
        !Number.isSafeInteger(item.quantity) ||
        item.quantity <= 0 ||
        item.quantity > 50
      ) {
        return res.status(400).json({
          success: false,
          message: "Each item needs a valid productId and quantity (1–50).",
        });
      }

      const quantity = (quantities.get(item.productId) || 0) + item.quantity;

      if (quantity > 100) {
        return res.status(400).json({
          success: false,
          message: "The maximum quantity per product is 100.",
        });
      }

      quantities.set(item.productId, quantity);
    }

    const createOrder = db.transaction(() => {
      const orderItems = [];
      let subtotalCents = 0;

      for (const [productId, quantity] of quantities) {
        const product = db.prepare(`
          SELECT id, name, price_cents, is_available,
                 track_inventory, stock_quantity
          FROM products
          WHERE id = ?
        `).get(productId);

        if (!product || product.is_available !== 1) {
          const error = new Error(
            `Product ${productId} is unavailable. Refresh the menu and try again.`
          );
          error.status = 409;
          throw error;
        }

        if (
          product.track_inventory === 1 &&
          product.stock_quantity !== null &&
          product.stock_quantity < quantity
        ) {
          const error = new Error(
            `${product.name} does not have enough stock available.`
          );
          error.status = 409;
          throw error;
        }

        const lineTotalCents = product.price_cents * quantity;

        if (!Number.isSafeInteger(lineTotalCents)) {
          const error = new Error("Order total is too large.");
          error.status = 400;
          throw error;
        }

        subtotalCents += lineTotalCents;

        if (!Number.isSafeInteger(subtotalCents)) {
          const error = new Error("Order total is too large.");
          error.status = 400;
          throw error;
        }

        orderItems.push({
          productId: product.id,
          itemName: product.name,
          unitPriceCents: product.price_cents,
          quantity,
          lineTotalCents,
          trackInventory: product.track_inventory === 1,
          stockQuantity: product.stock_quantity,
        });
      }

      const orderNumber =
        `KC-${Date.now().toString(36).toUpperCase()}-` +
        crypto.randomBytes(3).toString("hex").toUpperCase();

      const result = db.prepare(`
        INSERT INTO orders (
          order_number, customer_name, customer_email, phone, address,
          subtotal_cents, total_price_cents, status, notes
        ) VALUES (
          @orderNumber, @customerName, @customerEmail, @phone, @address,
          @subtotalCents, @subtotalCents, 'pending', @notes
        )
      `).run({
        orderNumber,
        customerName: customerName.trim(),
        customerEmail: customerEmail?.trim() || null,
        phone: phone.trim(),
        address: address.trim(),
        subtotalCents,
        notes: notes?.trim() || null,
      });

      const insertItem = db.prepare(`
        INSERT INTO order_items (
          order_id, product_id, item_name, unit_price_cents,
          quantity, line_total_cents
        ) VALUES (?, ?, ?, ?, ?, ?)
      `);

      const decrementStock = db.prepare(`
        UPDATE products
        SET stock_quantity = stock_quantity - ?,
            updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
          AND track_inventory = 1
          AND stock_quantity IS NOT NULL
          AND stock_quantity >= ?
      `);

      for (const item of orderItems) {
        insertItem.run(
          result.lastInsertRowid,
          item.productId,
          item.itemName,
          item.unitPriceCents,
          item.quantity,
          item.lineTotalCents
        );

        if (item.trackInventory && item.stockQuantity !== null) {
          const stockResult = decrementStock.run(
            item.quantity,
            item.productId,
            item.quantity
          );

          if (stockResult.changes !== 1) {
            const error = new Error(
              `${item.itemName} stock changed. Please retry your order.`
            );
            error.status = 409;
            throw error;
          }
        }
      }

      return {
        id: result.lastInsertRowid,
        orderNumber,
        subtotalCents,
        totalPriceCents: subtotalCents,
        status: "pending",
        items: orderItems.map((item) => ({
          productId: item.productId,
          name: item.itemName,
          unitPriceCents: item.unitPriceCents,
          quantity: item.quantity,
          lineTotalCents: item.lineTotalCents,
        })),
      };
    });

    const order = createOrder();

    res.status(201).json({
      success: true,
      data: order,
      message: "Order placed successfully.",
    });
  } catch (error) {
    if (error.status) {
      return res.status(error.status).json({
        success: false,
        message: error.message,
      });
    }

    next(error);
  }
});

module.exports = router;

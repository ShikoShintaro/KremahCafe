
const express = require("express");
const db = require("../database/connection");
const { requireAdmin } = require("../middleware/require-admin");

const router = express.Router();

// All routes in this file require an authenticated admin.
router.use(requireAdmin);

// GET /api/v1/admin/dashboard
router.get("/dashboard", (req, res, next) => {
    try {
        const productCount = db.prepare(`
      SELECT COUNT(*) AS count
      FROM products
    `).get().count;

        const categoryCount = db.prepare(`
      SELECT COUNT(*) AS count
      FROM categories
    `).get().count;

        const orderStats = db.prepare(`
      SELECT
        COUNT(*) AS total,
        SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) AS pending,
        SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) AS completed,
        COALESCE(
          SUM(CASE
            WHEN status != 'cancelled' THEN total_price_cents
            ELSE 0
          END),
          0
        ) AS revenue_cents
      FROM orders
    `).get();

        const recentOrders = db.prepare(`
      SELECT
        id,
        order_number,
        customer_name,
        total_price_cents,
        status,
        created_at
      FROM orders
      ORDER BY created_at DESC
      LIMIT 10
    `).all();

        const lowStockProducts = db.prepare(`
      SELECT
        id,
        name,
        stock_quantity
      FROM products
      WHERE track_inventory = 1
        AND stock_quantity IS NOT NULL
        AND stock_quantity <= 5
      ORDER BY stock_quantity ASC, name ASC
      LIMIT 10
    `).all();

        res.json({
            success: true,
            data: {
                admin: {
                    id: req.admin.id,
                    email: req.admin.email,
                    role: req.admin.role,
                },
                stats: {
                    products: productCount,
                    categories: categoryCount,
                    orders: orderStats.total,
                    pendingOrders: orderStats.pending ?? 0,
                    completedOrders: orderStats.completed ?? 0,
                    revenueCents: orderStats.revenue_cents,
                },
                recentOrders,
                lowStockProducts,
            },
        });
    } catch (error) {
        next(error);
    }
});

module.exports = router;
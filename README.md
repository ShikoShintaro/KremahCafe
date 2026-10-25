# Kremah Café website

## Start the website and API

1. Install Node.js and MySQL.
2. Create the database and tables by running `schema.sql` in MySQL.
3. Copy `.env.example` to `.env`, then fill in the database credentials, a unique `SESSION_SECRET`, and the admin email and password. Use a random session secret and a strong admin password; do not publish `.env`.
4. Run `npm install`, then `npm start` from this folder.
5. Open `http://localhost:3000` for the storefront or `http://localhost:3000/Kremah%20Admin/` for the admin portal.

The browser pages use the same-origin API, so they must be opened through the running server, not directly as `file://` pages. Customer orders and CMS data are stored in MySQL. Admin sessions are stored in MySQL and use an HTTP-only cookie. In production, serve over HTTPS and set `NODE_ENV=production`.

On the first successful admin sign-in, the existing menu and website settings are copied into the database if it does not already contain CMS data. Customer checkout records a name, phone, delivery address/notes, optional email, and the items ordered.

The admin **Orders** page shows customer contact details and order items and lets you update order status. **Data Backup & Reset** downloads an Excel workbook containing orders and order items; the reset action restores the default CMS menu/settings and does not delete order history.

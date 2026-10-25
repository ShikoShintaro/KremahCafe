require('dotenv').config();

const crypto = require('node:crypto');
const path = require('node:path');
const express = require('express');
const { rateLimit } = require('express-rate-limit');
const ExcelJS = require('exceljs');
const mysql = require('mysql2/promise');
const session = require('express-session');
const MySQLStore = require('express-mysql-session')(session);

const requiredEnvironment = ['DB_NAME', 'DB_USER', 'SESSION_SECRET', 'ADMIN_EMAIL', 'ADMIN_PASSWORD'];
const missingEnvironment = requiredEnvironment.filter(name => !process.env[name]);
if (missingEnvironment.length) {
  throw new Error(`Missing required environment variables: ${missingEnvironment.join(', ')}`);
}
if (process.env.SESSION_SECRET.length < 32) {
  throw new Error('SESSION_SECRET must be at least 32 characters long.');
}
if (process.env.ADMIN_PASSWORD.length < 12) {
  throw new Error('ADMIN_PASSWORD must be at least 12 characters long.');
}

const app = express();
const port = Number(process.env.PORT) || 3000;
const databaseOptions = {
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT) || 3306,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  decimalNumbers: true
};
const pool = mysql.createPool(databaseOptions);
const sessionStore = new MySQLStore({
  ...databaseOptions,
  clearExpired: true,
  checkExpirationInterval: 15 * 60 * 1000,
  expiration: 8 * 60 * 60 * 1000,
  createDatabaseTable: true,
  schema: { tableName: 'sessions' }
});

app.disable('x-powered-by');
if (process.env.NODE_ENV === 'production') app.set('trust proxy', 1);
app.use(express.json({ limit: '64kb' }));
app.use(session({
  name: 'kremah.admin',
  secret: process.env.SESSION_SECRET,
  store: sessionStore,
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    sameSite: 'strict',
    secure: process.env.NODE_ENV === 'production',
    maxAge: 8 * 60 * 60 * 1000
  }
}));

function requireSameOrigin(req, res, next) {
  const origin = req.get('origin');
  let originHost;
  try {
    originHost = origin && origin !== 'null' ? new URL(origin).host : null;
  } catch (error) {
    return res.status(403).json({ message: 'Requests must come from this website.' });
  }
  if (!originHost || originHost !== req.get('host')) {
    return res.status(403).json({ message: 'Requests must come from this website.' });
  }
  next();
}

function requireAdmin(req, res, next) {
  if (!req.session.admin) return res.status(401).json({ message: 'Admin sign-in is required.' });
  next();
}

function safeEqual(left, right) {
  const key = process.env.SESSION_SECRET;
  const leftHash = crypto.createHmac('sha256', key).update(String(left)).digest();
  const rightHash = crypto.createHmac('sha256', key).update(String(right)).digest();
  return crypto.timingSafeEqual(leftHash, rightHash);
}

function sendError(res, error, message = 'The request could not be completed.') {
  console.error(message, error);
  res.status(500).json({ message });
}

const loginRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: { message: 'Too many sign-in attempts. Please wait and try again.' }
});

function validCmsData(data) {
  return data && Array.isArray(data.categories) && Array.isArray(data.items) &&
    data.categories.every(category => category && typeof category.key === 'string' && typeof category.name === 'string') &&
    data.items.every(item => item && typeof item.name === 'string' && typeof item.price === 'string' &&
      typeof item.category === 'string' && typeof item.desc === 'string');
}

async function getCmsData(connection = pool) {
  const [rows] = await connection.query('SELECT data FROM site_config WHERE id = 1');
  return rows.length ? rows[0].data : null;
}

async function initializeDatabase() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS site_config (
      id TINYINT UNSIGNED NOT NULL PRIMARY KEY,
      data JSON NOT NULL,
      updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    ) ENGINE=InnoDB
  `);
  await pool.query(`
    CREATE TABLE IF NOT EXISTS orders (
      id INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
      customer_name VARCHAR(100) NOT NULL,
      customer_email VARCHAR(254) NULL,
      phone VARCHAR(30) NOT NULL,
      address TEXT NOT NULL,
      total_price DECIMAL(10,2) NOT NULL,
      status ENUM('pending','accepted','preparing','ready','completed','cancelled') NOT NULL DEFAULT 'pending',
      created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      INDEX idx_orders_created_at (created_at)
    ) ENGINE=InnoDB
  `);
  await pool.query(`
    CREATE TABLE IF NOT EXISTS order_items (
      id INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
      order_id INT UNSIGNED NOT NULL,
      item_name VARCHAR(150) NOT NULL,
      price DECIMAL(10,2) NOT NULL,
      quantity INT UNSIGNED NOT NULL,
      CONSTRAINT fk_order_items_order FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE
    ) ENGINE=InnoDB
  `);

  const [columns] = await pool.query(
    `SELECT COLUMN_NAME FROM information_schema.COLUMNS
     WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'orders'`,
    [process.env.DB_NAME]
  );
  const orderColumns = new Set(columns.map(column => column.COLUMN_NAME));
  if (!orderColumns.has('customer_email')) {
    await pool.query('ALTER TABLE orders ADD COLUMN customer_email VARCHAR(254) NULL AFTER customer_name');
  }
  if (!orderColumns.has('status')) {
    await pool.query(
      "ALTER TABLE orders ADD COLUMN status ENUM('pending','accepted','preparing','ready','completed','cancelled') NOT NULL DEFAULT 'pending' AFTER total_price"
    );
  }
}

app.get('/api/auth/session', (req, res) => {
  res.json({ authenticated: Boolean(req.session.admin) });
});

app.post('/api/auth/login', loginRateLimit, requireSameOrigin, (req, res, next) => {
  const body = req.body && typeof req.body === 'object' && !Array.isArray(req.body) ? req.body : {};
  const email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : '';
  const password = typeof body.password === 'string' ? body.password : '';
  const expectedEmail = process.env.ADMIN_EMAIL.trim().toLowerCase();
  if (!safeEqual(email, expectedEmail) || !safeEqual(password, process.env.ADMIN_PASSWORD)) {
    return res.status(401).json({ message: 'Email or password is incorrect.' });
  }
  req.session.regenerate(error => {
    if (error) return next(error);
    req.session.admin = { email: expectedEmail };
    req.session.save(saveError => {
      if (saveError) return next(saveError);
      res.json({ authenticated: true, email: expectedEmail });
    });
  });
});

app.post('/api/auth/logout', requireSameOrigin, requireAdmin, (req, res, next) => {
  req.session.destroy(error => {
    if (error) return next(error);
    res.clearCookie('kremah.admin', { httpOnly: true, sameSite: 'strict', secure: process.env.NODE_ENV === 'production' });
    res.json({ authenticated: false });
  });
});

app.get('/api/site-data', async (req, res) => {
  try {
    res.json({ data: await getCmsData() });
  } catch (error) {
    sendError(res, error, 'Unable to load the cafe website data.');
  }
});

app.put('/api/site-data', requireSameOrigin, requireAdmin, async (req, res) => {
  if (!validCmsData(req.body)) return res.status(400).json({ message: 'The submitted website data is invalid.' });
  try {
    await pool.query(
      `INSERT INTO site_config (id, data) VALUES (1, ?)
       ON DUPLICATE KEY UPDATE data = VALUES(data)`,
      [JSON.stringify(req.body)]
    );
    res.json({ success: true });
  } catch (error) {
    sendError(res, error, 'Unable to save the cafe website data.');
  }
});

app.post('/api/orders', requireSameOrigin, async (req, res) => {
  const body = req.body && typeof req.body === 'object' && !Array.isArray(req.body) ? req.body : {};
  const { name, email, phone, address, items } = body;
  if (typeof name !== 'string' || !name.trim() || name.trim().length > 100 ||
      typeof phone !== 'string' || !/^[+0-9() .-]{7,30}$/.test(phone.trim()) ||
      phone.replace(/\D/g, '').length < 7 || phone.replace(/\D/g, '').length > 15 ||
      typeof address !== 'string' || !address.trim() || address.trim().length > 2000 ||
      (email !== undefined && email !== '' && (typeof email !== 'string' || email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))) ||
      !Array.isArray(items) || items.length < 1 || items.length > 50) {
    return res.status(400).json({ message: 'Enter valid contact details and at least one menu item.' });
  }

  let connection;
  try {
    const cmsData = await getCmsData();
    if (!cmsData || !Array.isArray(cmsData.items)) {
      return res.status(503).json({ message: 'The cafe menu is not available for ordering right now.' });
    }

    const normalizedItems = [];
    let total = 0;
    for (const item of items) {
      if (!item || typeof item.name !== 'string' || !Number.isInteger(item.qty) || item.qty < 1 || item.qty > 50) {
        return res.status(400).json({ message: 'One or more order items are invalid.' });
      }
      const menuItem = cmsData.items.find(current => current.name === item.name);
      const price = menuItem ? Number(String(menuItem.price).replace(/[₱,\s]/g, '')) : NaN;
      if (!menuItem || !Number.isFinite(price) || price <= 0 || price > 99999999.99) {
        return res.status(400).json({ message: `The menu item "${item.name}" is no longer available.` });
      }
      normalizedItems.push({ name: menuItem.name, price, quantity: item.qty });
      total += price * item.qty;
      if (total > 99999999.99) {
        return res.status(400).json({ message: 'The order total is too large to process.' });
      }
    }

    connection = await pool.getConnection();
    await connection.beginTransaction();
    const [orderResult] = await connection.execute(
      `INSERT INTO orders (customer_name, customer_email, phone, address, total_price)
       VALUES (?, ?, ?, ?, ?)`,
      [name.trim(), email ? email.trim() : null, phone.trim(), address.trim(), total.toFixed(2)]
    );
    await connection.query(
      'INSERT INTO order_items (order_id, item_name, price, quantity) VALUES ?',
      [normalizedItems.map(item => [orderResult.insertId, item.name, item.price, item.quantity])]
    );
    await connection.commit();
    res.status(201).json({ success: true, orderId: orderResult.insertId, total });
  } catch (error) {
    if (connection) await connection.rollback();
    sendError(res, error, 'Unable to save the customer order.');
  } finally {
    if (connection) connection.release();
  }
});

app.get('/api/orders', requireAdmin, async (req, res) => {
  try {
    const [orders] = await pool.query(
      `SELECT id, customer_name, customer_email, phone, address, total_price, status, created_at
       FROM orders ORDER BY created_at DESC, id DESC LIMIT 500`
    );
    if (!orders.length) return res.json({ orders: [] });
    const ids = orders.map(order => order.id);
    const [items] = await pool.query(
      'SELECT order_id, item_name, price, quantity FROM order_items WHERE order_id IN (?) ORDER BY id',
      [ids]
    );
    const itemsByOrder = new Map();
    for (const item of items) {
      if (!itemsByOrder.has(item.order_id)) itemsByOrder.set(item.order_id, []);
      itemsByOrder.get(item.order_id).push(item);
    }
    res.json({
      orders: orders.map(order => ({
        ...order,
        items: itemsByOrder.get(order.id) || []
      }))
    });
  } catch (error) {
    sendError(res, error, 'Unable to load customer orders.');
  }
});

app.patch('/api/orders/:id/status', requireSameOrigin, requireAdmin, async (req, res) => {
  const allowedStatuses = ['pending', 'accepted', 'preparing', 'ready', 'completed', 'cancelled'];
  const orderId = Number(req.params.id);
  const body = req.body && typeof req.body === 'object' && !Array.isArray(req.body) ? req.body : {};
  if (!Number.isSafeInteger(orderId) || orderId < 1 || !allowedStatuses.includes(body.status)) {
    return res.status(400).json({ message: 'Select a valid order status.' });
  }
  try {
    const [result] = await pool.execute('UPDATE orders SET status = ? WHERE id = ?', [body.status, orderId]);
    if (!result.affectedRows) return res.status(404).json({ message: 'Order not found.' });
    res.json({ success: true });
  } catch (error) {
    sendError(res, error, 'Unable to update the order status.');
  }
});

app.get('/api/reports/orders.xlsx', requireAdmin, async (req, res) => {
  try {
    const [orders] = await pool.query(
      `SELECT id, customer_name, customer_email, phone, address, total_price, status, created_at
       FROM orders ORDER BY created_at DESC, id DESC`
    );
    const [items] = await pool.query(
      `SELECT oi.order_id, oi.item_name, oi.price, oi.quantity
       FROM order_items oi JOIN orders o ON o.id = oi.order_id
       ORDER BY o.created_at DESC, oi.id`
    );

    const workbook = new ExcelJS.Workbook();
    workbook.creator = 'Kremah Café';
    workbook.created = new Date();
    const orderSheet = workbook.addWorksheet('Orders');
    orderSheet.columns = [
      { header: 'Order ID', key: 'id', width: 12 },
      { header: 'Date', key: 'created_at', width: 22 },
      { header: 'Customer', key: 'customer_name', width: 26 },
      { header: 'Email', key: 'customer_email', width: 32 },
      { header: 'Phone', key: 'phone', width: 20 },
      { header: 'Address / Notes', key: 'address', width: 48 },
      { header: 'Total (PHP)', key: 'total_price', width: 16 },
      { header: 'Status', key: 'status', width: 16 }
    ];
    orderSheet.addRows(orders);
    const itemSheet = workbook.addWorksheet('Order items');
    itemSheet.columns = [
      { header: 'Order ID', key: 'order_id', width: 12 },
      { header: 'Menu item', key: 'item_name', width: 34 },
      { header: 'Unit price (PHP)', key: 'price', width: 20 },
      { header: 'Quantity', key: 'quantity', width: 12 },
      { header: 'Line total (PHP)', key: 'line_total', width: 20 }
    ];
    itemSheet.addRows(items.map(item => ({ ...item, line_total: Number(item.price) * item.quantity })));
    for (const sheet of [orderSheet, itemSheet]) {
      sheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };
      sheet.getRow(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF4A2F1A' } };
      sheet.views = [{ state: 'frozen', ySplit: 1 }];
      sheet.autoFilter = { from: 'A1', to: `${String.fromCharCode(64 + sheet.columnCount)}1` };
    }
    const buffer = await workbook.xlsx.writeBuffer();
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename="kremah-orders-${new Date().toISOString().slice(0, 10)}.xlsx"`);
    res.send(buffer);
  } catch (error) {
    sendError(res, error, 'Unable to create the Excel order report.');
  }
});

app.use(['/server.js', '/schema.sql', '/package.json', '/package-lock.json', '/README.md', '/.env.example', '/.gitignore'], (req, res) => res.sendStatus(404));
app.use(express.static(path.join(__dirname), { extensions: ['html'] }));
app.use((error, req, res, next) => {
  console.error('Unhandled server error.', error);
  if (res.headersSent) return next(error);
  res.status(500).json({ message: 'An unexpected server error occurred.' });
});

initializeDatabase()
  .then(() => {
    app.listen(port, () => console.log(`Kremah website and API listening on http://localhost:${port}`));
  })
  .catch(error => {
    console.error('Unable to initialize the Kremah database.', error);
    process.exitCode = 1;
  });

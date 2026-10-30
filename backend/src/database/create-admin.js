
require("dotenv").config();

const bcrypt = require("bcryptjs");
const db = require("./connection");

async function main() {
  const email = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  const password = process.env.ADMIN_PASSWORD;

  if (!email || !password) {
    throw new Error(
      "Set ADMIN_EMAIL and ADMIN_PASSWORD in the backend environment first."
    );
  }

  if (
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ||
    password.length < 12 ||
    password.length > 72
  ) {
    throw new Error(
      "Use a valid email and a password between 12 and 72 characters."
    );
  }

  const existing = db.prepare(
    "SELECT id FROM admin_users WHERE email = ?"
  ).get(email);

  if (existing) {
    throw new Error(
      "That admin account already exists. No changes were made."
    );
  }

  const passwordHash = await bcrypt.hash(password, 12);

  db.prepare(`
    INSERT INTO admin_users (email, password_hash, role)
    VALUES (?, ?, 'admin')
  `).run(email, passwordHash);

  console.log(`Admin account created for ${email}.`);
}

main().catch(error => {
  console.error(error.message);
  process.exitCode = 1;
});

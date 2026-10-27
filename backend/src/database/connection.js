
const Database = require("better-sqlite3");
const path = require("node:path");
const fs = require("node:fs");

const databasePath = path.resolve(
  __dirname,
  "../../data/kremah-dev.sqlite"
);

fs.mkdirSync(path.dirname(databasePath), { recursive: true });

const db = new Database(databasePath);

db.pragma("foreign_keys = ON");
db.pragma("journal_mode = WAL");
db.pragma("busy_timeout = 5000");

module.exports = db;


const fs = require("node:fs");
const path = require("node:path");
const Database = require("better-sqlite3");

const databaseDirectory = path.resolve(__dirname, "../../data");
const databasePath = path.join(databaseDirectory, "kremah-dev.sqlite");

fs.mkdirSync(databaseDirectory, { recursive: true });

const db = new Database(databasePath);

try {
    db.pragma("foreign_keys = ON");
    db.pragma("journal_mode = WAL");
    db.pragma("busy_timeout = 5000");

    const migrationDirectory = path.join(__dirname, "migrations");
    const migrationFiles = fs
        .readdirSync(migrationDirectory)
        .filter((file) => /^\d+_.+\.sql$/.test(file))
        .sort();

    db.exec(`
    CREATE TABLE IF NOT EXISTS schema_migrations (
      version TEXT PRIMARY KEY,
      applied_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    )
  `);

    for (const file of migrationFiles) {
        const applied = db
            .prepare("SELECT 1 FROM schema_migrations WHERE version = ?")
            .get(file);

        if (applied) {
            console.log(`Already applied: ${file}`);
            continue;
        }

        const sql = fs.readFileSync(
            path.join(migrationDirectory, file),
            "utf8"
        );

        const applyMigration = db.transaction(() => {
            db.exec(sql);

            db.prepare(
                "INSERT INTO schema_migrations (version) VALUES (?)"
            ).run(file);
        });

        applyMigration();
        console.log(`Applied: ${file}`);
    }

    console.log("Database migrations completed.");
    console.log(`Database: ${databasePath}`);
} catch (error) {
    console.error("Database migration failed:", error.message);
    process.exitCode = 1;
} finally {
    db.close();
}

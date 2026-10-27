
const { spawn } = require("node:child_process");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const npm = process.platform === "win32" ? "npm.cmd" : "npm";

const children = [];
let shuttingDown = false;

function run(label, args, cwd) {
  const child = spawn(npm, args, {
    cwd,
    env: process.env,
    stdio: "inherit",
    shell: process.platform === "win32",
  });

  children.push({ label, child });

  child.on("error", (error) => {
    console.error(`[${label}] Failed to start: ${error.message}`);
    shutdown(1);
  });

  child.on("exit", (code, signal) => {
    if (shuttingDown) return;

    if (code !== 0 || signal) {
      console.error(
        `[${label}] Exited unexpectedly (code=${code}, signal=${signal}).`
      );
      shutdown(code || 1);
    }
  });

  return child;
}

function shutdown(exitCode = 0) {
  if (shuttingDown) return;
  shuttingDown = true;

  console.log("\nStopping KremahCafe development services...");

  for (const { child } of children) {
    if (!child.killed && child.exitCode === null) {
      child.kill();
    }
  }

  const timeout = setTimeout(() => {
    for (const { child } of children) {
      if (child.exitCode === null) child.kill("SIGKILL");
    }
    process.exit(exitCode);
  }, 5000);

  timeout.unref();

  Promise.all(
    children.map(
      ({ child }) =>
        new Promise((resolve) => {
          if (child.exitCode !== null || child.signalCode !== null) {
            resolve();
          } else {
            child.once("exit", resolve);
          }
        })
    )
  ).then(() => {
    clearTimeout(timeout);
    process.exit(exitCode);
  });
}

process.on("SIGINT", () => shutdown(0));
process.on("SIGTERM", () => shutdown(0));

console.log("Running database migrations...");
const migration = spawn(
  process.execPath,
  ["src/database/migrate.js"],
  {
    cwd: path.join(root, "backend"),
    env: process.env,
    stdio: "inherit",
  }
);

migration.on("error", (error) => {
  console.error("Could not run database migrations:", error.message);
  shutdown(1);
});

migration.on("exit", (code) => {
  if (shuttingDown) return;

  if (code !== 0) {
    console.error("Database migrations failed. Services were not started.");
    shutdown(code || 1);
    return;
  }

  console.log("Starting backend and frontend...");
  run("backend", ["run", "dev"], path.join(root, "backend"));
  run("frontend", ["run", "dev", "--", "--host", "127.0.0.1"], path.join(root, "frontend"));
});

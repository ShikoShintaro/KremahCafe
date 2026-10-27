
const app = require("./app");
const db = require("./database/connection");

const PORT = Number(process.env.PORT) || 3000;
const HOST = process.env.HOST || "127.0.0.1";

const server = app.listen(PORT, HOST, () => {
  console.log(`KremahCafe API: http://${HOST}:${PORT}`);
  console.log(`Health check: http://${HOST}:${PORT}/api/v1/health`);
});

function shutdown() {
  console.log("\nShutting down KremahCafe API...");

  server.close(() => {
    db.close();
    process.exit(0);
  });

  setTimeout(() => process.exit(1), 5000).unref();
}

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);

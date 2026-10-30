
require("dotenv").config();

const app = require("./app");
const db = require("./database/connection");
const ngrok = require("@ngrok/ngrok");

const PORT = Number(process.env.PORT) || 3000;
const HOST = process.env.HOST || "127.0.0.1";

let forwarder;

const server = app.listen(PORT, HOST, async () => {
  console.log(`KremahCafe API: http://${HOST}:${PORT}`);
  console.log(`Health check: http://${HOST}:${PORT}/api/v1/health`);

  try {
    forwarder = await ngrok.forward({
      addr: `http://${HOST}:${PORT}`,
      authtoken_from_env: true,
    });

    console.log(`Public API: ${forwarder.url()}`);
  } catch (error) {
    console.error("ngrok error:", error.message);
  }
});

async function shutdown() {
  console.log("\nShutting down KremahCafe API...");

  if (forwarder) {
    try {
      await forwarder.close();
    } catch (error) {
      console.error("Error closing ngrok:", error.message);
    }
  }

  server.close(() => {
    db.close();
    process.exit(0);
  });

  setTimeout(() => process.exit(1), 5000).unref();
}

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);

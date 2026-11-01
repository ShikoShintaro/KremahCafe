require("dotenv").config();

const app = require("./app");
const db = require("./database/connection");
const ngrok = require("@ngrok/ngrok");

const PORT = Number(process.env.PORT || 3000);
const HOST = process.env.HOST || "127.0.0.1";

let server = null;
let ngrokSession = null;
let ngrokTunnel = null;
let shuttingDown = false;

async function startNgrok() {
  if (!process.env.NGROK_AUTHTOKEN) {
    throw new Error("NGROK_AUTHTOKEN is missing from .env");
  }

  if (!process.env.NGROK_DOMAIN) {
    throw new Error("NGROK_DOMAIN is missing from .env");
  }

  ngrokSession = await new ngrok.SessionBuilder()
    .authtoken(process.env.NGROK_AUTHTOKEN)
    .connect();

  ngrokTunnel = await ngrokSession
    .httpEndpoint()
    .domain(process.env.NGROK_DOMAIN)
    .requestHeader("ngrok-skip-browser-warning", "true")
    .listen();

  ngrokTunnel.forward(`http://${HOST}:${PORT}`);

  console.log(`[NGROK] Tunnel established: ${ngrokTunnel.url()}`);
}

async function startServer() {
  try {
    server = await new Promise((resolve, reject) => {
      const instance = app.listen(PORT, HOST);

      instance.once("listening", () => resolve(instance));
      instance.once("error", reject);
    });

    console.log(`[SERVER] Running at http://${HOST}:${PORT}`);

    try {
      await startNgrok();
    } catch (error) {
      console.error("[NGROK ERROR]", error);
    }
  } catch (error) {
    console.error("[SERVER ERROR]", error);
    await shutdown("STARTUP FAILURE");
    process.exitCode = 1;
  }
}

async function shutdown(signal) {
  if (shuttingDown) return;

  shuttingDown = true;
  console.log(`[SERVER] ${signal} received. Shutting down...`);

  try {
    if (ngrokTunnel) {
      await ngrokTunnel.close();
      ngrokTunnel = null;
    }

    if (ngrokSession) {
      await ngrokSession.close();
      ngrokSession = null;
    }

    if (server) {
      await new Promise((resolve, reject) => {
        server.close((error) => {
          if (error) reject(error);
          else resolve();
        });
      });

      server = null;
    }

    if (db && typeof db.close === "function") {
      db.close();
    }

    console.log("[SERVER] Shutdown complete.");
  } catch (error) {
    console.error("[SHUTDOWN ERROR]", error);
    process.exitCode = 1;
  }
}

process.on("SIGINT", () => shutdown("SIGINT"));
process.on("SIGTERM", () => shutdown("SIGTERM"));

process.on("unhandledRejection", (error) => {
  console.error("[UNHANDLED REJECTION]", error);
});

process.on("uncaughtException", (error) => {
  console.error("[UNCAUGHT EXCEPTION]", error);
  shutdown("UNCAUGHT EXCEPTION").finally(() => process.exit(1));
});

startServer();
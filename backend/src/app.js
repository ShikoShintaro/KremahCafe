
require("dotenv").config();

const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const cookie = require("cookie");

const app = express();

app.disable("x-powered-by");
app.use(helmet());

app.use(cors({
  origin: process.env.CORS_ORIGIN || "http://localhost:5173",
  credentials: true,
}));

app.use(express.json({ limit: "100kb" }));
app.use((req, res, next) => {
  req.cookies = cookie.parseCookie(req.headers.cookie || "");
  next();
});

app.use("/api/", rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 300,
  standardHeaders: "draft-7",
  legacyHeaders: false,
}));

app.get("/", (req, res) => {
  res.json({
    name: "KremahCafe API",
    version: "1.0.0",
    docs: "/api/v1/health",
  });
});

app.use("/api/v1/health", require("./routes/health"));
app.use("/api/v1/orders", require("./routes/orders"));
app.use("/api/v1/auth", require("./routes/auth"));
app.use("/api/v1/admin", require("./routes/admin"));
app.use("/api/v1/admin/catalog", require("./routes/admin-catalog"));
app.use("/api/v1", require("./routes/catalog"));

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "API endpoint not found",
  });
});

app.use((error, req, res, next) => {
  console.error(error);

  if (res.headersSent) {
    return next(error);
  }

  res.status(error.status || 500).json({
    success: false,
    message: error.status && error.status < 500
      ? error.message
      : "Internal server error",
  });
});

module.exports = app;

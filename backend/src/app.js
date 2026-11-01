
require("dotenv").config();

const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const cookie = require("cookie");

const app = express();

app.set("trust proxy", 1);
app.disable("x-powered-by");
app.use(helmet());

const allowedOrigins = [
  "http://localhost:5173",
  "http://192.168.100.7:5173",
  "https://kremah-cafe.vercel.app",
];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    return callback(new Error(`CORS blocked: ${origin}`));
  },
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
app.use("/api/v1/customer-auth", require("./routes/customer-auth"));

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

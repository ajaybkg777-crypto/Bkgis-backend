require("dotenv").config();
const express = require("express");
const cors = require("cors");
const path = require("path");
const fs = require("fs");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const compression = require("compression");

const connectDB = require("./config/db");

const app = express();

/* ==================================================
   ENV & BASIC SECURITY
================================================== */
if (!process.env.JWT_SECRET) {
  throw new Error("JWT_SECRET is missing in environment variables");
}

app.set("trust proxy", 1);

/* ==================================================
   SECURITY MIDDLEWARE
================================================== */
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
  })
);

app.use(compression());

app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 200,
    standardHeaders: true,
    legacyHeaders: false,
  })
);

/* ==================================================
   CORS CONFIG
================================================== */
const allowedOrigins = process.env.CORS_ORIGIN
  ? process.env.CORS_ORIGIN.split(",")
  : [];

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true); // Postman / Server calls

      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      // Temporary safe allow (tighten in production)
      return callback(null, true);
    },
    credentials: true,
  })
);

/* ==================================================
   BODY PARSERS
================================================== */
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

/* ==================================================
   STATIC FILE DIRECTORIES
================================================== */
const uploadDirs = [
  "uploads",
  "uploads/gallery",
  "uploads/announcements",
];

uploadDirs.forEach((dir) => {
  const fullPath = path.join(__dirname, dir);
  if (!fs.existsSync(fullPath)) {
    fs.mkdirSync(fullPath, { recursive: true });
  }
});

app.use("/uploads", express.static(path.join(__dirname, "uploads")));

/* ==================================================
   DATABASE CONNECTION
================================================== */
connectDB();

/* ==================================================
   PUBLIC ROUTES
================================================== */
app.use("/api/public/gallery", require("./routes/public/gallery"));
app.use("/api/public/results", require("./routes/public/results"));
app.use("/api/public/announcements", require("./routes/public/announcements"));
app.use("/api/public/achievements", require("./routes/public/achievements"));
app.use("/api/public/disclosures", require("./routes/public/disclosures"));
app.use("/api/public/calendar", require("./routes/public/calendar"));
app.use("/api/public/counseling", require("./routes/public/counseling"));
app.use("/api/public/contact", require("./routes/public/contact"));

/* ==================================================
   ADMIN ROUTES (PROTECTED)
================================================== */
app.use("/api/admin/auth", require("./routes/admin/auth"));
app.use("/api/admin/gallery", require("./routes/admin/gallery"));
app.use("/api/admin/results", require("./routes/admin/results"));
app.use("/api/admin/announcements", require("./routes/admin/announcements"));
app.use("/api/admin/achievements", require("./routes/admin/achievements"));
app.use("/api/admin/disclosures", require("./routes/admin/disclosures"));
app.use("/api/admin/calendar", require("./routes/admin/calendar"));
app.use("/api/admin/counseling", require("./routes/admin/counseling"));
app.use("/api/admin/adminLeads", require("./routes/admin/adminLeads"));

/* ==================================================
   PDF VIEW ROUTE (PRODUCTION)
================================================== */
/* ==================================================
   HEALTH CHECK
================================================== */
app.get("/api/health", (req, res) => {
  res.json({
    status: "OK",
    uptime: process.uptime(),
    time: new Date(),
  });
});

/* ==================================================
   404 HANDLER
================================================== */
app.use((req, res) => {
  res.status(404).json({ message: "Route not found" });
});

/* ==================================================
   START SERVER
================================================== */
const PORT = process.env.PORT || 5000;
app.listen(PORT, () =>
  console.log(`🚀 Server running on port ${PORT}`)
);

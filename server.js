require("dotenv").config();
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const compression = require("compression");
const path = require("path");
const fs = require("fs");

const connectDB = require("./config/db");

const app = express();

/* ================= SECURITY ================= */
app.set("trust proxy", 1);

app.use(
  helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
  })
);

app.use(compression());

app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 300,
  })
);

/* ================= CORS ================= */
app.use(
  cors({
    origin: process.env.CORS_ORIGIN?.split(",") || "*",
    credentials: true,
  })
);

/* ================= BODY PARSER ================= */
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

/* ================= FILE SYSTEM ================= */
const folders = [
  "uploads",
  "uploads/gallery",
  "uploads/announcements",
  "uploads/disclosures"
];

folders.forEach(dir => {
  const fullPath = path.join(__dirname, dir);
  if (!fs.existsSync(fullPath)) fs.mkdirSync(fullPath, { recursive: true });
});

app.use("/uploads", express.static(path.join(__dirname, "uploads")));

/* ================= DATABASE ================= */
connectDB();

/* ================= ROUTES ================= */
app.use("/api/public/gallery", require("./routes/public/gallery"));
app.use("/api/public/results", require("./routes/public/results"));
app.use("/api/public/announcements", require("./routes/public/announcements"));
app.use("/api/public/disclosures", require("./routes/public/disclosures"));
app.use("/api/public/calendar", require("./routes/public/calendar"));
app.use("/api/public/counseling", require("./routes/public/counseling"));

app.use("/api/admin/auth", require("./routes/admin/auth"));
app.use("/api/admin/gallery", require("./routes/admin/gallery"));
app.use("/api/admin/results", require("./routes/admin/results"));
app.use("/api/admin/announcements", require("./routes/admin/announcements"));
app.use("/api/admin/disclosures", require("./routes/admin/disclosures"));
app.use("/api/admin/calendar", require("./routes/admin/calendar"));
app.use("/api/admin/counseling", require("./routes/admin/counseling"));

/* ================= HEALTH ================= */
app.get("/api/health", (req, res) => {
  res.json({ status: "OK", time: new Date() });
});

/* ================= ERROR HANDLER ================= */
app.use((err, req, res, next) => {
  console.error("🔥 SERVER ERROR:", err);
  res.status(500).json({ message: "Internal Server Error" });
});

/* ================= START SERVER ================= */
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));

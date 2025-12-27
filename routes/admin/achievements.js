const express = require("express");
const path = require("path");
const multer = require("multer");
const Achievement = require("../../models/Achievement");
const verifyAdmin = require("../../middleware/auth");

const router = express.Router();

/* ============================
   MULTER CONFIG
============================ */
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, "../../uploads/achievements"));
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname.replace(/\s+/g, "_")}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 6 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed = /jpeg|jpg|png|gif|pdf/;
    const ext = path.extname(file.originalname).toLowerCase();
    if (!allowed.test(ext)) {
      return cb(new Error("INVALID_FILE_TYPE"));
    }
    cb(null, true);
  },
});

/* ============================
   CREATE ACHIEVEMENT
============================ */
router.post("/", verifyAdmin, upload.single("file"), async (req, res) => {
  try {
    const { title, description, date } = req.body;

    if (!title)
      return res.status(400).json({ error: "TITLE_REQUIRED" });

    const filePath = req.file
      ? `/uploads/achievements/${req.file.filename}`
      : null;

    const achievement = await Achievement.create({
      title,
      description: description || "",
      date: date ? new Date(date) : undefined,
      file: filePath,
      createdBy: req.admin.id,
    });

    res.status(201).json(achievement);
  } catch (err) {
    console.error("CREATE ACHIEVEMENT ERROR:", err);
    res.status(500).json({ error: "CREATE_FAILED" });
  }
});

module.exports = router;

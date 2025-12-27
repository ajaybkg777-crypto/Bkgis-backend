const express = require("express");
const path = require("path");
const multer = require("multer");
const Announcement = require("../../models/Announcement");
const verifyAdmin = require("../../middleware/auth");

const router = express.Router();

/* =======================
   MULTER CONFIG
======================= */
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, "../../uploads/announcements"));
  },
  filename: (req, file, cb) => {
    const safe = file.originalname.replace(/\s+/g, "_");
    cb(null, `${Date.now()}-${safe}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 6 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed = /jpeg|jpg|png|gif|pdf/;
    const ext = file.originalname.split(".").pop().toLowerCase();
    if (!allowed.test(ext)) {
      return cb(new Error("INVALID_FILE_TYPE"));
    }
    cb(null, true);
  },
});

/* ============================
   CREATE ANNOUNCEMENT
============================ */
router.post("/", verifyAdmin, upload.single("attachments"), async (req, res) => {
  try {
    const { title, body } = req.body;

    if (!title || !body)
      return res.status(400).json({ error: "TITLE_BODY_REQUIRED" });

    const filePath = req.file
      ? `/uploads/announcements/${req.file.filename}`
      : null;

    const announcement = await Announcement.create({
      title,
      body,
      attachments: filePath,
      createdBy: req.admin.id,
    });

    res.status(201).json(announcement);
  } catch (err) {
    console.error("ANNOUNCEMENT ERROR:", err);
    res.status(500).json({ error: "UPLOAD_FAILED" });
  }
});

module.exports = router;

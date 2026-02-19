const express = require("express");
const multer = require("multer");
const cloudinary = require("../../utils/cloudinary");
const Gallery = require("../../models/Gallery");
const verifyAdmin = require("../../middleware/auth");

const router = express.Router();

/* =============================
   MULTER MEMORY STORAGE
============================= */
const upload = multer({
  storage: multer.memoryStorage(),
});

/* =============================
   UPLOAD GALLERY (PHOTO / VIDEO)
============================= */
router.post("/", verifyAdmin, upload.single("file"), async (req, res) => {
  try {
    const { event, category, type, videoLink } = req.body;

    /* ---------- BASIC VALIDATION ---------- */
    if (!event || !category) {
      return res.status(400).json({ error: "EVENT_AND_CATEGORY_REQUIRED" });
    }

    const cleanCategory = category.toLowerCase().trim();
    if (!["junior", "senior"].includes(cleanCategory)) {
      return res.status(400).json({ error: "INVALID_CATEGORY" });
    }

    /* ================= PHOTO ================= */
    if (type === "photo") {
      if (!req.file) {
        return res.status(400).json({ error: "PHOTO_FILE_REQUIRED" });
      }

      const uploadResult = await cloudinary.uploader.upload(
        `data:${req.file.mimetype};base64,${req.file.buffer.toString("base64")}`,
        { folder: "bkgis/gallery/photos" }
      );

      const newItem = await Gallery.create({
        event: event.trim(),
        category: cleanCategory,
        type: "photo",
        url: uploadResult.secure_url,
        public_id: uploadResult.public_id,
      });

      return res.status(201).json(newItem);
    }

    /* ================= VIDEO ================= */
    if (type === "video") {
      if (!videoLink) {
        return res.status(400).json({ error: "VIDEO_LINK_REQUIRED" });
      }

      if (!req.file) {
        return res.status(400).json({ error: "THUMBNAIL_REQUIRED" });
      }

      const uploadResult = await cloudinary.uploader.upload(
        `data:${req.file.mimetype};base64,${req.file.buffer.toString("base64")}`,
        { folder: "bkgis/gallery/thumbnails" }
      );

      const newItem = await Gallery.create({
        event: event.trim(),
        category: cleanCategory,
        type: "video",
        url: uploadResult.secure_url, // thumbnail
        public_id: uploadResult.public_id,
        videoLink: videoLink.trim(),
      });

      return res.status(201).json(newItem);
    }

    /* ---------- INVALID TYPE ---------- */
    return res.status(400).json({ error: "INVALID_MEDIA_TYPE" });

  } catch (error) {
    console.error("GALLERY UPLOAD ERROR:", error);
    res.status(500).json({ error: "UPLOAD_FAILED" });
  }
});

module.exports = router;

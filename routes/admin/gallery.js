const express = require("express");
const multer = require("multer");
const cloudinary = require("../../utils/cloudinary");
const gallery = require("../../models/gallery");
const verifyAdmin = require("../../middleware/auth");

const router = express.Router();

/* =============================
   MULTER (MEMORY STORAGE)
============================= */
const storage = multer.diskStorage({});
const upload = multer({ storage });

/* =============================
   UPLOAD GALLERY IMAGE
============================= */
router.post("/", verifyAdmin, upload.single("photo"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "NO_FILE_UPLOADED" });
    }

    const event = (req.body.event || "").trim();
    const category = (req.body.category || "").toLowerCase().trim();

    if (!event || !category) {
      return res.status(400).json({ error: "EVENT_AND_CATEGORY_REQUIRED" });
    }

    if (!["junior", "senior"].includes(category)) {
      return res.status(400).json({ error: "INVALID_CATEGORY" });
    }

    // 🔥 Upload to Cloudinary
    const result = await cloudinary.uploader.upload(req.file.path, {
      folder: "bkgis/gallery",
      resource_type: "image",
    });

    const newItem = new gallery({
      event,
      category,
      url: result.secure_url, // 🔥 IMPORTANT
      public_id: result.public_id,
    });

    await newItem.save();

    res.status(201).json(newItem);
  } catch (error) {
    console.error("GALLERY UPLOAD ERROR:", error);
    res.status(500).json({ error: "UPLOAD_FAILED" });
  }
});

module.exports = router;

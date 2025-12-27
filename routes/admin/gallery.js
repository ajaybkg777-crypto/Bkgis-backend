const express = require("express");
const upload = require("../../middleware/uploadGallery");
const Gallery = require("../../models/Gallery");
const verifyAdmin = require("../../middleware/auth");

const router = express.Router();

/* ============================
   UPLOAD GALLERY IMAGE
============================ */
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

    const allowed = ["junior", "senior"];
    if (!allowed.includes(category)) {
      return res.status(400).json({ error: "INVALID_CATEGORY" });
    }

    const newItem = new Gallery({
      event,
      category,
      url: "/uploads/gallery/" + req.file.filename,
    });

    await newItem.save();
    res.status(201).json(newItem);
  } catch (err) {
    console.error("UPLOAD ERROR:", err);
    res.status(500).json({ error: "UPLOAD_FAILED" });
  }
});

module.exports = router;

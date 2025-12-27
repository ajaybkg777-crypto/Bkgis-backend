const express = require("express");
const Gallery = require("../../models/Gallery");

const router = express.Router();

/* ============================
   GET ALL GALLERY ITEMS
============================ */
router.get("/", async (req, res) => {
  try {
    const items = await Gallery.find().sort({ createdAt: -1 });
    res.json(items);
  } catch (err) {
    console.error("GALLERY FETCH ERROR:", err);
    res.status(500).json({ error: "FETCH_FAILED" });
  }
});

module.exports = router;

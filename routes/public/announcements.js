const express = require("express");
const Announcement = require("../../models/Announcement");

const router = express.Router();

/* ============================
   GET ALL ANNOUNCEMENTS
============================ */
router.get("/", async (req, res) => {
  try {
    const items = await Announcement.find()
      .sort({ createdAt: -1 })
      .lean();

    res.json(items);
  } catch (err) {
    console.error("FETCH ANNOUNCEMENTS ERROR:", err);
    res.status(500).json({ error: "FETCH_FAILED" });
  }
});

module.exports = router;

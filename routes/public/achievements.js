const express = require("express");
const Achievement = require("../../models/Achievement");

const router = express.Router();

/* ============================
   GET ALL ACHIEVEMENTS (PUBLIC)
============================ */
router.get("/", async (req, res) => {
  try {
    const items = await Achievement.find()
      .sort({ date: -1, createdAt: -1 })
      .lean();

    res.json(items);
  } catch (err) {
    console.error("FETCH ACHIEVEMENTS ERROR:", err);
    res.status(500).json({ error: "FAILED_TO_FETCH" });
  }
});

module.exports = router;

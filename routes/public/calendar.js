const express = require("express");
const Calendar = require("../../models/Calendar");

const router = express.Router();

/* ============================
   GET ALL EVENTS (PUBLIC)
============================ */
router.get("/", async (req, res) => {
  try {
    const events = await Calendar.find().sort({ date: 1 });
    res.json(events);
  } catch (err) {
    res.status(500).json({ error: "FETCH_FAILED" });
  }
});

module.exports = router;

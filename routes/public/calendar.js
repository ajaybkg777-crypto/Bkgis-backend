// routes/admin/calendar.js
const express = require("express");
const router = express.Router();
const Calendar = require("../../models/Calendar");

router.get("/", async (req, res) => {
  try {
    const data = await Calendar.find().sort({ date: -1 });
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: "Failed to load calendar" });
  }
});

module.exports = router;

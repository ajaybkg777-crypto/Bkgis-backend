const express = require("express");
const Calendar = require("../../models/Calendar");
const verifyAdmin = require("../../middleware/auth");

const router = express.Router();

/* ============================
   ADD EVENT (ADMIN)
============================ */
router.post("/", verifyAdmin, async (req, res) => {
  try {
    const { title, description, date } = req.body;

    if (!title || !date) {
      return res.status(400).json({ error: "TITLE_AND_DATE_REQUIRED" });
    }

    const newEvent = await Calendar.create({
      title,
      description,
      date,
    });

    res.json(newEvent);
  } catch (err) {
    res.status(500).json({ error: "CREATE_FAILED" });
  }
});

/* ============================
   DELETE EVENT (OPTIONAL)
============================ */
router.delete("/:id", verifyAdmin, async (req, res) => {
  try {
    await Calendar.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: "DELETE_FAILED" });
  }
});

module.exports = router;

const express = require("express");
const Result = require("../../models/Result");

const router = express.Router();

/* ============================
   PUBLIC GET RESULT
============================ */
router.get("/", async (req, res) => {
  try {
    let { roll, pin, class: cls, exam, name } = req.query;

    if (!roll || !pin || !cls || !exam) return res.json([]);

    const query = {
      roll: roll.trim(),
      pin: pin.trim(),
      class: cls.trim(),
      exam: exam.trim(),
    };

    if (name?.trim()) {
      query.name = new RegExp("^" + name.trim(), "i");
    }

    const result = await Result.find(query);
    res.json(result);
  } catch (err) {
    console.error("PUBLIC RESULT ERROR:", err);
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;

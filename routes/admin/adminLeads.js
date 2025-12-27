const express = require("express");
const router = express.Router();
const Counseling = require("../../models/Counseling");
const auth = require("../../middleware/auth");

router.get("/counseling", auth, async (req, res) => {
  try {
    const leads = await Counseling.find()
      .sort({ createdAt: -1 })
      .select("-__v");

    res.json(leads);
  } catch {
    res.status(500).json({ message: "Failed to load leads" });
  }
});

module.exports = router;

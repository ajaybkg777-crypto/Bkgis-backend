const express = require("express");
const Disclosure = require("../../models/Disclosure");

const router = express.Router();

/* =====================================
   GET ALL DISCLOSURE DATA (PUBLIC)
===================================== */
router.get("/", async (req, res) => {
  try {
    let data = await Disclosure.findOne().lean();
    if (!data) data = await Disclosure.create({});
    res.json(data);
  } catch (err) {
    console.error("DISCLOSURE FETCH ERROR:", err);
    res.status(500).json({ error: "Failed to fetch disclosure data" });
  }
});

module.exports = router;

const express = require("express");
const router = express.Router();
const Counseling = require("../../models/Counseling");
const verifyAdmin = require("../../middleware/auth");

/* ============================
   GET ALL COUNSELING LEADS
============================ */
router.get("/", verifyAdmin, async (req, res) => {
  try {
    const leads = await Counseling.find().sort({ createdAt: -1 });
    res.json(leads);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch leads" });
  }
});

/* ============================
   DELETE LEAD (OPTIONAL)
============================ */
router.delete("/:id", verifyAdmin, async (req, res) => {
  try {
    await Counseling.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch {
    res.status(500).json({ error: "Delete failed" });
  }
});

module.exports = router;

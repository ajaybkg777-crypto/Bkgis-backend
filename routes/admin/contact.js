const express = require("express");
const router = express.Router();
const Contact = require("../../models/Contact");
const TCRequest = require("../../models/TCRequest");
const verifyAdmin = require("../../middleware/auth");

/* ===========================
   GET ALL CONTACT MESSAGES
=========================== */
router.get("/contacts", verifyAdmin, async (req, res) => {
  const data = await Contact.find().sort({ createdAt: -1 });
  res.json(data);
});

/* ===========================
   GET ALL TC REQUESTS
=========================== */
router.get("/tc-requests", verifyAdmin, async (req, res) => {
  const data = await TCRequest.find().sort({ createdAt: -1 });
  res.json(data);
});

/* ===========================
   DELETE CONTACT
=========================== */
router.delete("/contact/:id", verifyAdmin, async (req, res) => {
  await Contact.findByIdAndDelete(req.params.id);
  res.json({ success: true });
});

/* ===========================
   DELETE TC REQUEST
=========================== */
router.delete("/tc/:id", verifyAdmin, async (req, res) => {
  await TCRequest.findByIdAndDelete(req.params.id);
  res.json({ success: true });
});

module.exports = router;

const express = require("express");
const router = express.Router();
const Counseling = require("../../models/Counseling");

/* ============================
   CHECK DEVICE
============================ */
router.post("/check-device", async (req, res) => {
  const { deviceId } = req.body;

  const exists = await Counseling.findOne({ deviceId });
  res.json({ showForm: !exists });
});

/* ============================
   SUBMIT FORM
============================ */
router.post("/submit", async (req, res) => {
  const { name, phone, city, deviceId } = req.body;

  if (!name?.trim())
    return res.status(400).json({ message: "Name required" });

  if (!city?.trim())
    return res.status(400).json({ message: "City required" });

  if (!/^[6-9]\d{9}$/.test(phone))
    return res.status(400).json({ message: "Invalid phone number" });

  const deviceUsed = await Counseling.findOne({ deviceId });
  if (deviceUsed)
    return res.status(403).json({ message: "Already submitted from this device" });

  const phoneUsed = await Counseling.findOne({ phone });
  if (phoneUsed)
    return res.status(409).json({ message: "Phone already registered" });

  await Counseling.create({
    name: name.trim(),
    phone,
    city: city.trim(),
    deviceId,
    isVerified: true,
  });

  res.json({ verified: true });
});

module.exports = router;

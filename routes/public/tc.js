const express = require("express");
const TransferCertificate = require("../../models/TransferCertificate");

const router = express.Router();

const normalize = (value = "") => value.trim().replace(/\s+/g, " ").toLowerCase();
const toDateKey = (value = "") => String(value).slice(0, 10);
const toUTCDate = (dateKey) => new Date(`${dateKey}T00:00:00.000Z`);

router.get("/", async (req, res) => {
  try {
    const { studentName, fatherName, dateOfBirth } = req.query;
    const dateKey = toDateKey(dateOfBirth);

    if (!studentName || !fatherName || !dateKey) {
      return res.status(400).json({ message: "studentName, fatherName and dateOfBirth are required" });
    }

    const normalizedStudentName = normalize(studentName);
    const normalizedFatherName = normalize(fatherName);
    const startOfDay = toUTCDate(dateKey);
    const endOfDay = new Date(startOfDay);
    endOfDay.setUTCDate(endOfDay.getUTCDate() + 1);

    const record = await TransferCertificate.findOne({
      studentName: normalizedStudentName,
      fatherName: normalizedFatherName,
      $or: [
        { dateKey },
        { dateOfBirth: { $gte: startOfDay, $lt: endOfDay } },
      ],
    });

    if (!record) {
      return res.status(404).json({ message: "TC not found" });
    }

    return res.json({ pdfUrl: record.pdfUrl });
  } catch (error) {
    return res.status(500).json({ message: "Failed to fetch TC" });
  }
});

module.exports = router;

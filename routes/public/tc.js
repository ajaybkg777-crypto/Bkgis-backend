const express = require("express");
const TransferCertificate = require("../../models/TransferCertificate");

const router = express.Router();

const normalize = (value = "") => value.trim().replace(/\s+/g, " ").toLowerCase();

router.get("/", async (req, res) => {
  try {
    const { studentName, fatherName, scholarNumber } = req.query;

    if (!studentName || !fatherName || !scholarNumber) {
      return res.status(400).json({ message: "studentName, fatherName and scholarNumber are required" });
    }

    const normalizedStudentName = normalize(studentName);
    const normalizedFatherName = normalize(fatherName);
    const normalizedScholarNumber = normalize(scholarNumber);

    const record = await TransferCertificate.findOne({
      studentName: normalizedStudentName,
      fatherName: normalizedFatherName,
      scholarNumber: normalizedScholarNumber,
    });

    if (!record) {
      return res.status(404).json({ message: "TC not found" });
    }

    return res.json({
      pdfUrl: record.pdfUrl,
      pdfFileName: record.pdfFileName || "transfer-certificate.pdf",
    });
  } catch (error) {
    return res.status(500).json({ message: "Failed to fetch TC" });
  }
});

module.exports = router;

const express = require("express");
const multer = require("multer");
const verifyAdmin = require("../../middleware/auth");
const cloudinary = require("../../utils/cloudinary");
const TransferCertificate = require("../../models/TransferCertificate");

const router = express.Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (file.mimetype !== "application/pdf") {
      return cb(new Error("Only PDF allowed"));
    }
    return cb(null, true);
  },
});

const normalize = (value = "") => value.trim().replace(/\s+/g, " ").toLowerCase();
const safePdfFileName = (value = "transfer-certificate.pdf") => {
  const baseName = value.replace(/\.[^/.]+$/, "").replace(/[^a-z0-9_-]+/gi, "_").toLowerCase();
  return `${baseName || "transfer-certificate"}.pdf`;
};

const uploadPdfToCloudinary = (buffer, originalName) =>
  new Promise((resolve, reject) => {
    const safeName = safePdfFileName(originalName).replace(/\.pdf$/i, "");
    cloudinary.uploader
      .upload_stream(
        {
          folder: "transfer_certificates",
          resource_type: "raw",
          public_id: `${safeName}_${Date.now()}.pdf`,
        },
        (err, result) => {
          if (err) reject(err);
          else resolve(result);
        }
      )
      .end(buffer);
  });

router.post("/", verifyAdmin, upload.single("pdf"), async (req, res) => {
  try {
    const { studentName, fatherName, scholarNumber } = req.body;

    if (!studentName || !fatherName || !scholarNumber || !req.file) {
      return res.status(400).json({ message: "All fields and PDF are required" });
    }

    const result = await uploadPdfToCloudinary(req.file.buffer, req.file.originalname);
    const normalizedStudentName = normalize(studentName);
    const normalizedFatherName = normalize(fatherName);
    const normalizedScholarNumber = normalize(scholarNumber);
    const pdfFileName = safePdfFileName(`${studentName}_${scholarNumber}_tc.pdf`);

    const record = await TransferCertificate.findOneAndUpdate(
      {
        studentName: normalizedStudentName,
        fatherName: normalizedFatherName,
        scholarNumber: normalizedScholarNumber,
      },
      {
        studentName: normalizedStudentName,
        fatherName: normalizedFatherName,
        scholarNumber: normalizedScholarNumber,
        pdfUrl: result.secure_url,
        pdfFileName,
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    return res.json({ success: true, record });
  } catch (error) {
    return res.status(500).json({ message: "Failed to upload TC", error: error.message });
  }
});

router.get("/", verifyAdmin, async (req, res) => {
  try {
    const records = await TransferCertificate.find().sort({ createdAt: -1 }).limit(200);
    return res.json(records);
  } catch (error) {
    return res.status(500).json({ message: "Failed to fetch TC records" });
  }
});

router.delete("/:id", verifyAdmin, async (req, res) => {
  try {
    await TransferCertificate.findByIdAndDelete(req.params.id);
    return res.json({ success: true });
  } catch (error) {
    return res.status(500).json({ message: "Failed to delete TC record" });
  }
});

module.exports = router;

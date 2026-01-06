const express = require("express");
const multer = require("multer");
const Disclosure = require("../../models/Disclosure");
const verifyAdmin = require("../../middleware/auth");
const cloudinary = require("../../utils/cloudinary");

const router = express.Router();

/* ===============================
   MULTER (MEMORY STORAGE)
================================ */
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: (req, file, cb) => {
    if (file.mimetype !== "application/pdf") {
      cb(new Error("Only PDF files allowed"), false);
    } else {
      cb(null, true);
    }
  },
});

/* ===============================
   CLOUDINARY PDF UPLOAD
================================ */
const uploadToCloudinary = (buffer, originalName) => {
  return new Promise((resolve, reject) => {
    cloudinary.uploader
      .upload_stream(
        {
          resource_type: "raw", // IMPORTANT for PDF
          folder: "disclosures",
          public_id: originalName.replace(/\s+/g, "_"),
        },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      )
      .end(buffer);
  });
};

/* =====================================
   ADD GENERAL INFO
===================================== */
router.post("/general", verifyAdmin, async (req, res) => {
  try {
    const doc =
      (await Disclosure.findOne()) || (await Disclosure.create({}));

    doc.generalInfo.push(req.body);
    await doc.save();

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: "Failed to add general info" });
  }
});

/* =====================================
   UPLOAD DOCUMENT (PDF → CLOUDINARY)
===================================== */
router.post(
  "/documents",
  verifyAdmin,
  upload.single("pdf"),
  async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: "PDF file required" });
      }

      const doc =
        (await Disclosure.findOne()) || (await Disclosure.create({}));

      const result = await uploadToCloudinary(
        req.file.buffer,
        req.file.originalname
      );

      doc.documents.push({
        name: req.body.name,
        pdfUrl: result.secure_url,
      });

      await doc.save();

      res.json({
        success: true,
        pdfUrl: result.secure_url,
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "PDF upload failed" });
    }
  }
);

/* =====================================
   RESULT X
===================================== */
router.post("/resultX", verifyAdmin, async (req, res) => {
  try {
    const doc =
      (await Disclosure.findOne()) || (await Disclosure.create({}));

    doc.resultX.push(req.body);
    await doc.save();

    res.json({ success: true });
  } catch {
    res.status(500).json({ error: "Result X failed" });
  }
});

/* =====================================
   RESULT XII
===================================== */
router.post("/resultXII", verifyAdmin, async (req, res) => {
  try {
    const doc =
      (await Disclosure.findOne()) || (await Disclosure.create({}));

    doc.resultXII.push(req.body);
    await doc.save();

    res.json({ success: true });
  } catch {
    res.status(500).json({ error: "Result XII failed" });
  }
});

/* =====================================
   STAFF
===================================== */
router.post("/staff", verifyAdmin, async (req, res) => {
  try {
    const doc =
      (await Disclosure.findOne()) || (await Disclosure.create({}));

    doc.staff.push(req.body);
    await doc.save();

    res.json({ success: true });
  } catch {
    res.status(500).json({ error: "Staff add failed" });
  }
});

/* =====================================
   INFRASTRUCTURE
===================================== */
router.post("/infra", verifyAdmin, async (req, res) => {
  try {
    const doc =
      (await Disclosure.findOne()) || (await Disclosure.create({}));

    doc.infrastructure.push(req.body);
    await doc.save();

    res.json({ success: true });
  } catch {
    res.status(500).json({ error: "Infra add failed" });
  }
});

module.exports = router;

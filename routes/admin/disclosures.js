const express = require("express");
const multer = require("multer");
const Disclosure = require("../../models/Disclosure");
const verifyAdmin = require("../../middleware/auth");
const cloudinary = require("../../utils/cloudinary");

const router = express.Router();

/* ===== MULTER MEMORY ===== */
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    file.mimetype === "application/pdf"
      ? cb(null, true)
      : cb(new Error("Only PDF allowed"));
  },
});

/* ===== CLOUDINARY UPLOAD ===== */
const uploadToCloudinary = (buffer, name) =>
  new Promise((resolve, reject) => {
    cloudinary.uploader
      .upload_stream(
        {
          resource_type: "raw",
          folder: "disclosures",
          public_id: name.replace(/\s+/g, "_"),
        },
        (err, result) => {
          if (err) reject(err);
          else resolve(result);
        }
      )
      .end(buffer);
  });

/* ===== GENERAL ===== */
router.post("/general", verifyAdmin, async (req, res) => {
  const doc = (await Disclosure.findOne()) || (await Disclosure.create({}));
  doc.generalInfo.push(req.body);
  await doc.save();
  res.json({ success: true });
});

/* ===== DOCUMENTS (PDF) ===== */
router.post(
  "/documents",
  verifyAdmin,
  upload.single("pdf"),
  async (req, res) => {
    const doc = (await Disclosure.findOne()) || (await Disclosure.create({}));

    const result = await uploadToCloudinary(
      req.file.buffer,
      req.file.originalname
    );

    doc.documents.push({
      name: req.body.name,
      pdfUrl: result.secure_url,
    });

    await doc.save();
    res.json({ success: true, pdfUrl: result.secure_url });
  }
);

/* ===== RESULT X ===== */
router.post("/resultX", verifyAdmin, async (req, res) => {
  const doc = (await Disclosure.findOne()) || (await Disclosure.create({}));
  doc.resultX.push(req.body);
  await doc.save();
  res.json({ success: true });
});

/* ===== RESULT XII ===== */
router.post("/resultXII", verifyAdmin, async (req, res) => {
  const doc = (await Disclosure.findOne()) || (await Disclosure.create({}));
  doc.resultXII.push(req.body);
  await doc.save();
  res.json({ success: true });
});

/* ===== STAFF ===== */
router.post("/staff", verifyAdmin, async (req, res) => {
  const doc = (await Disclosure.findOne()) || (await Disclosure.create({}));
  doc.staff.push(req.body);
  await doc.save();
  res.json({ success: true });
});

/* ===== INFRA ===== */
router.post("/infra", verifyAdmin, async (req, res) => {
  const doc = (await Disclosure.findOne()) || (await Disclosure.create({}));
  doc.infrastructure.push(req.body);
  await doc.save();
  res.json({ success: true });
});

module.exports = router;

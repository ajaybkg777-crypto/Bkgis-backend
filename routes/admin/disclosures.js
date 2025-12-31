const express = require("express");
const multer = require("multer");
const path = require("path");
const Disclosure = require("../../models/Disclosure");
const verifyAdmin = require("../../middleware/auth");

const router = express.Router();

/* ========= MULTER CONFIG ========= */
const storage = multer.diskStorage({
  destination: (_, __, cb) => {
    cb(null, path.join(__dirname, "../../uploads/disclosures"));
  },
  filename: (_, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname.replace(/\s+/g, "_"));
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (_, file, cb) => {
    if (!file.mimetype.includes("pdf")) {
      return cb(new Error("Only PDF allowed"));
    }
    cb(null, true);
  }
});

/* ================= ROUTES ================= */

router.post("/general", verifyAdmin, async (req, res) => {
  const doc = (await Disclosure.findOne()) || (await Disclosure.create({}));
  doc.generalInfo.push(req.body);
  await doc.save();
  res.json({ success: true });
});

router.post("/documents", verifyAdmin, upload.single("pdf"), async (req, res) => {
  if (!req.file) return res.status(400).json({ error: "No file uploaded" });

  const doc = (await Disclosure.findOne()) || (await Disclosure.create({}));

  doc.documents.push({
    name: req.body.name,
    pdfUrl: `/uploads/disclosures/${req.file.filename}`,
  });

  await doc.save();
  res.json({ success: true });
});

router.post("/resultX", verifyAdmin, async (req, res) => {
  const doc = (await Disclosure.findOne()) || (await Disclosure.create({}));
  doc.resultX.push(req.body);
  await doc.save();
  res.json({ success: true });
});

router.post("/resultXII", verifyAdmin, async (req, res) => {
  const doc = (await Disclosure.findOne()) || (await Disclosure.create({}));
  doc.resultXII.push(req.body);
  await doc.save();
  res.json({ success: true });
});

router.post("/staff", verifyAdmin, async (req, res) => {
  const doc = (await Disclosure.findOne()) || (await Disclosure.create({}));
  doc.staff.push(req.body);
  await doc.save();
  res.json({ success: true });
});

router.post("/infra", verifyAdmin, async (req, res) => {
  const doc = (await Disclosure.findOne()) || (await Disclosure.create({}));
  doc.infrastructure.push(req.body);
  await doc.save();
  res.json({ success: true });
});

module.exports = router;

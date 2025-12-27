const express = require("express");
const multer = require("multer");
const path = require("path");
const Disclosure = require("../../models/Disclosure");
const verifyAdmin = require("../../middleware/auth");

const router = express.Router();

/* ========= MULTER CONFIG ========= */
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, "../../uploads/disclosures"));
  },
  filename: (req, file, cb) => {
    const safeName = file.originalname.replace(/\s+/g, "_");
    cb(null, Date.now() + "-" + safeName);
  },
});

const upload = multer({ storage });

/* =====================================
   ADD GENERAL INFO
===================================== */
router.post("/general", verifyAdmin, async (req, res) => {
  try {
    const doc = (await Disclosure.findOne()) || (await Disclosure.create({}));
    doc.generalInfo.push(req.body);
    await doc.save();
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: "Failed to add general info" });
  }
});

/* =====================================
   UPLOAD DOCUMENT (PDF)
===================================== */
router.post(
  "/documents",
  verifyAdmin,
  upload.single("pdf"),
  async (req, res) => {
    try {
      const doc = (await Disclosure.findOne()) || (await Disclosure.create({}));

      doc.documents.push({
        name: req.body.name,
        pdfUrl: "/uploads/disclosures/" + req.file.filename,
      });

      await doc.save();
      res.json({ success: true });
    } catch (err) {
      res.status(500).json({ error: "PDF upload failed" });
    }
  }
);

/* =====================================
   RESULT X
===================================== */
router.post("/resultX", verifyAdmin, async (req, res) => {
  try {
    const doc = (await Disclosure.findOne()) || (await Disclosure.create({}));
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
    const doc = (await Disclosure.findOne()) || (await Disclosure.create({}));
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
    const doc = (await Disclosure.findOne()) || (await Disclosure.create({}));
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
    const doc = (await Disclosure.findOne()) || (await Disclosure.create({}));
    doc.infrastructure.push(req.body);
    await doc.save();
    res.json({ success: true });
  } catch {
    res.status(500).json({ error: "Infra add failed" });
  }
});

module.exports = router;

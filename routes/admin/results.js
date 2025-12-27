const express = require("express");
const multer = require("multer");
const xlsx = require("xlsx");
const Result = require("../../models/Result");
const verifyAdmin = require("../../middleware/auth");

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

/* ============================
   CREATE SINGLE RESULT
============================ */
router.post("/", verifyAdmin, async (req, res) => {
  try {
    const body = req.body;

    let totalObtained = 0;
    let totalMax = 0;

    if (Array.isArray(body.subjectMarks)) {
      body.subjectMarks = body.subjectMarks.map((s) => {
        const marks = Number(s.marks) || 0;
        const max = Number(s.max) || 100;

        totalObtained += marks;
        totalMax += max;

        return { subject: s.subject, marks, max };
      });
    }

    body.totalObtained = totalObtained;
    body.totalMax = totalMax;
    body.percentage =
      totalMax === 0 ? 0 : Number(((totalObtained / totalMax) * 100).toFixed(2));

    const saved = await Result.create(body);
    res.json(saved);
  } catch (err) {
    res.status(400).json({ error: "Invalid Data" });
  }
});

/* ============================
   EXCEL UPLOAD
============================ */
router.post("/upload", verifyAdmin, upload.single("file"), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: "No file uploaded" });

    const workbook = xlsx.read(req.file.buffer, { type: "buffer" });
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const rows = xlsx.utils.sheet_to_json(sheet);

    let replaced = 0;

    for (const r of rows) {
      const roll = String(r.Roll || "").trim();
      const cls = String(r.Class || "").trim();
      const exam = String(r.Exam || "").trim();

      if (!roll || !cls || !exam) continue;

      let subjectMarks = [];
      let sm = r.SubjectMarks || "[]";

      sm = sm.replace(/'/g, '"').replace(/,\s*]/g, "]");

      try {
        subjectMarks = JSON.parse(sm);
      } catch {
        subjectMarks = [];
      }

      let totalObtained = 0;
      let totalMax = 0;

      subjectMarks.forEach(s => {
        totalObtained += Number(s.marks || 0);
        totalMax += Number(s.max || 100);
      });

      const percentage =
        totalMax === 0 ? 0 : ((totalObtained / totalMax) * 100).toFixed(2);

      await Result.findOneAndUpdate(
        { roll, class: cls, exam },
        {
          roll,
          class: cls,
          exam,
          subjectMarks,
          totalObtained,
          totalMax,
          percentage,
        },
        { upsert: true }
      );

      replaced++;
    }

    res.json({ message: "Excel uploaded", replaced });
  } catch (err) {
    res.status(500).json({ error: "Upload failed" });
  }
});

module.exports = router;

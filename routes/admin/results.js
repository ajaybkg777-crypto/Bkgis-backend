const express = require("express");
const multer = require("multer");
const xlsx = require("xlsx");
const Result = require("../../models/Result");
const verifyAdmin = require("../../middleware/auth");

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

/* ============================
   HELPER : GRADE CALCULATION
============================ */
const calculateGrade = (percentage) => {
  if (percentage >= 90) return "A+";
  if (percentage >= 75) return "A";
  if (percentage >= 60) return "B";
  if (percentage >= 45) return "C";
  return "F";
};

/* ============================
   CREATE SINGLE RESULT
============================ */
router.post("/", verifyAdmin, async (req, res) => {
  try {
    const body = req.body;

    if (!body.roll || !body.name || !body.pin || !body.class || !body.exam) {
      return res.status(400).json({ error: "Required fields missing" });
    }

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

    const percentage =
      totalMax === 0 ? 0 : Number(((totalObtained / totalMax) * 100).toFixed(2));

    const grade = calculateGrade(percentage);

    const saved = await Result.create({
      ...body,
      totalObtained,
      totalMax,
      percentage,
      grade,
    });

    res.json(saved);
  } catch (err) {
    console.error("CREATE RESULT ERROR:", err);
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
      const name = String(r.Name || "").trim();
      const pin = String(r.PIN || "").trim();
      const cls = String(r.Class || "").trim();
      const exam = String(r.Exam || "").trim();

      if (!roll || !name || !pin || !cls || !exam) continue;

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

      subjectMarks.forEach((s) => {
        totalObtained += Number(s.marks || 0);
        totalMax += Number(s.max || 100);
      });

      const percentage =
        totalMax === 0 ? 0 : Number(((totalObtained / totalMax) * 100).toFixed(2));

      const grade = calculateGrade(percentage);

      await Result.findOneAndUpdate(
        { roll, class: cls, exam },
        {
          roll,
          name,
          pin,
          class: cls,
          exam,
          subjectMarks,
          totalObtained,
          totalMax,
          percentage,
          grade,
        },
        { upsert: true, new: true }
      );

      replaced++;
    }

    res.json({ message: "Excel uploaded successfully", replaced });
  } catch (err) {
    console.error("EXCEL UPLOAD ERROR:", err);
    res.status(500).json({ error: "Upload failed" });
  }
});

module.exports = router;

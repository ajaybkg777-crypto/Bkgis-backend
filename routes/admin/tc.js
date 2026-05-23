const express = require("express");
const multer = require("multer");
const pdfParse = require("pdf-parse");
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
const normalizePdfText = (value = "") => value.replace(/\r/g, "\n").replace(/[ \t]+/g, " ");
const cleanExtractedValue = (value = "") =>
  value
    .replace(/^[\s:.\-]+/, "")
    .replace(/\s+/g, " ")
    .trim();
const readFirstMatch = (text, patterns) => {
  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match?.[1]) return cleanExtractedValue(match[1]);
  }
  return "";
};
const readFromLines = (lines, labelPatterns, stopPatterns) => {
  for (let index = 0; index < lines.length; index += 1) {
    const line = lines[index];
    const label = labelPatterns.find((pattern) => pattern.test(line));
    if (!label) continue;

    const sameLineValue = cleanExtractedValue(line.replace(label, ""));
    if (sameLineValue && !stopPatterns.some((pattern) => pattern.test(sameLineValue))) {
      return sameLineValue;
    }

    for (let nextIndex = index + 1; nextIndex < Math.min(index + 4, lines.length); nextIndex += 1) {
      const nextLine = cleanExtractedValue(lines[nextIndex]);
      if (!nextLine) continue;
      if (stopPatterns.some((pattern) => pattern.test(nextLine))) break;
      return nextLine;
    }
  }

  return "";
};

const extractTCDetails = async (buffer) => {
  const parsed = await pdfParse(buffer);
  const text = normalizePdfText(parsed.text || "");
  const compactText = text.replace(/\n+/g, " ");
  const lines = text
    .split("\n")
    .map((line) => cleanExtractedValue(line))
    .filter(Boolean);
  const stopPatterns = [
    /^(student|father|mother|guardian|scholar|admission|class|date|dob|nationality|category|school)\b/i,
  ];

  const studentName =
    readFromLines(
      lines,
      [
        /^(?:student'?s?\s*name|name\s*of\s*(?:the\s*)?student|pupil'?s?\s*name|student\s*name|name)\s*[:.\-]*/i,
      ],
      stopPatterns
    ) ||
    readFirstMatch(compactText, [
      /(?:student'?s?\s*name|name\s*of\s*(?:the\s*)?student|pupil'?s?\s*name|student\s*name)\s*[:.\-]?\s*([A-Za-z][A-Za-z .'-]{1,80}?)(?=\s+(?:father|mother|guardian|scholar|admission|class|dob|date|$))/i,
    ]);
  const fatherName =
    readFromLines(
      lines,
      [
        /^(?:father'?s?\s*name|name\s*of\s*(?:the\s*)?father|father\s*name|father\/guardian'?s?\s*name|parent'?s?\s*name)\s*[:.\-]*/i,
      ],
      stopPatterns
    ) ||
    readFirstMatch(compactText, [
      /(?:father'?s?\s*name|name\s*of\s*(?:the\s*)?father|father\s*name|father\/guardian'?s?\s*name|parent'?s?\s*name)\s*[:.\-]?\s*([A-Za-z][A-Za-z .'-]{1,80}?)(?=\s+(?:mother|guardian|scholar|admission|class|dob|date|$))/i,
    ]);
  const scholarNumber =
    readFromLines(
      lines,
      [
        /^(?:scholar\s*(?:no\.?|number)|scholar\s*id|admission\s*(?:no\.?|number)|admission\s*id|sr\.?\s*no\.?|registration\s*(?:no\.?|number))\s*[:.\-]*/i,
      ],
      stopPatterns
    ) ||
    readFirstMatch(compactText, [
      /(?:scholar\s*(?:no\.?|number)|scholar\s*id|admission\s*(?:no\.?|number)|admission\s*id|sr\.?\s*no\.?|registration\s*(?:no\.?|number))\s*[:.\-]?\s*([A-Za-z0-9/-]{1,30})/i,
    ]);

  return { studentName, fatherName, scholarNumber };
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
    if (!req.file) {
      return res.status(400).json({ message: "PDF is required" });
    }

    const { studentName, fatherName, scholarNumber } = await extractTCDetails(req.file.buffer);
    if (!studentName || !fatherName || !scholarNumber || !req.file) {
      return res.status(400).json({
        message: "Unable to read student name, father name and scholar number from this PDF",
        hint: "Please upload a text PDF. Scanned/image PDFs cannot be read automatically.",
      });
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

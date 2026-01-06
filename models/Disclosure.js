const mongoose = require("mongoose");

const PairSchema = new mongoose.Schema(
  { info: String, detail: String },
  { _id: false }
);

const DocumentSchema = new mongoose.Schema(
  { name: String, pdfUrl: String },
  { _id: false }
);

const AcademicSchema = new mongoose.Schema(
  { title: String, pdfUrl: String },
  { _id: false }
);

const ResultSchema = new mongoose.Schema(
  {
    year: String,
    registered: Number,
    passed: Number,
    percentage: String,
  },
  { _id: false }
);

const DisclosureSchema = new mongoose.Schema(
  {
    generalInfo: [PairSchema],
    documents: [DocumentSchema],
    academic: [AcademicSchema],
    resultX: [ResultSchema],
    resultXII: [ResultSchema],
    staff: [PairSchema],
    infrastructure: [PairSchema],
  },
  { timestamps: true }
);

module.exports = mongoose.model("Disclosure", DisclosureSchema);

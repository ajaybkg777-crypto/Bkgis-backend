const mongoose = require("mongoose");

const ResultSchema = new mongoose.Schema(
  {
    roll: { type: String, required: true },
    name: { type: String, required: true },

    pin: { type: String, required: true },

    class: { type: String, required: true },
    exam: { type: String, required: true },

    grade: { type: String, required: true },

    subjectMarks: [
      {
        subject: String,
        marks: Number,
        max: { type: Number, default: 100 },
      },
    ],

    totalObtained: { type: Number, default: 0 },
    totalMax: { type: Number, default: 0 },
    percentage: { type: Number, default: 0 },

    uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: "Admin" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Result", ResultSchema);

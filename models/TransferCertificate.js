const mongoose = require("mongoose");

const transferCertificateSchema = new mongoose.Schema(
  {
    studentName: { type: String, required: true, trim: true },
    fatherName: { type: String, required: true, trim: true },
    dateOfBirth: { type: Date, required: true },
    dateKey: { type: String, trim: true },
    pdfUrl: { type: String, required: true, trim: true },
    pdfFileName: { type: String, trim: true },
  },
  { timestamps: true }
);

transferCertificateSchema.index({ studentName: 1, fatherName: 1, dateKey: 1 });

module.exports = mongoose.model("TransferCertificate", transferCertificateSchema);

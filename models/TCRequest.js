const mongoose = require('mongoose');

const tcRequestSchema = new mongoose.Schema({
  studentName: { type: String, required: true },
  fatherName: { type: String, required: true },
  motherName: { type: String, required: true },
  class: { type: String, required: true },
  admissionNumber: { type: String, required: true },
  dateOfBirth: { type: Date, required: true },
  reason: { type: String, required: true },
  contactEmail: { type: String, required: true },
  contactPhone: { type: String, required: true },
}, { timestamps: true });

module.exports = mongoose.model('TCRequest', tcRequestSchema);
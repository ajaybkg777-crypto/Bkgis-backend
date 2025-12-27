// models/Achievement.js - Achievement schema

const mongoose = require('mongoose');

const AchievementSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, default: '' },
  date: { type: Date, default: Date.now },
  file: { type: String }, // optional file path e.g. /uploads/achievements/xyz.pdf
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Admin' }
}, { timestamps: true });

module.exports = mongoose.model('Achievement', AchievementSchema);
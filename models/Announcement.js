// models/Announcement.js - Announcement schema

const mongoose = require('mongoose');

const AnnouncementSchema = new mongoose.Schema({
  title: { type: String, required: true },
  body: { type: String, required: true },
  attachments: { type: String }, // path e.g. /uploads/announcements/file.jpg
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Admin' },
}, { timestamps: true }); // createdAt, updatedAt

module.exports = mongoose.model('Announcement', AnnouncementSchema);
// models/Gallery.js
const mongoose = require("mongoose");

const GallerySchema = new mongoose.Schema({
  event: { type: String, required: true },
  category: { type: String, required: true }, // junior | senior
  url: { type: String, required: true }, // /uploads/gallery/filename.jpg
}, { timestamps: true });

module.exports = mongoose.model("Gallery", GallerySchema);

const mongoose = require("mongoose");

const GallerySchema = new mongoose.Schema(
  {
    event: String,
    category: String,
    url: String,
    public_id: String,
  },
  { timestamps: true }
);

module.exports = mongoose.model("Gallery", GallerySchema);

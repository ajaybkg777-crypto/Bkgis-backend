const mongoose = require("mongoose");

const GallerySchema = new mongoose.Schema(
  {
    event: {
      type: String,
      required: true,
      trim: true,
    },

    category: {
      type: String,
      required: true,
      enum: ["junior", "senior"],
    },

    // Cloudinary image URL
    url: {
      type: String,
      required: true,
    },

    // Cloudinary public id (for delete / update)
    public_id: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Gallery", GallerySchema);

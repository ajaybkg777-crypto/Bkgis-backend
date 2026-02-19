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
      enum: ["junior", "senior"],
      required: true,
    },

    // photo | video
    type: {
      type: String,
      enum: ["photo", "video"],
      default: "photo",
    },

    // Photo URL OR Video Thumbnail URL
    url: {
      type: String,
      required: true,
    },

    // Cloudinary public id
    public_id: {
      type: String,
    },

    // Only for video (YouTube)
    videoLink: {
      type: String,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Gallery", GallerySchema);

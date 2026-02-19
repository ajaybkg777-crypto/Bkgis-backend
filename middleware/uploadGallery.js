const multer = require("multer");

/* =============================
   MEMORY STORAGE (Cloudinary)
============================= */
const storage = multer.memoryStorage();

/* =============================
   FILE FILTER (IMAGES ONLY)
============================= */
const fileFilter = (req, file, cb) => {
  const allowed = [
    "image/jpeg",
    "image/png",
    "image/jpg",
    "image/webp",
  ];

  if (!allowed.includes(file.mimetype)) {
    return cb(new Error("INVALID_FILE_TYPE"), false);
  }
  cb(null, true);
};

module.exports = multer({
  storage,
  limits: {
    fileSize: 6 * 1024 * 1024, // 6MB
  },
  fileFilter,
});

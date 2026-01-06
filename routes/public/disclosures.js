const express = require("express");
const Disclosure = require("../../models/Disclosure");

const router = express.Router();

/* =====================================
   GET ALL DISCLOSURE DATA (PUBLIC)
   (Cloudinary URLs included)
===================================== */
router.get("/", async (req, res) => {
  try {
    const data = await Disclosure.findOne()
      .select(
        "generalInfo documents resultX resultXII staff infrastructure"
      )
      .lean();

    // If no disclosure data exists
    if (!data) {
      return res.json({
        generalInfo: [],
        documents: [],      // pdfUrl → Cloudinary
        resultX: [],
        resultXII: [],
        staff: [],
        infrastructure: [],
      });
    }

    res.json(data);
  } catch (err) {
    console.error("DISCLOSURE FETCH ERROR:", err);
    res.status(500).json({
      error: "Failed to fetch disclosure data",
    });
  }
});

module.exports = router;

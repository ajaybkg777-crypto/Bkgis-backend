const express = require("express");
const axios = require("axios");
const Disclosure = require("../../models/Disclosure");

const router = express.Router();

/* =====================================
   PDF VIEW ROUTE (CLOUDINARY SAFE)
===================================== */
router.get("/view/:docIndex", async (req, res) => {
  try {
    const docIndex = parseInt(req.params.docIndex, 10);

    if (isNaN(docIndex)) {
      return res.status(400).send("Invalid document index");
    }

    const disclosure = await Disclosure.findOne().lean();

    if (
      !disclosure ||
      !disclosure.documents ||
      !disclosure.documents[docIndex]
    ) {
      return res.status(404).send("PDF not found");
    }

    const pdfUrl = disclosure.documents[docIndex].pdfUrl;

    // Fetch PDF from Cloudinary
    const response = await axios.get(pdfUrl, {
      responseType: "arraybuffer",
    });

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", "inline");

    res.send(response.data);
  } catch (err) {
    console.error("PDF VIEW ERROR:", err.message);
    res.status(500).send("Failed to load PDF");
  }
});

module.exports = router;

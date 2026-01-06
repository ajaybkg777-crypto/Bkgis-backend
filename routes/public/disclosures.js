const express = require("express");
const Disclosure = require("../../models/Disclosure");

const router = express.Router();

router.get("/", async (req, res) => {
  const data = await Disclosure.findOne().lean();

  if (!data) {
    return res.json({
      generalInfo: [],
      documents: [],
      academic: [],
      resultX: [],
      resultXII: [],
      staff: [],
      infrastructure: [],
    });
  }

  res.json(data);
});

module.exports = router;

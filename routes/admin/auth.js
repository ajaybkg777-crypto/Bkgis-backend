const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const Admin = require("../../models/Admin");

const router = express.Router();

/* ============================
   ADMIN LOGIN
============================ */
router.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password)
      return res.status(400).json({ error: "USERNAME_PASSWORD_REQUIRED" });

    const admin = await Admin.findOne({ username });
    if (!admin)
      return res.status(401).json({ error: "INVALID_CREDENTIALS" });

    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch)
      return res.status(401).json({ error: "INVALID_CREDENTIALS" });

    const token = jwt.sign(
      {
        id: admin._id,
        username: admin.username,
        role: "admin"
      },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({
      token,
      admin: {
        id: admin._id,
        username: admin.username
      }
    });
  } catch (err) {
    console.error("LOGIN ERROR:", err);
    res.status(500).json({ error: "LOGIN_FAILED" });
  }
});

module.exports = router;

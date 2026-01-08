const express = require("express");
const router = express.Router();
const nodemailer = require("nodemailer");
const Contact = require("../../models/Contact");

/* ================= MAIL TRANSPORT (GMAIL) ================= */
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_PASS,
  },
});

// 🔍 verify SMTP on server start
transporter.verify((err) => {
  if (err) {
    console.error("❌ Gmail SMTP ERROR:", err);
  } else {
    console.log("✅ Gmail SMTP ready");
  }
});

/* ================= CONTACT SUBMIT ================= */
router.post("/submit", async (req, res) => {
  try {
    const { name, email, phone, subject, message } = req.body;

    if (!name || !email || !phone || !subject || !message) {
      return res.status(400).json({ message: "All fields required" });
    }

    // ✅ Save to DB
    await Contact.create({ name, email, phone, subject, message });

    /* 📩 ADMIN MAIL */
    await transporter.sendMail({
      from: `"BKG International School" <${process.env.GMAIL_USER}>`,
      to: process.env.GMAIL_USER,
      subject: `📩 New Contact: ${subject}`,
      html: `
        <h3>New Contact Message</h3>
        <p><b>Name:</b> ${name}</p>
        <p><b>Email:</b> ${email}</p>
        <p><b>Phone:</b> ${phone}</p>
        <p><b>Message:</b> ${message}</p>
      `,
    });

    /* 📩 USER CONFIRMATION MAIL */
    await transporter.sendMail({
      from: `"BKG International School" <${process.env.GMAIL_USER}>`,
      to: email,
      subject: "We received your message",
      html: `
        <p>Hello <b>${name}</b>,</p>
        <p>Thank you for contacting <b>BKG International School</b>.</p>
        <p>We will contact you shortly.</p>
        <br/>
        <p>Regards,<br/><b>BKG International School</b></p>
      `,
    });

    res.json({ success: true });
  } catch (err) {
    console.error("CONTACT ERROR:", err);
    res.status(500).json({ message: "Email sending failed" });
  }
});

module.exports = router;

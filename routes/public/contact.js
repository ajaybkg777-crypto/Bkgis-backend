const express = require("express");
const router = express.Router();
const nodemailer = require("nodemailer");
const Contact = require("../../models/Contact");

/* ================= MAIL TRANSPORT ================= */
const transporter = nodemailer.createTransport({
  host: "smtp-relay.brevo.com",
  port: 587,
  secure: false,
  auth: {
    user: process.env.BREVO_EMAIL,
    pass: process.env.BREVO_SMTP_KEY,
  },
});

// 🔍 verify SMTP on server start
transporter.verify((err, success) => {
  if (err) {
    console.error("❌ SMTP ERROR:", err);
  } else {
    console.log("✅ Brevo SMTP ready");
  }
});


/* ================= CONTACT SUBMIT ================= */
router.post("/submit", async (req, res) => {
  try {
    const { name, email, phone, subject, message } = req.body;

    if (!name || !email || !phone || !subject || !message) {
      return res.status(400).json({ message: "All fields required" });
    }

    await Contact.create({ name, email, phone, subject, message });

    // Admin mail
    await transporter.sendMail({
      from: `"BKG International School" <${process.env.BREVO_EMAIL}>`,
      to: process.env.BREVO_EMAIL,
      subject: `📩 New Contact: ${subject}`,
      html: `
        <p><b>Name:</b> ${name}</p>
        <p><b>Email:</b> ${email}</p>
        <p><b>Phone:</b> ${phone}</p>
        <p><b>Message:</b> ${message}</p>
      `,
    });

    // User confirmation
    await transporter.sendMail({
      from: `"BKG International School" <${process.env.BREVO_EMAIL}>`,
      to: email,
      subject: "We received your message",
      html: `
        <p>Hello ${name},</p>
        <p>Thanks for contacting BKG International School.</p>
        <p>We will contact you shortly.</p>
      `,
    });

    res.json({ success: true });
  } catch (err) {
    console.error("CONTACT ERROR:", err);
    res.status(500).json({ message: "Failed to submit form" });
  }
});

/* 🚨 THIS LINE IS MOST IMPORTANT */
module.exports = router;

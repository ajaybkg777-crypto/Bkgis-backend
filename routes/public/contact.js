const express = require("express");
const router = express.Router();
const nodemailer = require("nodemailer");
const Contact = require("../../models/Contact");
const TCRequest = require("../../models/TCRequest");

/* ==================================================
   SMTP TRANSPORTER (BREVO)
================================================== */
if (!process.env.BREVO_EMAIL || !process.env.BREVO_SMTP_KEY) {
  console.error("❌ BREVO SMTP ENV VARIABLES MISSING");
}

const transporter = nodemailer.createTransport({
  host: "smtp-relay.brevo.com",
  port: 587,
  secure: false,
  auth: {
    user: process.env.BREVO_EMAIL,      // verified email
    pass: process.env.BREVO_SMTP_KEY,   // SMTP key
  },
});

/* 🔍 VERIFY SMTP (IMPORTANT) */
transporter.verify((err) => {
  if (err) {
    console.error("❌ SMTP VERIFY FAILED:", err);
  } else {
    console.log("✅ SMTP READY (Brevo)");
  }
});

/* ==================================================
   CONTACT FORM SUBMIT
================================================== */
router.post("/submit", async (req, res) => {
  try {
    const { name, email, phone, subject, message } = req.body;

    if (!name || !email || !phone || !subject || !message) {
      return res.status(400).json({ message: "All fields required" });
    }

    /* ✅ SAVE TO DATABASE */
    await Contact.create({ name, email, phone, subject, message });

    /* ================= ADMIN EMAIL ================= */
    await transporter.sendMail({
      from: `"BKG International School" <${process.env.BREVO_EMAIL}>`,
      to: process.env.BREVO_EMAIL, // admin inbox
      subject: `📩 New Contact: ${subject}`,
      html: `
        <h3>New Contact Message</h3>
        <p><b>Name:</b> ${name}</p>
        <p><b>Email:</b> ${email}</p>
        <p><b>Phone:</b> ${phone}</p>
        <p><b>Subject:</b> ${subject}</p>
        <p><b>Message:</b></p>
        <p>${message}</p>
      `,
    });

    /* ================= USER CONFIRMATION ================= */
    await transporter.sendMail({
      from: `"BKG International School" <${process.env.BREVO_EMAIL}>`,
      to: email,
      subject: "✅ We received your message",
      html: `
        <p>Dear <b>${name}</b>,</p>

        <p>Thank you for contacting <b>BKG International School</b>.</p>

        <p>We have received your message and our team will contact you shortly.</p>

        <hr/>

        <p><b>Your Message:</b></p>
        <blockquote>${message}</blockquote>

        <br/>
        <p>Regards,<br/>
        <b>BKG International School</b></p>
      `,
    });

    return res.json({ success: true });
  } catch (err) {
    console.error("❌ CONTACT FORM ERROR:", err);
    return res.status(500).json({ message: "Failed to submit form" });
  }
});

module.exports = router;

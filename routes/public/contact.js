const express = require("express");
const router = express.Router();
const nodemailer = require("nodemailer");
const Contact = require("../../models/Contact");
const TCRequest = require("../../models/TCRequest");

/* ===========================
   MAIL TRANSPORTER (REUSE)
=========================== */
const transporter = nodemailer.createTransport({
  host: "smtp-relay.brevo.com",
  port: 587,
  secure: false,
  auth: {
    user: process.env.BREVO_EMAIL,   // e.g. your@email.com
    pass: process.env.BREVO_SMTP_KEY // API key
  }
});


/* ===========================
   CONTACT FORM SUBMIT
=========================== */
router.post("/submit", async (req, res) => {
  try {
    const { name, email, phone, subject, message } = req.body;

    if (!name || !email || !phone || !subject || !message) {
      return res.status(400).json({ message: "All fields required" });
    }

    // ✅ Save in DB
    await Contact.create({ name, email, phone, subject, message });

    if (transporter) {
      /* 🔔 ADMIN MAIL */
      await transporter.sendMail({
        from: `"BKG International School" <${process.env.ADMIN_EMAIL}>`,
        to: process.env.ADMIN_EMAIL,
        subject: `📩 New Contact: ${subject}`,
        html: `
          <h3>New Contact Message</h3>
          <p><b>Name:</b> ${name}</p>
          <p><b>Email:</b> ${email}</p>
          <p><b>Phone:</b> ${phone}</p>
          <p><b>Message:</b> ${message}</p>
        `,
      });

      /* ✅ USER CONFIRMATION MAIL */
      await transporter.sendMail({
        from: `"BKG International School" <${process.env.ADMIN_EMAIL}>`,
        to: email,
        subject: "✅ We received your message",
        html: `
          <p>Dear <b>${name}</b>,</p>

          <p>Thank you for contacting <b>BKG International School</b>.</p>

          <p>We have received your message and our team will contact you shortly.</p>

          <br/>

          <p><b>Your Message:</b></p>
          <blockquote>${message}</blockquote>

          <br/>
          <p>Regards,<br/>
          <b>BKG International School</b></p>
        `,
      });
    }

    res.json({ success: true });
  } catch (err) {
    console.error("CONTACT ERROR:", err);
    res.status(500).json({ message: "Failed to submit form" });
  }
});

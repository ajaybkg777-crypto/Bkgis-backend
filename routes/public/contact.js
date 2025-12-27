const express = require("express");
const router = express.Router();
const nodemailer = require("nodemailer");
const Contact = require("../../models/Contact");
const TCRequest = require("../../models/TCRequest");

/* ===========================
   CONTACT FORM SUBMIT
=========================== */
router.post("/submit", async (req, res) => {
  try {
    const { name, email, phone, subject, message } = req.body;

    if (!name || !email || !phone || !subject || !message) {
      return res.status(400).json({ message: "All fields required" });
    }

    await Contact.create({ name, email, phone, subject, message });

    // Email notification
    if (process.env.ADMIN_EMAIL && process.env.ADMIN_EMAIL_PASS) {
      const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
          user: process.env.ADMIN_EMAIL,
          pass: process.env.ADMIN_EMAIL_PASS,
        },
      });

      await transporter.sendMail({
        from: `"School Website" <${process.env.ADMIN_EMAIL}>`,
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
    }

    res.json({ success: true });
  } catch (err) {
    console.error("CONTACT ERROR:", err);
    res.status(500).json({ message: "Failed to submit form" });
  }
});

/* ===========================
   TC REQUEST SUBMIT
=========================== */
router.post("/tc-request", async (req, res) => {
  try {
    const {
      studentName,
      fatherName,
      motherName,
      class: studentClass,
      admissionNumber,
      dateOfBirth,
      reason,
      contactEmail,
      contactPhone,
    } = req.body;

    if (
      !studentName ||
      !fatherName ||
      !motherName ||
      !studentClass ||
      !admissionNumber ||
      !dateOfBirth ||
      !reason ||
      !contactEmail ||
      !contactPhone
    ) {
      return res.status(400).json({ message: "All fields required" });
    }

    await TCRequest.create({
      studentName,
      fatherName,
      motherName,
      class: studentClass,
      admissionNumber,
      dateOfBirth,
      reason,
      contactEmail,
      contactPhone,
    });

    // Email notify admin
    if (process.env.ADMIN_EMAIL && process.env.ADMIN_EMAIL_PASS) {
      const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
          user: process.env.ADMIN_EMAIL,
          pass: process.env.ADMIN_EMAIL_PASS,
        },
      });

      await transporter.sendMail({
        from: `"School Website" <${process.env.ADMIN_EMAIL}>`,
        to: process.env.ADMIN_EMAIL,
        subject: `📄 New TC Request: ${studentName}`,
        html: `
          <h3>New TC Request</h3>
          <p><b>Student:</b> ${studentName}</p>
          <p><b>Father:</b> ${fatherName}</p>
          <p><b>Mother:</b> ${motherName}</p>
          <p><b>Class:</b> ${studentClass}</p>
          <p><b>Admission No:</b> ${admissionNumber}</p>
          <p><b>DOB:</b> ${dateOfBirth}</p>
          <p><b>Reason:</b> ${reason}</p>
          <p><b>Contact:</b> ${contactPhone}</p>
        `,
      });
    }

    res.json({ success: true });
  } catch (err) {
    console.error("TC ERROR:", err);
    res.status(500).json({ message: "Failed to submit TC request" });
  }
});

module.exports = router;

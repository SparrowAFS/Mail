const express = require("express");
const multer = require("multer");
const nodemailer = require("nodemailer");
const fs = require("fs");
const { exec } = require("child_process");
require("dotenv").config();

const app = express();
const upload = multer({ dest: "uploads/" });

app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));

// Zoho SMTP transporter
const transporter = nodemailer.createTransport({
  host: "smtp.zoho.in",
  port: 465,
  secure: true,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// UI Route
app.get("/", (req, res) => {
  res.sendFile(__dirname + "/public/index.html");
});

// Send Mail Route
app.post("/send", upload.single("html"), async (req, res) => {
  try {
    const htmlContent = fs.readFileSync(req.file.path, "utf-8");
    const emails = req.body.emails.split(",");

    for (let email of emails) {
      await transporter.sendMail({
        from: `"AuraForm Studio" <${process.env.EMAIL_USER}>`,
        to: email.trim(),
        subject: "Your Certificate 🎉",
        html: htmlContent,
      });
    }

    res.send("<h2>✅ Emails sent successfully!</h2><a href='/'>Go Back</a>");
  } catch (err) {
    console.log(err);
    res.send("❌ Error sending mails");
  }
});

// 🚀 Start Server + Auto Open (Windows FIX)
app.listen(5000, () => {
  const url = "http://localhost:5000";
  console.log("🚀 Server running at " + url);

  try {
    exec(`start ${url}`); // Works in Windows
  } catch (err) {
    console.log("⚠️ Open manually:", url);
  }
});
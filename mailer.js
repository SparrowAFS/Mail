const express = require("express");
const multer = require("multer");
const nodemailer = require("nodemailer");
const fs = require("fs");
require("dotenv").config();

const app = express();
const upload = multer({ dest: "uploads/" });

// Middleware
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

// Home route (UI)
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

    // ✅ SUCCESS PAGE
    res.send(`
<!DOCTYPE html>
<html>
<head>
  <title>Success</title>
  <style>
    body {
      background: linear-gradient(135deg, #020617, #0b0f1a);
      color: white;
      font-family: 'Segoe UI', sans-serif;
      display: flex;
      justify-content: center;
      align-items: center;
      height: 100vh;
      margin: 0;
    }

    .card {
      background: #111827;
      padding: 40px;
      border-radius: 20px;
      text-align: center;
      box-shadow: 0 0 30px rgba(34,197,94,0.5);
      animation: fadeIn 0.6s ease-in-out;
      width: 350px;
    }

    h2 {
      color: #22c55e;
      margin-bottom: 10px;
    }

    p {
      color: #9ca3af;
      margin-bottom: 25px;
    }

    .btn {
      display: inline-block;
      padding: 12px 25px;
      border-radius: 25px;
      background: linear-gradient(135deg, #22c55e, #16a34a);
      color: white;
      text-decoration: none;
      font-weight: bold;
      transition: 0.3s;
    }

    .btn:hover {
      box-shadow: 0 0 15px rgba(34,197,94,0.8);
      transform: scale(1.05);
    }

    .icon {
      font-size: 50px;
      margin-bottom: 15px;
      animation: pop 0.4s ease;
    }

    @keyframes pop {
      0% { transform: scale(0.5); opacity: 0; }
      100% { transform: scale(1); opacity: 1; }
    }

    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(20px); }
      to { opacity: 1; transform: translateY(0); }
    }
  </style>
</head>

<body>
  <div class="card">
    <div class="icon">✅</div>
    <h2>Emails Sent Successfully!</h2>
    <p>Your certificates have been delivered.</p>
    <a href="/" class="btn">⬅ Back to Mailer</a>
  </div>
</body>
</html>
    `);

  } catch (err) {
    console.error(err);
    res.send("❌ Error sending mails");
  }
});

// ✅ PORT FIX (for Render / deployment)
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log("🚀 Server running on port " + PORT);
});

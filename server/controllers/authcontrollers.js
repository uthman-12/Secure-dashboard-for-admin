const Admin = require("../models/Admin.js");
const Otp = require("../models/Otp.js");
const bcrypt = require("bcrypt");
const nodemailer = require("nodemailer");
const jwt = require("jsonwebtoken");

// Setup mail transporter
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// Send OTP
exports.sendOtp = async (req, res) => {
  const { email } = req.body;
  const otp = Math.floor(100000 + Math.random() * 900000).toString();

  try {
    await Otp.deleteMany({ email }); // Remove old OTPs
    await Otp.create({
      email,
      otp,
      expiresAt: new Date(Date.now() + 10 * 60000), // 10 mins
    });

    await transporter.sendMail({
      from: `"Admin OTP" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "Your OTP Code",
      text: `Your OTP code is ${otp}. It will expire in 10 minutes.`,
    });

    res.json({ message: "OTP sent to email." });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to send OTP." });
  }
};

// Verify OTP
exports.verifyOtp = async (req, res) => {
  const { email, otp } = req.body;

  try {
    const record = await Otp.findOne({ email, otp });

    if (!record || record.expiresAt < new Date()) {
      return res.status(400).json({ message: "Invalid or expired OTP." });
    }

    await Otp.deleteMany({ email }); // Clean up after success
    res.json({ message: "OTP verified successfully." });
  } catch (err) {
    res.status(500).json({ message: "OTP verification failed." });
  }
};

// Register
exports.register = async (req, res) => {
  const { username, email, password } = req.body;

  try {
    const exists = await Admin.findOne({ $or: [{ email }, { username }] });
    if (exists) return res.status(400).json({ message: "Admin already exists." });

    const hashedPassword = await bcrypt.hash(password, 10);

    const newAdmin = await Admin.create({
      username,
      email,
      password: hashedPassword,
    });

    res.status(201).json({ message: "Admin registered successfully." });
  } catch (err) {
    res.status(500).json({ message: "Registration failed." });
  }
};

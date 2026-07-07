const User = require("../models/User");
const Otp = require("../models/Otp");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { sendOtpEmail } = require("../utils/mailer");

const OTP_TTL_MS = 10 * 60 * 1000; // 10 minutes
const OTP_MAX_ATTEMPTS = 5;

const generateToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "7d" });

const genCode = () =>
  String(Math.floor(100000 + Math.random() * 900000)); // 6 digits

/**
 * STEP 1 – request an OTP.
 * Body: { name, email, password }
 *   • Rejects if the email is already registered.
 *   • Stores a hashed OTP + the hashed password in a short-lived Otp doc.
 *   • Emails the plain 6-digit code.
 */
exports.requestSignupOtp = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }
    if (password.length < 6) {
      return res
        .status(400)
        .json({ message: "Password must be at least 6 characters" });
    }

    const normalizedEmail = email.toLowerCase().trim();

    const existing = await User.findOne({ email: normalizedEmail });
    if (existing) {
      return res.status(400).json({ message: "User already exists" });
    }

    const code = genCode();
    const salt = await bcrypt.genSalt(10);
    const codeHash = await bcrypt.hash(code, salt);
    const passwordHash = await bcrypt.hash(password, salt);

    // Replace any prior pending OTP for this email
    await Otp.deleteMany({ email: normalizedEmail });

    await Otp.create({
      email: normalizedEmail,
      name: name.trim(),
      codeHash,
      passwordHash,
      expiresAt: new Date(Date.now() + OTP_TTL_MS),
    });

    try {
      await sendOtpEmail(normalizedEmail, code, name);
    } catch (mailErr) {
      console.error("Failed to send OTP email:", mailErr.message);
      return res.status(500).json({
        message:
          "Could not send verification email. Please verify SMTP configuration.",
      });
    }

    res.status(200).json({
      message: "OTP sent to email",
      email: normalizedEmail,
      expiresInSeconds: OTP_TTL_MS / 1000,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * STEP 2 – verify OTP and finalize signup.
 * Body: { email, code }
 */
exports.verifySignupOtp = async (req, res) => {
  try {
    const { email, code } = req.body;
    if (!email || !code) {
      return res.status(400).json({ message: "Email and code required" });
    }
    const normalizedEmail = email.toLowerCase().trim();

    const otp = await Otp.findOne({ email: normalizedEmail });
    if (!otp) {
      return res
        .status(400)
        .json({ message: "No pending verification. Please request a new OTP." });
    }

    if (otp.expiresAt < new Date()) {
      await Otp.deleteOne({ _id: otp._id });
      return res.status(400).json({ message: "OTP expired. Please request a new one." });
    }

    if (otp.attempts >= OTP_MAX_ATTEMPTS) {
      await Otp.deleteOne({ _id: otp._id });
      return res
        .status(429)
        .json({ message: "Too many attempts. Please request a new OTP." });
    }

    const match = await bcrypt.compare(String(code), otp.codeHash);
    if (!match) {
      otp.attempts += 1;
      await otp.save();
      return res.status(400).json({ message: "Invalid code" });
    }

    // Double-check the email is still free (race condition guard)
    const existing = await User.findOne({ email: normalizedEmail });
    if (existing) {
      await Otp.deleteOne({ _id: otp._id });
      return res.status(400).json({ message: "User already exists" });
    }

    const user = await User.create({
      name: otp.name,
      email: normalizedEmail,
      password: otp.passwordHash,
      emailVerified: true,
    });

    await Otp.deleteOne({ _id: otp._id });

    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      token: generateToken(user._id),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * Resend the OTP for a signup already in flight.
 */
exports.resendSignupOtp = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: "Email required" });
    const normalizedEmail = email.toLowerCase().trim();

    const otp = await Otp.findOne({ email: normalizedEmail });
    if (!otp) {
      return res.status(400).json({
        message: "No pending verification. Please sign up again.",
      });
    }

    const code = genCode();
    const salt = await bcrypt.genSalt(10);
    otp.codeHash = await bcrypt.hash(code, salt);
    otp.attempts = 0;
    otp.expiresAt = new Date(Date.now() + OTP_TTL_MS);
    await otp.save();

    await sendOtpEmail(normalizedEmail, code, otp.name);
    res.json({ message: "OTP resent" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }
    const normalizedEmail = email.toLowerCase().trim();

    const user = await User.findOne({ email: normalizedEmail });
    if (!user) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      token: generateToken(user._id),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

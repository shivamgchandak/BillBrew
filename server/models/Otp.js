const mongoose = require("mongoose");

/**
 * One-time password used during signup email verification.
 * MongoDB TTL index removes expired documents automatically.
 */
const otpSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, lowercase: true, index: true },
    codeHash: { type: String, required: true }, // bcrypt hash of the 6-digit code
    name: { type: String, required: true },
    passwordHash: { type: String, required: true }, // signup password (hashed)
    attempts: { type: Number, default: 0 },
    expiresAt: { type: Date, required: true },
  },
  { timestamps: true }
);

// Auto-delete once expiresAt is in the past
otpSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

module.exports = mongoose.model("Otp", otpSchema);

const express = require("express");
const {
  requestSignupOtp,
  verifySignupOtp,
  resendSignupOtp,
  login,
} = require("../controllers/authController");

const router = express.Router();

// New OTP-based signup flow
router.post("/signup/request-otp", requestSignupOtp);
router.post("/signup/verify-otp", verifySignupOtp);
router.post("/signup/resend-otp", resendSignupOtp);

// Backwards-compatible alias so old clients don't break — hits the OTP request.
router.post("/signup", requestSignupOtp);

router.post("/login", login);

module.exports = router;

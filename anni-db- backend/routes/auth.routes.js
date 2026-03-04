const express = require("express");
const router = express.Router();
const authService = require("../services/auth.service");
const sendEmail = require("../utils/sendEmail");

/* =========================================
   LOGIN
========================================= */
router.post("/login", async (req, res) => {
  try {
    const { companySlug, email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        message: "email and password are required"
      });
    }

    const token = await authService.login(
      companySlug || null,
      email,
      password
    );

    res.json({ token });

  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

/* =========================================
   REQUEST OTP
========================================= */
router.post("/request-otp", async (req, res) => {
  try {
    const { companySlug, email } = req.body;

    if (!companySlug || !email) {
      return res.status(400).json({
        message: "companySlug and email are required"
      });
    }

    const otp = await authService.requestOTP(companySlug, email);

    await sendEmail(
      email,
      "Account Verification OTP",
      `
        <h2>Your OTP Code</h2>
        <p><b>${otp}</b></p>
        <p>This OTP will expire in 5 minutes.</p>
      `
    );

    res.json({
      message: "OTP sent to your email successfully"
    });

  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

/* =========================================
   VERIFY OTP
========================================= */
router.post("/verify-otp", async (req, res) => {
  try {
    const { companySlug, email, otp, newPassword } = req.body;

    if (!companySlug || !email || !otp || !newPassword) {
      return res.status(400).json({
        message: "All fields are required"
      });
    }

    await authService.verifyOTP(
      companySlug,
      email,
      otp,
      newPassword
    );

    res.json({
      message: "Account activated successfully"
    });

  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

module.exports = router;
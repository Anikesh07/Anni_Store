const express = require("express");
const router = express.Router();

const authService = require("../services/auth.service");
const sendEmail = require("../utils/sendEmail");

/* ==============================
   ADMIN REGISTER
============================== */
router.post("/register", async (req, res) => {
  try {
    const admin = await authService.register(req.body);
    res.status(201).json(admin);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

/* ==============================
   LOGIN (Admin + Employee)
============================== */
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const token = await authService.login(email, password);

    res.json({ token });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

/* ==============================
   REQUEST OTP (Employee)
============================== */
router.post("/request-otp", async (req, res) => {
  try {
    const { email } = req.body;

    const otp = await authService.requestOTP(email);

    await sendEmail(
      email,
      "Anni Store OTP Verification",
      `
        <h2>Your OTP Code</h2>
        <p><b>${otp}</b></p>
        <p>This OTP expires in 5 minutes.</p>
      `
    );

    res.json({ message: "OTP sent successfully" });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

/* ==============================
   VERIFY OTP (Activate Account)
============================== */
router.post("/verify-otp", async (req, res) => {
  try {
    const { email, otp, password } = req.body;

    await authService.verifyOTP(email, otp, password);

    res.json({ message: "Account activated successfully" });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

module.exports = router;
const express = require("express");
const router = express.Router();
const authService = require("../services/auth.service");

router.post("/register", async (req, res) => {
  try {
    const admin = await authService.register(req.body);
    res.json(admin);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

router.post("/login", async (req, res) => {
  try {
    const token = await authService.login(
      req.body.email,
      req.body.password
    );
    res.json({ token });
  } catch (err) {
    res.status(401).json({ message: err.message });
  }
});

module.exports = router;


const authMiddleware = require("../services/auth.middleware");

router.get("/me", authMiddleware, (req, res) => {
  res.json({
    message: "You are authenticated",
    admin: req.admin
  });
});
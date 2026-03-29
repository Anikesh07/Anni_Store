const express = require("express");
const router = express.Router();

const trainingController = require("../chatbot/controllers/training.controller");
const { protect } = require("../services/auth.middleware");
const mongoose = require("mongoose");

/* =========================================
   SAFE HANDLER WRAPPER (🔥 IMPORTANT)
========================================= */
const safe = (fn) => (req, res, next) => {
  if (typeof fn !== "function") {
    console.error("❌ Route handler is undefined");
    return res.status(500).json({ error: "Route misconfigured" });
  }

  Promise.resolve(fn(req, res, next)).catch((err) => {
    console.error("❌ Route Error:", err.message);
    res.status(500).json({ error: "Internal Server Error" });
  });
};

/* =========================================
   ROLE CHECK
========================================= */
const requireAdmin = (req, res, next) => {
  if (req.user.role !== "SUPER_ADMIN") {
    return res.status(403).json({ error: "Unauthorized" });
  }
  next();
};

/* =========================================
   VALIDATE ID
========================================= */
const validateId = (param) => (req, res, next) => {
  const value = req.params[param];

  if (!mongoose.Types.ObjectId.isValid(value)) {
    return res.status(400).json({ error: `Invalid ${param}` });
  }

  next();
};

/* =========================================
   ROUTES
========================================= */

// 🔥 TRAIN BOT
router.post("/train", protect, requireAdmin, safe(trainingController.trainBot));

// 🔍 GET TRAINING BY INTENT
router.get(
  "/:intentId",
  protect,
  validateId("intentId"),
  safe(trainingController.getByIntent)
);

// ➕ CREATE TRAINING
router.post("/", protect, requireAdmin, safe(trainingController.createTraining));

// ❌ DELETE TRAINING
router.delete(
  "/:id",
  protect,
  requireAdmin,
  validateId("id"),
  safe(trainingController.deleteTraining)
);

module.exports = router;
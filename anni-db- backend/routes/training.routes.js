const express = require("express");
const router = express.Router();

const trainingController = require("../chatbot/controllers/training.controller");
const { protect } = require("../services/auth.middleware");

/* =========================================
   TRAINING ROUTES
========================================= */

// 🔍 Debug (remove later if you want to feel brave again)
console.log("Training Controller Loaded:", Object.keys(trainingController));

// 🔥 TRAIN BOT (must be ABOVE dynamic routes)
router.post("/train", protect, trainingController.trainBot);

// GET training phrases by intent
router.get("/:intentId", protect, (req, res, next) => {
  if (!trainingController.getByIntent) {
    console.error("❌ getByIntent is undefined");
    return res.status(500).json({ error: "Route misconfigured: getByIntent missing" });
  }
  trainingController.getByIntent(req, res, next);
});

// ADD training phrase
router.post("/", protect, (req, res, next) => {
  if (!trainingController.createTraining) {
    console.error("❌ createTraining is undefined");
    return res.status(500).json({ error: "Route misconfigured: createTraining missing" });
  }
  trainingController.createTraining(req, res, next);
});

// DELETE training phrase
router.delete("/:id", protect, (req, res, next) => {
  if (!trainingController.deleteTraining) {
    console.error("❌ deleteTraining is undefined");
    return res.status(500).json({ error: "Route misconfigured: deleteTraining missing" });
  }
  trainingController.deleteTraining(req, res, next);
});

module.exports = router;
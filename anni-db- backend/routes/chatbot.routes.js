const express = require("express");
const router = express.Router();

const axios = require("axios");

const trainingController = require("../chatbot/controllers/training.controller");
const chatbotController = require("../chatbot/controllers/chatbot.controller");

const { protect } = require("../services/auth.middleware");

const RASA_URL = process.env.RASA_URL;

/* =========================================
   TRAIN BOT (🔒 PROTECTED + ROLE)
========================================= */
router.post("/train", protect, (req, res, next) => {
  if (req.user.role !== "SUPER_ADMIN") {
    return res.status(403).json({ error: "Unauthorized" });
  }
  return trainingController.trainBot(req, res, next);
});

/* =========================================
   CHAT MESSAGE (🔒 PROTECTED)
========================================= */
router.post("/message", protect, chatbotController.sendMessage);

/* =========================================
   LIVE LOGS
========================================= */
router.get("/logs", protect, (req, res) => {
  try {
    const logs = trainingController.getLogs();
    res.json(logs || []);
  } catch (err) {
    console.error("❌ Log fetch error:", err.message);
    res.status(500).json([]);
  }
});

/* =========================================
   BOT CONTROL (🔒 ROLE PROTECTED)
========================================= */
router.post("/start", protect, chatbotController.startBot);
router.post("/stop", protect, chatbotController.stopBot);
router.post("/restart", protect, chatbotController.restartBot);

/* =========================================
   HEALTH CHECK (FIXED PROPERLY)
========================================= */
router.get("/health", async (req, res) => {
  try {

    if (!RASA_URL) {
      return res.json({
        success: false,
        status: "unknown",
        message: "⚠️ RASA_URL not configured"
      });
    }

    await axios.get(`${RASA_URL}/status`, {
      timeout: 1500
    });

    return res.json({
      success: true,
      status: "running",
      message: "✅ Chatbot is running"
    });

  } catch (err) {

    console.log("⚠️ Rasa not reachable:", err.code || err.message);

    return res.json({
      success: false,
      status: "stopped",
      message: "❌ Chatbot is NOT running"
    });
  }
});

module.exports = router;
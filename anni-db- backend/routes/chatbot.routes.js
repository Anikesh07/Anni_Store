const express = require("express");
const router = express.Router();

const trainingController = require("../chatbot/controllers/training.controller");
const chatbotController = require("../chatbot/controllers/chatbot.controller");

const { protect } = require("../services/auth.middleware");

/* =========================================
   TRAIN BOT
========================================= */
router.post("/train", protect, trainingController.trainBot);

/* =========================================
   CHAT MESSAGE
========================================= */
router.post("/message", chatbotController.sendMessage);

/* =========================================
   LIVE LOGS (FOR CONSOLE UI)
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
   BOT CONTROL
========================================= */
router.post("/start", protect, chatbotController.startBot);
router.post("/stop", protect, chatbotController.stopBot);
router.post("/restart", protect, chatbotController.restartBot);

/* =========================================
   HEALTH CHECK (FIXED 🔥)
========================================= */
router.get("/health", async (req, res) => {
  try {
    const axios = require("axios");

    await axios.get("http://localhost:5005", {
      timeout: 1500
    });

    // ✅ ALWAYS RETURN 200
    return res.json({
      success: true,
      status: "running",
      message: "✅ Chatbot is running"
    });

  } catch (err) {

    // ❌ DO NOT THROW 500 HERE
    console.log("⚠️ Rasa not reachable:", err.code || err.message);

    return res.json({
      success: false,
      status: "stopped",
      message: "❌ Chatbot is NOT running"
    });
  }
});

module.exports = router;
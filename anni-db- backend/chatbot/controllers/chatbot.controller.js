const axios = require("axios");
const botService = require("../services/botProcess.service");

// ✅ ADD THIS LINE
const { addLog } = require("../utils/logger");

const RASA_URL = process.env.RASA_URL;

/* =========================================
   SEND MESSAGE TO RASA
========================================= */
exports.sendMessage = async (req, res) => {
  try {

    const { message } = req.body;
    const companyId = req.user?.companyId;
    const userId = req.user?._id || "anon";

    /* =========================
       VALIDATION
    ========================= */

    if (!message || !message.trim()) {
      addLog("❌ Empty message received");
      return res.status(400).json({
        error: "Message is required"
      });
    }

    if (!companyId) {
      addLog("❌ Missing companyId");
      return res.status(400).json({
        error: "Company context missing"
      });
    }

    if (!RASA_URL) {
      addLog("❌ RASA_URL not configured");
      return res.status(500).json({
        error: "RASA_URL not configured"
      });
    }

    const cleanMessage = message.trim();

    console.log(`💬 [${companyId}] ${cleanMessage}`);
    addLog(`💬 User: ${cleanMessage}`);

    /* =========================
       CALL RASA
    ========================= */

    const response = await axios.post(
      `${RASA_URL}/webhooks/rest/webhook`,
      {
        sender: `${companyId}_${userId}`,
        message: cleanMessage
      },
      {
        timeout: 5000,
        headers: {
          "Content-Type": "application/json"
        }
      }
    );

    const rasaReplies = response.data;

    /* =========================
       EMPTY RESPONSE
    ========================= */

    if (!Array.isArray(rasaReplies) || rasaReplies.length === 0) {
      addLog("⚠️ Empty response from Rasa");

      return res.status(200).json({
        success: true,
        replies: [
          {
            type: "text",
            text: "🤖 I didn’t understand that. Try rephrasing."
          }
        ]
      });
    }

    /* =========================
       FORMAT RESPONSE
    ========================= */

    const cleanedReplies = rasaReplies.map((r) => {

      if (r.text) {
        return { type: "text", text: r.text };
      }

      if (r.buttons) {
        return {
          type: "buttons",
          text: r.text || "Choose an option:",
          buttons: r.buttons
        };
      }

      if (r.image) {
        return {
          type: "image",
          url: r.image
        };
      }

      if (r.custom) {
        return {
          type: "custom",
          payload: r.custom
        };
      }

      return { type: "text", text: "🤖 ..." };
    });

    console.log(`🤖 Replies: ${cleanedReplies.length}`);
    addLog(`🤖 Bot replied with ${cleanedReplies.length} messages`);

    return res.status(200).json({
      success: true,
      replies: cleanedReplies
    });

  } catch (err) {

    let errorMessage = "⚠️ Chatbot is currently unavailable";

    if (err.code === "ECONNREFUSED") {
      console.error("❌ Rasa server not running");
      addLog("❌ Rasa server not running");
      errorMessage = "⚠️ Chatbot is offline";
    } 
    else if (err.code === "ECONNABORTED") {
      console.error("⏱️ Rasa timeout");
      addLog("⏱️ Rasa timeout");
      errorMessage = "⚠️ Chatbot is slow right now";
    } 
    else if (err.response) {
      console.error("❌ Rasa API error:", err.response.status);
      addLog(`❌ Rasa API error: ${err.response.status}`);
    } 
    else {
      console.error("❌ Chatbot Error:", err.message);
      addLog(`❌ Chatbot error: ${err.message}`);
    }

    return res.status(200).json({
      success: false,
      replies: [
        {
          type: "text",
          text: errorMessage
        }
      ]
    });
  }
};

/* =========================================
   START BOT
========================================= */
exports.startBot = (req, res) => {
  try {

    if (req.user.role !== "SUPER_ADMIN") {
      addLog("❌ Unauthorized start attempt");
      return res.status(403).json({ error: "Unauthorized" });
    }

    addLog("🚀 Starting bot...");

    const msg = botService.startBot();

    console.log("🟢 Bot Start:", msg);
    addLog(`🟢 ${msg}`);

    return res.json({
      success: true,
      message: msg
    });

  } catch (err) {

    console.error("❌ Start Bot Error:", err.message);
    addLog(`❌ Start bot error: ${err.message}`);

    return res.status(500).json({
      success: false,
      error: err.message
    });
  }
};

/* =========================================
   STOP BOT
========================================= */
exports.stopBot = (req, res) => {
  try {

    if (req.user.role !== "SUPER_ADMIN") {
      addLog("❌ Unauthorized stop attempt");
      return res.status(403).json({ error: "Unauthorized" });
    }

    addLog("🛑 Stopping bot...");

    const msg = botService.stopBot();

    console.log("🔴 Bot Stop:", msg);
    addLog(`🔴 ${msg}`);

    return res.json({
      success: true,
      message: msg
    });

  } catch (err) {

    console.error("❌ Stop Bot Error:", err.message);
    addLog(`❌ Stop bot error: ${err.message}`);

    return res.status(500).json({
      success: false,
      error: err.message
    });
  }
};

/* =========================================
   RESTART BOT
========================================= */
exports.restartBot = (req, res) => {
  try {

    if (req.user.role !== "SUPER_ADMIN") {
      addLog("❌ Unauthorized restart attempt");
      return res.status(403).json({ error: "Unauthorized" });
    }

    addLog("🔄 Restarting bot...");

    const msg = botService.restartBot();

    console.log("🔵 Bot Restart:", msg);
    addLog(`🔵 ${msg}`);

    return res.json({
      success: true,
      message: msg
    });

  } catch (err) {

    console.error("❌ Restart Bot Error:", err.message);
    addLog(`❌ Restart bot error: ${err.message}`);

    return res.status(500).json({
      success: false,
      error: err.message
    });
  }
};
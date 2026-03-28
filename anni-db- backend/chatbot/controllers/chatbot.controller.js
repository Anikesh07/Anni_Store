const axios = require("axios");
const botService = require("../services/botProcess.service");

/* =========================================
   SEND MESSAGE TO RASA
========================================= */
exports.sendMessage = async (req, res) => {
  try {

    const { message } = req.body;
    const companyId = req.user?.companyId;

    /* =========================
       VALIDATION
    ========================= */

    if (!message || !message.trim()) {
      return res.status(400).json({
        error: "Message is required"
      });
    }

    if (!companyId) {
      return res.status(400).json({
        error: "Company context missing"
      });
    }

    const cleanMessage = message.trim();

    console.log(`💬 [${companyId}] ${cleanMessage}`);

    /* =========================
       CALL RASA
    ========================= */

    const response = await axios.post(
      "http://localhost:5005/webhooks/rest/webhook",
      {
        sender: companyId.toString(),
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
      console.warn("⚠️ Empty response from Rasa");

      return res.json([
        {
          type: "text",
          text: "🤖 I didn’t understand that. Try rephrasing."
        }
      ]);
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

    return res.json(cleanedReplies);

  } catch (err) {

    /* =========================
       ERROR HANDLING
    ========================= */

    let errorMessage = "⚠️ Chatbot is currently unavailable";

    if (err.code === "ECONNREFUSED") {
      console.error("❌ Rasa server not running");
      errorMessage = "⚠️ Chatbot is offline";
    } 
    else if (err.code === "ECONNABORTED") {
      console.error("⏱️ Rasa timeout");
      errorMessage = "⚠️ Chatbot is slow right now";
    } 
    else if (err.response) {
      console.error("❌ Rasa API error:", err.response.status);
    } 
    else {
      console.error("❌ Chatbot Error:", err.message);
    }

    return res.json([
      {
        type: "text",
        text: errorMessage
      }
    ]);
  }
};

/* =========================================
   START BOT
========================================= */
exports.startBot = (req, res) => {
  try {

    const msg = botService.startBot();

    console.log("🟢 Bot Start:", msg);

    return res.json({
      success: true,
      message: msg
    });

  } catch (err) {

    console.error("❌ Start Bot Error:", err.message);

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

    const msg = botService.stopBot();

    console.log("🔴 Bot Stop:", msg);

    return res.json({
      success: true,
      message: msg
    });

  } catch (err) {

    console.error("❌ Stop Bot Error:", err.message);

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

    const msg = botService.restartBot();

    console.log("🔵 Bot Restart:", msg);

    return res.json({
      success: true,
      message: msg
    });

  } catch (err) {

    console.error("❌ Restart Bot Error:", err.message);

    return res.status(500).json({
      success: false,
      error: err.message
    });
  }
};
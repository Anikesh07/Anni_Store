const yamlService = require("../services/yamlGenerator.service");
const rasaService = require("../services/rasaTrainer.service");

/* =========================================
   IN-MEMORY LOG STORE
========================================= */

let logs = [];
let isTraining = false; // 🔥 LOCK

/* =========================================
   LOG HELPERS
========================================= */

function getTimestamp() {
  return new Date().toISOString();
}

function addLog(msg) {
  const time = getTimestamp();
  const line = `[${time}] ${msg}`;

  logs.push(line);

  // 🔥 prevent memory explosion
  if (logs.length > 300) logs.shift();

  // ALSO log to terminal (debug king move)
  console.log(line);
}

function clearLogs() {
  logs = [];
}

function getLogs() {
  return logs;
}

/* =========================================
   EXPORT LOG FUNCTIONS
========================================= */

exports.addLog = addLog;
exports.clearLogs = clearLogs;
exports.getLogs = getLogs;

// ✅ NEW: expose training status
exports.isTraining = () => isTraining;

/* =========================================
   TRAIN BOT
========================================= */

exports.trainBot = async (req, res) => {
  try {

    const companyId = req.user?.companyId;

    if (!companyId) {
      addLog("❌ Missing companyId");
      return res.status(400).json({
        error: "Company ID missing from user"
      });
    }

    /* 🔥 BLOCK MULTIPLE TRAINING */
    if (isTraining) {
      addLog("⚠️ Training already in progress");
      return res.status(400).json({
        error: "Training already in progress"
      });
    }

    isTraining = true;

    /* =========================
       INIT LOGS
    ========================= */

    clearLogs();

    addLog("====================================");
    addLog("🚀 TRAINING STARTED");
    addLog(`🏢 Company: ${companyId}`);
    addLog("====================================");

    /* =========================
       STEP 1: YAML
    ========================= */

    try {
      addLog("📦 Generating YAML...");
      await yamlService.generateFiles(companyId);
      addLog("✅ YAML generated successfully");
    } catch (err) {
      addLog("❌ YAML generation failed");
      addLog(`📍 ${err.message}`);
      throw new Error("YAML generation failed");
    }

    /* =========================
       STEP 2: RASA TRAIN
    ========================= */

    try {
      addLog("🤖 Training Rasa model...");
      await rasaService.trainModel();
      addLog("✅ Rasa training completed");
    } catch (err) {
      addLog("❌ Rasa training failed");
      addLog(`📍 ${err.message}`);
      throw new Error("Rasa training failed");
    }

    /* =========================
       SUCCESS
    ========================= */

    addLog("====================================");
    addLog("🎉 TRAINING SUCCESS");
    addLog("====================================");

    isTraining = false;

    return res.json({
      success: true,
      message: "Chatbot trained successfully"
    });

  } catch (err) {

    isTraining = false;

    addLog("====================================");
    addLog("❌ TRAINING FAILED");
    addLog(`📍 ${err.message}`);
    addLog("====================================");

    console.error("❌ Training Error:", err.message);

    return res.status(500).json({
      success: false,
      error: "Chatbot training failed",
      details: err.message
    });
  }
};
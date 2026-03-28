const yamlService = require("../services/yamlGenerator.service");
const rasaService = require("../services/rasaTrainer.service");

/* =========================================
   IN-MEMORY LOG STORE (SHARED)
========================================= */

let logs = [];

/* =========================================
   LOG HELPERS
========================================= */

function getTimestamp() {
  return new Date().toISOString(); // 🔥 proper format
}

function addLog(msg) {
  const time = getTimestamp();
  logs.push(`[${time}] ${msg}`);

  // prevent memory leak
  if (logs.length > 300) logs.shift();
}

function clearLogs() {
  logs = [];
}

function getLogs() {
  return logs;
}

/* =========================================
   EXPORT LOG FUNCTIONS (VERY IMPORTANT)
========================================= */

exports.addLog = addLog;
exports.clearLogs = clearLogs;
exports.getLogs = getLogs;

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

    /* =========================
       INIT LOGS
    ========================= */

    clearLogs();

    addLog("====================================");
    addLog("🚀 TRAINING STARTED");
    addLog(`🏢 Company: ${companyId}`);
    addLog("====================================");

    console.log("🚀 Training started");

    /* =========================
       STEP 1: YAML
    ========================= */

    addLog("📦 Generating YAML...");
    await yamlService.generateFiles(companyId);
    addLog("✅ YAML generated");

    /* =========================
       STEP 2: RASA TRAIN
    ========================= */

    addLog("🤖 Training model...");
    await rasaService.trainModel();
    addLog("✅ Training completed");

    /* =========================
       SUCCESS
    ========================= */

    addLog("====================================");
    addLog("🎉 TRAINING SUCCESS");
    addLog("====================================");

    return res.json({
      success: true,
      message: "Chatbot trained successfully"
    });

  } catch (err) {

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
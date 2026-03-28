const { spawn } = require("child_process");
const path = require("path");
const trainingController = require("../controllers/training.controller");

let rasaProcess = null;
let actionProcess = null;
let isBotReady = false;

const rasaPath = process.env.RASA_PATH;

if (!rasaPath) {
  throw new Error("RASA_PATH not defined in .env");
}

const pythonPath = path.join(
  rasaPath,
  "venv",
  "Scripts",
  "python.exe"
);

/* =========================================
   FILTER LOGS
========================================= */
function filterLog(msg) {
  const lower = msg.toLowerCase();

  if (
    lower.includes("deprecationwarning") ||
    lower.includes("pkg_resources") ||
    lower.includes("distutils") ||
    lower.includes("pyparsing") ||
    lower.includes("sqlalchemy") ||
    lower.includes("matplotlib")
  ) {
    return null;
  }

  return msg.trim();
}

/* =========================================
   START BOT
========================================= */
exports.startBot = () => {

  if (rasaProcess || actionProcess) {
    return "⚠️ Bot already running";
  }

  isBotReady = false;

  trainingController.addLog("🚀 Starting Rasa server...");

  rasaProcess = spawn(
    pythonPath,
    ["-m", "rasa", "run", "--enable-api", "--cors", "*"],
    { cwd: rasaPath }
  );

  /* 🔥 FAIL SAFE (if bot never starts) */
  const startTimeout = setTimeout(() => {
    if (!isBotReady) {
      trainingController.addLog("❌ Bot failed to start");
    }
  }, 8000);

  rasaProcess.stdout.on("data", (data) => {
    const raw = data.toString();
    const msg = filterLog(raw);
    if (!msg) return;

    console.log("🤖", msg);
    trainingController.addLog(msg);

    if (raw.includes("Running on")) {
      isBotReady = true;
      clearTimeout(startTimeout);
      trainingController.addLog("🟢 Bot is LIVE on port 5005");
    }
  });

  rasaProcess.stderr.on("data", (data) => {
    const raw = data.toString();
    const msg = filterLog(raw);
    if (!msg) return;

    if (raw.toLowerCase().includes("error")) {
      trainingController.addLog("❌ " + msg);
    } else if (raw.toLowerCase().includes("warning")) {
      trainingController.addLog("⚠️ " + msg);
    } else {
      trainingController.addLog(msg);
    }

    console.error("⚠️", msg);
  });

  rasaProcess.on("close", () => {
    trainingController.addLog("🔴 Rasa server stopped");
    rasaProcess = null;
    isBotReady = false;
  });

  /* =========================================
     ACTION SERVER
  ========================================= */

  trainingController.addLog("⚡ Starting action server...");

  actionProcess = spawn(
    pythonPath,
    ["-m", "rasa", "run", "actions"],
    { cwd: rasaPath }
  );

  actionProcess.stdout.on("data", (data) => {
    const msg = filterLog(data.toString());
    if (!msg) return;

    console.log("⚡", msg);
    trainingController.addLog(msg);
  });

  actionProcess.stderr.on("data", (data) => {
    const raw = data.toString();
    const msg = filterLog(raw);
    if (!msg) return;

    if (raw.toLowerCase().includes("error")) {
      trainingController.addLog("❌ " + msg);
    } else if (raw.toLowerCase().includes("warning")) {
      trainingController.addLog("⚠️ " + msg);
    } else {
      trainingController.addLog(msg);
    }

    console.error("⚠️", msg);
  });

  actionProcess.on("close", () => {
    trainingController.addLog("🔴 Action server stopped");
    actionProcess = null;
  });

  return "⏳ Starting bot...";
};

/* =========================================
   STOP BOT (FIXED)
========================================= */
exports.stopBot = () => {

  if (!rasaProcess && !actionProcess) {
    return "⚠️ Bot not running";
  }

  try {
    if (rasaProcess?.pid) {
      spawn("taskkill", ["/pid", rasaProcess.pid, "/f", "/t"]);
      rasaProcess = null;
    }

    if (actionProcess?.pid) {
      spawn("taskkill", ["/pid", actionProcess.pid, "/f", "/t"]);
      actionProcess = null;
    }
  } catch (err) {
    console.error("❌ Kill error:", err.message);
  }

  isBotReady = false;
  trainingController.addLog("🛑 Bot stopped");

  return "🛑 Bot stopped";
};

/* =========================================
   RESTART BOT
========================================= */
exports.restartBot = () => {
  exports.stopBot();
  return exports.startBot();
};

/* =========================================
   STATUS CHECK
========================================= */
exports.getBotStatus = () => {
  return isBotReady ? "running" : "stopped";
};
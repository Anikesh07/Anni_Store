const { spawn } = require("child_process");
const path = require("path");

/* 🔥 TEMP LOGGER (until you move to utils/logger.js) */
const log = (msg) => console.log(msg);

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
   SAFE KILL
========================================= */
function killProcess(proc) {
  if (!proc?.pid) return;

  try {
    process.kill(proc.pid, "SIGINT");
  } catch (err) {
    console.error("❌ Kill failed:", err.message);
  }
}

/* =========================================
   START BOT
========================================= */
exports.startBot = () => {

  /* ✅ FIXED: both must be running */
  if (rasaProcess && actionProcess) {
    return "⚠️ Bot already running";
  }

  isBotReady = false;

  log("🚀 Starting Rasa server...");

  rasaProcess = spawn(
    pythonPath,
    ["-m", "rasa", "run", "--enable-api", "--cors", "*"],
    { cwd: rasaPath }
  );

  const startTimeout = setTimeout(() => {
    if (!isBotReady) {
      log("❌ Bot failed to start");
    }
  }, 8000);

  rasaProcess.stdout.on("data", (data) => {
    const raw = data.toString();
    const msg = filterLog(raw);
    if (!msg) return;

    console.log("🤖", msg);

    /* ✅ FIXED detection */
    if (raw.toLowerCase().includes("running on http")) {
      isBotReady = true;
      clearTimeout(startTimeout);
      log("🟢 Bot is LIVE on port 5005");
    }
  });

  rasaProcess.stderr.on("data", (data) => {
    const raw = data.toString();
    const msg = filterLog(raw);
    if (!msg) return;

    console.error("⚠️", msg);
  });

  rasaProcess.on("close", () => {
    log("🔴 Rasa server stopped");
    rasaProcess = null;
    isBotReady = false;
  });

  /* =========================================
     ACTION SERVER
  ========================================= */

  log("⚡ Starting action server...");

  actionProcess = spawn(
    pythonPath,
    ["-m", "rasa", "run", "actions"],
    { cwd: rasaPath }
  );

  actionProcess.stdout.on("data", (data) => {
    const msg = filterLog(data.toString());
    if (!msg) return;

    console.log("⚡", msg);
  });

  actionProcess.stderr.on("data", (data) => {
    const msg = filterLog(data.toString());
    if (!msg) return;

    console.error("⚠️", msg);
  });

  actionProcess.on("close", () => {
    log("🔴 Action server stopped");
    actionProcess = null;
  });

  return "⏳ Starting bot...";
};

/* =========================================
   STOP BOT
========================================= */
exports.stopBot = () => {

  if (!rasaProcess && !actionProcess) {
    return "⚠️ Bot not running";
  }

  try {
    killProcess(rasaProcess);
    killProcess(actionProcess);

    rasaProcess = null;
    actionProcess = null;

  } catch (err) {
    console.error("❌ Stop error:", err.message);
  }

  isBotReady = false;

  log("🛑 Bot stopped");

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
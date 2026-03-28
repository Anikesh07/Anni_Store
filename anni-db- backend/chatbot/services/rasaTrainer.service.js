const { spawn } = require("child_process");
const path = require("path");

const trainingController = require("../controllers/training.controller");

exports.trainModel = () => {
  return new Promise((resolve, reject) => {

    /* =========================================
       ✅ PATH FROM ENV
    ========================================= */
    const rasaPath = process.env.RASA_PATH;

    if (!rasaPath) {
      return reject(new Error("RASA_PATH not defined in .env"));
    }

    const pythonPath = path.join(
      rasaPath,
      "venv",
      "Scripts",
      "python.exe"
    );

    /* =========================================
       LOGGER
    ========================================= */
    const addLog = (msg) => {
      if (trainingController?.addLog) {
        trainingController.addLog(msg);
      } else {
        console.log(msg);
      }
    };

    /* =========================================
       START TRAINING
    ========================================= */

    addLog("🚀 Training started...");
    addLog(`📁 Path: ${rasaPath}`);

    const rasaProcess = spawn(
      pythonPath,
      ["-m", "rasa", "train"],
      { cwd: rasaPath }
    );

    /* =========================================
       TIMEOUT (🔥 IMPORTANT)
    ========================================= */
    const timeout = setTimeout(() => {
      addLog("⏱️ Training timeout - killing process");
      rasaProcess.kill();
      reject(new Error("Training timeout"));
    }, 5 * 60 * 1000); // 5 min

    /* ==============================
       STDOUT
    ============================== */
    rasaProcess.stdout.on("data", (data) => {
      const msg = data.toString().trim().toLowerCase();

      if (
        msg.includes("epoch") ||
        msg.includes("training") ||
        msg.includes("completed") ||
        msg.includes("saved") ||
        msg.includes("model")
      ) {
        addLog(msg);
      }

      console.log("📤", msg);
    });

    /* ==============================
       STDERR
    ============================== */
    rasaProcess.stderr.on("data", (data) => {
      const raw = data.toString();
      const msg = raw.toLowerCase();

      if (
        msg.includes("pkg_resources") ||
        msg.includes("deprecationwarning") ||
        msg.includes("sqlalchemy") ||
        msg.includes("matplotlib")
      ) {
        return;
      }

      addLog("⚠️ " + raw.trim());
      console.error("⚠️", raw.trim());
    });

    /* ==============================
       ERROR
    ============================== */
    rasaProcess.on("error", (err) => {
      clearTimeout(timeout);
      addLog("❌ Failed to start training");
      console.error("❌", err.message);
      reject(err);
    });

    /* ==============================
       CLOSE
    ============================== */
    rasaProcess.on("close", (code) => {

      clearTimeout(timeout);

      addLog(`🔚 Exit code: ${code}`);

      if (code !== 0) {
        addLog("❌ Training failed");
        return reject(new Error("Rasa training failed"));
      }

      addLog("🎉 Training completed successfully");
      resolve();
    });

  });
};
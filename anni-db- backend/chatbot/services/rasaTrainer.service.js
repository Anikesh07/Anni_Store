const { spawn } = require("child_process");
const path = require("path");

/* 🔥 CONNECT TO TRAINING LOGGER */
const trainingController = require("../controllers/training.controller");

/* 🔥 LOGGER (REAL ONE) */
const log = (msg) => {
  console.log(msg);
  if (trainingController?.addLog) {
    trainingController.addLog(msg);
  }
};

let isTraining = false; // 🔥 LOCK

exports.trainModel = () => {
  return new Promise((resolve, reject) => {

    /* 🔥 BLOCK MULTIPLE TRAINING */
    if (isTraining) {
      return reject(new Error("Training already in progress"));
    }

    isTraining = true;

    const rasaPath = process.env.RASA_PATH;

    if (!rasaPath) {
      isTraining = false;
      return reject(new Error("RASA_PATH not defined in .env"));
    }

    const pythonPath = path.join(
      rasaPath,
      "venv",
      "Scripts",
      "python.exe"
    );

    /* =========================================
       START TRAINING
    ========================================= */

    log("🚀 Training started...");
    log(`📁 Path: ${rasaPath}`);

    const rasaProcess = spawn(
      pythonPath,
      ["-m", "rasa", "train"],
      { cwd: rasaPath }
    );

    let finished = false;

    const cleanup = () => {
      isTraining = false;
      finished = true;
    };

    /* =========================================
       TIMEOUT
    ========================================= */
    const timeout = setTimeout(() => {
      if (finished) return;

      log("⏱️ Training timeout - killing process");

      try {
        rasaProcess.kill("SIGINT");
      } catch (err) {
        console.error("❌ Kill failed:", err.message);
      }

      cleanup();
      reject(new Error("Training timeout"));
    }, 5 * 60 * 1000);

    /* ==============================
       STDOUT (🔥 FIXED)
    ============================== */
    rasaProcess.stdout.on("data", (data) => {
      const msg = data.toString().trim();

      if (!msg) return;

      // 🔥 SEND EVERYTHING TO UI
      log("📤 " + msg);
    });

    /* ==============================
       STDERR (🔥 FIXED)
    ============================== */
    rasaProcess.stderr.on("data", (data) => {
      const msg = data.toString().trim();

      if (!msg) return;

      // 🔥 SEND WARNINGS TO UI
      log("⚠️ " + msg);
    });

    /* ==============================
       ERROR
    ============================== */
    rasaProcess.on("error", (err) => {
      if (finished) return;

      clearTimeout(timeout);
      log("❌ Failed to start training");
      console.error("❌", err.message);

      cleanup();
      reject(err);
    });

    /* ==============================
       CLOSE
    ============================== */
    rasaProcess.on("close", (code) => {

      if (finished) return;

      clearTimeout(timeout);

      log(`🔚 Exit code: ${code}`);

      if (code !== 0) {
        log("❌ Training failed");
        cleanup();
        return reject(new Error("Rasa training failed"));
      }

      log("🎉 Training completed successfully");

      cleanup();
      resolve();
    });

  });
};
/* =========================================
   RASA → DB IMPORT SCRIPT (FINAL VERSION)
   - Supports .env path
   - Has fallback auto-detect
   - Safe against missing files
   - Avoids duplicate intents
========================================= */

const fs = require("fs");
const path = require("path");
const yaml = require("yaml");
const mongoose = require("mongoose");
require("dotenv").config();

const Intent = require("../chatbot/models/intent.model");
const Training = require("../chatbot/models/trainingPhrase.model");
const Response = require("../chatbot/models/response.model");

const connectMongo = require("../config/db");

/* =========================================
   CONFIG
========================================= */

// 🔥 Use ENV or fallback
const rasaPath =
  process.env.RASA_PATH ||
  path.resolve(__dirname, "../../anni-bot");

// 🧠 Build paths safely
const nluPath = path.join(rasaPath, "data", "nlu.yml");
const domainPath = path.join(rasaPath, "domain.yml");

// ✅ Your company
const COMPANY_ID = new mongoose.Types.ObjectId(
  process.env.COMPANY_ID || "69aabcc5cb31fe9431ea9898"
);

/* =========================================
   VALIDATION
========================================= */

function validatePaths() {
  console.log("📁 Rasa Path:", rasaPath);

  if (!fs.existsSync(nluPath)) {
    throw new Error(`❌ NLU file not found at: ${nluPath}`);
  }

  if (!fs.existsSync(domainPath)) {
    throw new Error(`❌ Domain file not found at: ${domainPath}`);
  }
}

/* =========================================
   IMPORT FUNCTION
========================================= */

async function importData() {
  await connectMongo();

  console.log("🚀 Importing Rasa data...");

  validatePaths();

  /* =========================
     LOAD NLU
  ========================= */

  const nluFile = fs.readFileSync(nluPath, "utf8");
  const nluData = yaml.parse(nluFile);

  for (let item of nluData.nlu) {
    const intentName = item.intent;

    // Avoid duplicates
    let intent = await Intent.findOne({
      name: intentName,
      companyId: COMPANY_ID
    });

    if (!intent) {
      intent = await Intent.create({
        name: intentName,
        companyId: COMPANY_ID
      });
    }

    const phrases = item.examples.split("\n");

    for (let p of phrases) {
      const text = p.replace("- ", "").trim();
      if (!text) continue;

      await Training.create({
        text,
        intentId: intent._id,
        companyId: COMPANY_ID
      });
    }
  }

  console.log("✅ NLU imported");

  /* =========================
     LOAD DOMAIN
  ========================= */

  const domainFile = fs.readFileSync(domainPath, "utf8");
  const domainData = yaml.parse(domainFile);

  for (let key in domainData.responses) {
    const intentName = key.replace("utter_", "");

    const intent = await Intent.findOne({
      name: intentName,
      companyId: COMPANY_ID
    });

    if (!intent) continue;

    const messages = domainData.responses[key];

    for (let msg of messages) {
      if (!msg.text) continue;

      await Response.create({
        intentId: intent._id,
        text: msg.text,
        companyId: COMPANY_ID
      });
    }
  }

  console.log("✅ Responses imported");

  console.log("🎉 DONE");
  process.exit();
}

importData();
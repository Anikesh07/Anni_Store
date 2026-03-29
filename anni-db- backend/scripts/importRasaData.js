/* =========================================
   RASA → DB IMPORT SCRIPT (FIXED + ROBUST)
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

const rasaPath =
  process.env.RASA_PATH ||
  path.resolve(__dirname, "../../anni-bot");

const nluPath = path.join(rasaPath, "data", "nlu.yml");
const domainPath = path.join(rasaPath, "domain.yml");

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
   SAFE ARRAY NORMALIZER
========================================= */

function toArray(val) {
  if (!val) return [];
  return Array.isArray(val) ? val : [val];
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

  for (let item of nluData.nlu || []) {

    const intentName = item.intent?.trim().toLowerCase();
    if (!intentName) continue;

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

    const phrases = (item.examples || "").split("\n");

    for (let p of phrases) {

      const text = p.replace("- ", "").trim();
      if (!text) continue;

      // 🚫 prevent duplicates
      const exists = await Training.findOne({
        text,
        intentId: intent._id,
        companyId: COMPANY_ID
      });

      if (exists) continue;

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

  for (let key in domainData.responses || {}) {

    const intentName = key.replace("utter_", "").trim().toLowerCase();

    const intent = await Intent.findOne({
      name: intentName,
      companyId: COMPANY_ID
    });

    if (!intent) continue;

    const rawMessages = domainData.responses[key];

    // 🔥 FIX: normalize to array
    const messagesArray = toArray(rawMessages);

    for (let msg of messagesArray) {

      if (!msg) continue;

      let text = "";

      // support multiple formats
      if (typeof msg === "string") {
        text = msg;
      } 
      else if (msg.text) {
        text = msg.text;
      } 
      else if (msg.image) {
        text = msg.image;
      }

      text = (text || "").trim();
      if (!text) continue;

      // 🚫 prevent duplicates
      const exists = await Response.findOne({
        intentId: intent._id,
        companyId: COMPANY_ID,
        messages: text
      });

      if (exists) continue;

      await Response.create({
        intentId: intent._id,
        messages: [text], // 🔥 IMPORTANT FIX
        companyId: COMPANY_ID
      });
    }
  }

  console.log("✅ Responses imported");

  console.log("🎉 DONE");
  process.exit();
}

importData();
const fs = require("fs");
const path = require("path");
const YAML = require("yaml");

const Intent = require("../models/intent.model");
const Training = require("../models/trainingPhrase.model");
const Response = require("../models/response.model");

/* 🔥 SIMPLE LOGGER */
const log = (msg) => console.log(msg);

exports.generateFiles = async (companyId) => {
  try {

    if (!companyId) {
      throw new Error("companyId is required");
    }

    /* =========================================
       FETCH DATA
    ========================================= */

    const intents = await Intent.find({ companyId }).lean();
    const trainings = await Training.find({ companyId }).lean();
    const responses = await Response.find({ companyId }).lean();

    if (!intents.length) {
      log("⚠️ No intents found");
      return;
    }

    /* =========================================
       PATHS
    ========================================= */

    const rasaRootPath = process.env.RASA_PATH;
    const rasaDataPath = process.env.RASA_DATA_PATH;
    const domainPath = path.join(rasaRootPath, "domain.yml");

    if (!rasaRootPath || !rasaDataPath) {
      throw new Error("RASA_PATH or RASA_DATA_PATH missing");
    }

    if (!fs.existsSync(rasaDataPath)) {
      fs.mkdirSync(rasaDataPath, { recursive: true });
    }

    log("📦 Generating YAML files...");

    /* =========================================
       GROUP DATA (🔥 PERFORMANCE FIX)
    ========================================= */

    const trainingMap = {};
    trainings.forEach(t => {
      const key = t.intentId.toString();
      if (!trainingMap[key]) trainingMap[key] = [];
      trainingMap[key].push(t);
    });

    const responseMap = {};
    responses.forEach(r => {
      const key = r.intentId.toString();
      if (!responseMap[key]) responseMap[key] = [];
      responseMap[key].push(r);
    });

    /* =========================================
       NLU
    ========================================= */

    let nlu = `version: "3.1"\nnlu:\n`;

    intents.forEach(intent => {
      const phrases = trainingMap[intent._id.toString()] || [];

      if (!phrases.length) return;

      nlu += `- intent: ${intent.name}\n  examples: |\n`;

      phrases.forEach(p => {
        const cleanText = (p.text || "").replace(/"/g, '\\"');
        if (cleanText.trim()) {
          nlu += `    - ${cleanText}\n`;
        }
      });
    });

    /* =========================================
       DOMAIN
    ========================================= */

    let domain = `version: "3.1"\n\nintents:\n`;

    intents.forEach(i => {
      domain += `  - ${i.name}\n`;
    });

    domain += `\nresponses:\n`;

    intents.forEach(intent => {
      const resList = responseMap[intent._id.toString()] || [];

      if (!resList.length) return;

      domain += `  utter_${intent.name}:\n`;

      resList.forEach(res => {
        const msgs = res.messages || [res.text]; // 🔥 FIXED

        msgs.forEach(msg => {
          const cleanMsg = (msg || "").replace(/"/g, '\\"');
          if (cleanMsg.trim()) {
            domain += `    - text: "${cleanMsg}"\n`;
          }
        });
      });
    });

    /* =========================================
       STORIES
    ========================================= */

    let stories = `version: "3.1"\nstories:\n`;

    intents.forEach(i => {
      stories += `
- story: ${i.name} path
  steps:
    - intent: ${i.name}
    - action: utter_${i.name}
`;
    });

    /* =========================================
       RULES
    ========================================= */

    const rules = `version: "3.1"
rules:
- rule: respond to greeting
  steps:
  - intent: greet
  - action: utter_greet
`;

    /* =========================================
       YAML VALIDATION (🔥 CRITICAL)
    ========================================= */

    YAML.parse(nlu);
    YAML.parse(domain);
    YAML.parse(stories);

    /* =========================================
       WRITE FILES
    ========================================= */

    fs.writeFileSync(path.join(rasaDataPath, "nlu.yml"), nlu);
    fs.writeFileSync(path.join(rasaDataPath, "stories.yml"), stories);
    fs.writeFileSync(path.join(rasaDataPath, "rules.yml"), rules);
    fs.writeFileSync(domainPath, domain);

    log("✅ YAML files generated successfully");

  } catch (error) {

    console.error("❌ YAML Generation Error:", error.message);

    throw error; // 🔥 IMPORTANT: don't swallow error
  }
};
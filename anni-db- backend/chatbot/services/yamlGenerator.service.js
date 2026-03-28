const fs = require("fs");
const path = require("path");

const Intent = require("../models/intent.model");
const Training = require("../models/trainingPhrase.model");
const Response = require("../models/response.model");

// 🔥 optional log integration
const trainingController = require("../controllers/training.controller");

exports.generateFiles = async (companyId) => {
  try {

    const addLog = (msg) => {
      if (trainingController?.addLog) {
        trainingController.addLog(msg);
      } else {
        console.log(msg);
      }
    };

    /* =========================================
       FETCH DATA
    ========================================= */

    const intents = await Intent.find({ companyId });
    const trainings = await Training.find({ companyId });
    const responses = await Response.find({ companyId });

    if (!intents.length) {
      addLog("⚠️ No intents found");
      return;
    }

    /* =========================================
       ✅ PATHS FROM ENV (IMPORTANT)
    ========================================= */

    const rasaRootPath = process.env.RASA_PATH;
    const rasaDataPath = process.env.RASA_DATA_PATH;
    const domainPath = path.join(rasaRootPath, "domain.yml");

    if (!rasaRootPath || !rasaDataPath) {
      throw new Error("RASA_PATH or RASA_DATA_PATH missing in .env");
    }

    // ensure folder exists
    if (!fs.existsSync(rasaDataPath)) {
      fs.mkdirSync(rasaDataPath, { recursive: true });
    }

    addLog("📦 Generating YAML files...");

    /* =========================================
       🔹 NLU
    ========================================= */

    let nlu = `version: "3.1"\nnlu:\n`;

    intents.forEach(intent => {

      const phrases = trainings.filter(
        t => t.intentId.toString() === intent._id.toString()
      );

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
       🔹 DOMAIN
    ========================================= */

    let domain = `version: "3.1"\n\nintents:\n`;

    intents.forEach(i => {
      domain += `  - ${i.name}\n`;
    });

    domain += `\nresponses:\n`;

    responses.forEach(res => {

      const intent = intents.find(
        i => i._id.toString() === res.intentId.toString()
      );

      if (!intent) return;

      domain += `  utter_${intent.name}:\n`;

      res.messages.forEach(msg => {
        const cleanMsg = (msg || "").replace(/"/g, '\\"');
        if (cleanMsg.trim()) {
          domain += `    - text: "${cleanMsg}"\n`;
        }
      });
    });

    /* =========================================
       🔹 STORIES
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
       🔹 OPTIONAL RULES (SMART ADDITION)
    ========================================= */

    const rules = `version: "3.1"
rules:
- rule: respond to greeting
  steps:
  - intent: greet
  - action: utter_greet
`;

    /* =========================================
       🔥 WRITE FILES
    ========================================= */

    fs.writeFileSync(path.join(rasaDataPath, "nlu.yml"), nlu);
    fs.writeFileSync(path.join(rasaDataPath, "stories.yml"), stories);
    fs.writeFileSync(path.join(rasaDataPath, "rules.yml"), rules);
    fs.writeFileSync(domainPath, domain);

    addLog("✅ YAML files generated successfully");

  } catch (error) {

    console.error("❌ YAML Generation Error:", error.message);

    if (trainingController?.addLog) {
      trainingController.addLog("❌ YAML generation failed");
      trainingController.addLog(error.message);
    }
  }
};
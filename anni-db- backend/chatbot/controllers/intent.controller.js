const mongoose = require("mongoose");
const Intent = require("../models/intent.model");
const Training = require("../models/trainingPhrase.model");
const Response = require("../models/response.model");

// ✅ ADD LOGGER
const { addLog } = require("../utils/logger");

/* =========================================
   VALIDATION HELPER
========================================= */
function validateIntentName(name) {
  const clean = name.trim().toLowerCase();

  if (!/^[a-z0-9_]+$/.test(clean)) {
    throw new Error("Intent name must be lowercase, no spaces, only letters, numbers, underscore");
  }

  return clean;
}

/* =========================================
   CREATE INTENT
========================================= */
exports.createIntent = async (data) => {
  try {

    if (!data.name || !data.companyId) {
      addLog("❌ Intent creation failed: missing fields");
      throw new Error("Intent name and companyId are required");
    }

    const cleanName = validateIntentName(data.name);

    const existing = await Intent.findOne({
      name: cleanName,
      companyId: data.companyId
    });

    if (existing) {
      addLog(`⚠️ Intent already exists: ${cleanName}`);
      throw new Error("Intent already exists");
    }

    const intent = await Intent.create({
      ...data,
      name: cleanName
    });

    addLog(`✅ Intent created: ${cleanName}`);

    return {
      success: true,
      data: intent
    };

  } catch (err) {
    console.error("❌ Create Intent Error:", err.message);
    addLog(`❌ Create Intent Error: ${err.message}`);
    throw err;
  }
};


/* =========================================
   GET ALL INTENTS
========================================= */
exports.getAllIntents = async (companyId) => {
  try {

    if (!companyId) {
      addLog("❌ Fetch intents failed: companyId missing");
      throw new Error("companyId is required");
    }

    const intents = await Intent.find({ companyId })
      .sort({ createdAt: -1 })
      .lean();

    addLog(`📦 Fetched ${intents.length} intents`);

    return {
      success: true,
      data: intents
    };

  } catch (err) {
    console.error("❌ Fetch Intents Error:", err.message);
    addLog(`❌ Fetch Intents Error: ${err.message}`);
    throw err;
  }
};


/* =========================================
   UPDATE INTENT
========================================= */
exports.updateIntent = async (id, data) => {
  try {

    if (!mongoose.Types.ObjectId.isValid(id)) {
      addLog("❌ Invalid intent ID on update");
      throw new Error("Invalid intent ID");
    }

    if (!data.name) {
      addLog("❌ Update failed: name missing");
      throw new Error("Intent name is required");
    }

    const cleanName = validateIntentName(data.name);

    const intent = await Intent.findById(id);

    if (!intent) {
      addLog("❌ Intent not found for update");
      throw new Error("Intent not found");
    }

    const duplicate = await Intent.findOne({
      name: cleanName,
      companyId: intent.companyId,
      _id: { $ne: id }
    });

    if (duplicate) {
      addLog(`⚠️ Duplicate intent name on update: ${cleanName}`);
      throw new Error("Another intent with this name already exists");
    }

    intent.name = cleanName;
    await intent.save();

    addLog(`✏️ Intent updated: ${cleanName}`);

    return {
      success: true,
      data: intent
    };

  } catch (err) {
    console.error("❌ Update Intent Error:", err.message);
    addLog(`❌ Update Intent Error: ${err.message}`);
    throw err;
  }
};


/* =========================================
   DELETE INTENT (WITH TRANSACTION)
========================================= */
exports.deleteIntent = async (id) => {
  const session = await mongoose.startSession();

  try {

    if (!mongoose.Types.ObjectId.isValid(id)) {
      addLog("❌ Invalid intent ID on delete");
      throw new Error("Invalid intent ID");
    }

    session.startTransaction();

    const intent = await Intent.findById(id).session(session);

    if (!intent) {
      addLog("❌ Intent not found for delete");
      throw new Error("Intent not found");
    }

    // 🔥 CASCADE DELETE
    await Training.deleteMany({ intentId: id }).session(session);
    await Response.deleteMany({ intentId: id }).session(session);
    await Intent.findByIdAndDelete(id).session(session);

    await session.commitTransaction();
    session.endSession();

    addLog(`🗑️ Intent deleted: ${intent.name}`);

    return {
      success: true,
      message: "Intent and related data deleted"
    };

  } catch (err) {

    await session.abortTransaction();
    session.endSession();

    console.error("❌ Delete Intent Error:", err.message);
    addLog(`❌ Delete Intent Error: ${err.message}`);

    throw err;
  }
};
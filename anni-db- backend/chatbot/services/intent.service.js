const mongoose = require("mongoose");
const Intent = require("../models/intent.model");
const Training = require("../models/trainingPhrase.model");
const Response = require("../models/response.model");

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
      throw new Error("Intent name and companyId are required");
    }

    const cleanName = validateIntentName(data.name);

    const existing = await Intent.findOne({
      name: cleanName,
      companyId: data.companyId
    });

    if (existing) {
      throw new Error("Intent already exists");
    }

    const intent = await Intent.create({
      ...data,
      name: cleanName
    });

    return {
      success: true,
      data: intent
    };

  } catch (err) {
    console.error("❌ Create Intent Error:", err.message);
    throw err;
  }
};


/* =========================================
   GET ALL INTENTS
========================================= */
exports.getAllIntents = async (companyId) => {
  try {

    if (!companyId) {
      throw new Error("companyId is required");
    }

    const intents = await Intent.find({ companyId })
      .sort({ createdAt: -1 })
      .lean(); // 🔥 faster

    return {
      success: true,
      data: intents
    };

  } catch (err) {
    console.error("❌ Fetch Intents Error:", err.message);
    throw err;
  }
};


/* =========================================
   DELETE INTENT (CASCADE + SAFE)
========================================= */
exports.deleteIntent = async (id) => {
  const session = await mongoose.startSession();

  try {

    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new Error("Invalid intent ID");
    }

    session.startTransaction();

    const intent = await Intent.findById(id).session(session);

    if (!intent) {
      throw new Error("Intent not found");
    }

    // 🔥 CASCADE DELETE
    await Training.deleteMany({ intentId: id }).session(session);
    await Response.deleteMany({ intentId: id }).session(session);
    await Intent.findByIdAndDelete(id).session(session);

    await session.commitTransaction();
    session.endSession();

    return {
      success: true,
      message: "Intent and related data deleted"
    };

  } catch (err) {

    await session.abortTransaction();
    session.endSession();

    console.error("❌ Delete Intent Error:", err.message);
    throw err;
  }
};
const mongoose = require("mongoose");
const Intent = require("../models/intent.model");
const Training = require("../models/trainingPhrase.model");
const Response = require("../models/response.model");

/* =========================================
   CREATE INTENT
========================================= */
exports.createIntent = async (data) => {
  try {

    if (!data.name || !data.companyId) {
      throw new Error("Intent name and companyId are required");
    }

    const cleanName = data.name.trim().toLowerCase();

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
      .sort({ createdAt: -1 });

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
   UPDATE INTENT
========================================= */
exports.updateIntent = async (id, data) => {
  try {

    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new Error("Invalid intent ID");
    }

    if (!data.name) {
      throw new Error("Intent name is required");
    }

    const cleanName = data.name.trim().toLowerCase();

    const intent = await Intent.findById(id);

    if (!intent) {
      throw new Error("Intent not found");
    }

    // 🚫 Prevent duplicate rename
    const duplicate = await Intent.findOne({
      name: cleanName,
      companyId: intent.companyId,
      _id: { $ne: id }
    });

    if (duplicate) {
      throw new Error("Another intent with this name already exists");
    }

    intent.name = cleanName;
    await intent.save();

    return {
      success: true,
      data: intent
    };

  } catch (err) {
    console.error("❌ Update Intent Error:", err.message);
    throw err;
  }
};


/* =========================================
   DELETE INTENT (WITH CASCADE CLEANUP)
========================================= */
exports.deleteIntent = async (id) => {
  try {

    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new Error("Invalid intent ID");
    }

    const intent = await Intent.findById(id);

    if (!intent) {
      throw new Error("Intent not found");
    }

    // 🔥 CASCADE DELETE (VERY IMPORTANT)
    await Training.deleteMany({ intentId: id });
    await Response.deleteMany({ intentId: id });

    await Intent.findByIdAndDelete(id);

    return {
      success: true,
      message: "Intent and related data deleted"
    };

  } catch (err) {
    console.error("❌ Delete Intent Error:", err.message);
    throw err;
  }
};
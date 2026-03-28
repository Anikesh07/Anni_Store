const Intent = require("../models/intent.model");

/* =========================================
   CREATE INTENT
========================================= */
exports.createIntent = async (data) => {
  try {

    if (!data.name || !data.companyId) {
      throw new Error("Intent name and companyId are required");
    }

    const cleanName = data.name.trim().toLowerCase();

    // 🚫 Prevent duplicates
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

    return intent;

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

    return await Intent.find({ companyId }).sort({ createdAt: -1 });

  } catch (err) {
    console.error("❌ Fetch Intents Error:", err.message);
    throw err;
  }
};


/* =========================================
   DELETE INTENT
========================================= */
exports.deleteIntent = async (id) => {
  try {

    const intent = await Intent.findById(id);

    if (!intent) {
      throw new Error("Intent not found");
    }

    await Intent.findByIdAndDelete(id);

    return { message: "Intent deleted successfully" };

  } catch (err) {
    console.error("❌ Delete Intent Error:", err.message);
    throw err;
  }
};
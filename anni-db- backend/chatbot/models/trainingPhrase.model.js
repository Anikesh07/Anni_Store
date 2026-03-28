const mongoose = require("mongoose");

const trainingSchema = new mongoose.Schema({
  intentId: { type: mongoose.Schema.Types.ObjectId, ref: "Intent" },
  text: String,
  companyId: String
});

module.exports = mongoose.model("TrainingPhrase", trainingSchema);
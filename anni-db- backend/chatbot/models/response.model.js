const mongoose = require("mongoose");

const responseSchema = new mongoose.Schema({
  intentId: { type: mongoose.Schema.Types.ObjectId, ref: "Intent" },
  messages: [String],
  companyId: String
});

module.exports = mongoose.model("Response", responseSchema);
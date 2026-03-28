const mongoose = require("mongoose");

const intentSchema = new mongoose.Schema({
  name: { type: String, required: true },
  companyId: { type: String },
}, { timestamps: true });

module.exports = mongoose.model("Intent", intentSchema);
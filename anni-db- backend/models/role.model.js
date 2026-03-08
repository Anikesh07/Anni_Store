const mongoose = require("mongoose");

const roleSchema = new mongoose.Schema({

  name: {
    type: String,
    required: true
  },

  companyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Company",
    default: null
  },

  permissions: [String]

}, { timestamps: true });

module.exports = mongoose.model("Role", roleSchema);
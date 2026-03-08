const mongoose = require("mongoose");

const changeSchema = new mongoose.Schema(
  {
    field: {
      type: String,
      required: true
    },
    oldValue: mongoose.Schema.Types.Mixed,
    newValue: mongoose.Schema.Types.Mixed
  },
  { _id: false }
);

const auditLogSchema = new mongoose.Schema(
  {
    companyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Company",
      required: true,
      index: true
    },

    performedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },

    actionType: {
      type: String,
      required: true
    },

    targetType: {
      type: String,
      enum: ["EMPLOYEE", "USER", "DEPARTMENT", "SALARY", "STATUS"],
      required: true
    },

    targetId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true
    },

    changes: [changeSchema],

    ipAddress: String,
    userAgent: String
  },
  { timestamps: true }
);

module.exports = mongoose.model("AuditLog", auditLogSchema);
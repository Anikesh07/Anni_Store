const mongoose = require("mongoose");

/* =========================================
   LEAVE SCHEMA
========================================= */

const leaveSchema = new mongoose.Schema(
{
  /* ================= COMPANY ================= */

  companyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Company",
    required: true,
    index: true
  },

  /* ================= EMPLOYEE ================= */

  employeeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Employee",
    required: true
  },

  /* ================= MANAGER (APPROVER) ================= */

  managerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Employee",
    required: true
  },

  /* ================= LEAVE DETAILS ================= */

  type: {
    type: String,
    enum: ["CASUAL", "SICK", "EARNED", "UNPAID"],
    required: true
  },

  startDate: {
    type: Date,
    required: true
  },

  endDate: {
    type: Date,
    required: true
  },

  days: {
    type: Number,
    required: true
  },

  reason: String,

  /* ================= STATUS ================= */

  status: {
    type: String,
    enum: ["PENDING", "APPROVED", "REJECTED"],
    default: "PENDING",
    index: true
  },

  /* ================= REVIEW ================= */

  reviewedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Employee",
    default: null
  },

  reviewedAt: {
    type: Date,
    default: null
  }

},
{ timestamps: true }
);

/* =========================================
   INDEXES (FOR PERFORMANCE)
========================================= */

leaveSchema.index({ companyId: 1 });
leaveSchema.index({ companyId: 1, employeeId: 1 });
leaveSchema.index({ companyId: 1, managerId: 1 });
leaveSchema.index({ companyId: 1, status: 1 });

module.exports = mongoose.model("Leave", leaveSchema);
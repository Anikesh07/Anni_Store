const mongoose = require("mongoose");

/* =========================================
   ATTENDANCE SCHEMA
========================================= */

const attendanceSchema = new mongoose.Schema(
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

  /* ================= DATE ================= */

  date: {
    type: Date,
    required: true
  },

  /* ================= CLOCK TIMES ================= */

  clockIn: {
    type: Date,
    default: null
  },

  clockOut: {
    type: Date,
    default: null
  },

  /* ================= WORK HOURS ================= */

  workingHours: {
    type: Number,
    default: 0
  },

  /* ================= STATUS ================= */

  status: {
    type: String,
    enum: ["PRESENT", "LATE", "HALF_DAY", "ABSENT", "LEAVE"],
    default: "PRESENT",
    index: true
  },

  /* ================= OPTIONAL NOTE ================= */

  note: {
    type: String,
    default: null
  }

},
{ timestamps: true }
);

/* =========================================
   INDEXES
========================================= */

/* Prevent duplicate attendance for same day */
attendanceSchema.index(
  { companyId: 1, employeeId: 1, date: 1 },
  { unique: true }
);

/* Faster analytics queries */
attendanceSchema.index({ companyId: 1, date: 1 });
attendanceSchema.index({ companyId: 1, employeeId: 1 });

module.exports = mongoose.model("Attendance", attendanceSchema);
const mongoose = require("mongoose");

const companySettingsSchema = new mongoose.Schema(
  {
    companyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Company",
      required: true,
      unique: true
    },

    defaultLeaveBalance: {
      type: Number,
      default: 20
    },

    workingDaysPerWeek: {
      type: Number,
      enum: [5, 6, 7],
      default: 5
    },

    payrollCycle: {
      type: String,
      enum: ["MONTHLY", "BIWEEKLY"],
      default: "MONTHLY"
    },

    timezone: {
      type: String,
      default: "Asia/Kolkata"
    },

    fiscalYearStartMonth: {
      type: Number,
      min: 1,
      max: 12,
      default: 4
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("CompanySettings", companySettingsSchema);
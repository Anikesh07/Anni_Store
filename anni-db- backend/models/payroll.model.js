const mongoose = require("mongoose");

const payrollSchema = new mongoose.Schema(
{
  companyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Company",
    required: true,
    index: true
  },

  employeeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Employee",
    required: true
  },

  month: {
    type: Number,
    required: true
  },

  year: {
    type: Number,
    required: true
  },

  baseSalary: {
    type: Number,
    required: true
  },

  bonus: {
    type: Number,
    default: 0
  },

  deductions: {
    type: Number,
    default: 0
  },

  netSalary: {
    type: Number,
    required: true
  },

  status: {
    type: String,
    enum: ["PENDING", "PAID"],
    default: "PENDING"
  }

},
{ timestamps: true }
);

payrollSchema.index({ companyId: 1, employeeId: 1, month: 1, year: 1 });

module.exports = mongoose.model("Payroll", payrollSchema);
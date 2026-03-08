const mongoose = require("mongoose");

const departmentSchema = new mongoose.Schema(
  {
    companyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Company",
      required: true,
      index: true
    },

    name: {
      type: String,
      required: true,
      trim: true
    },

    parentDepartmentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Department",
      default: null
    },

    managerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Employee",
      default: null
    },

    isActive: {
      type: Boolean,
      default: true,
      index: true
    }
  },
  { timestamps: true }
);

/* Prevent duplicate department names inside same company under same parent */
departmentSchema.index(
  { companyId: 1, parentDepartmentId: 1, name: 1 },
  { unique: true }
);

module.exports = mongoose.model("Department", departmentSchema);
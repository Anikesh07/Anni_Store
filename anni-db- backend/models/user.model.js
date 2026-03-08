const mongoose = require("mongoose");

const otpSchema = new mongoose.Schema(
  {
    code: String,
    expiresAt: Date
  },
  { _id: false }
);

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true
    },

    password: {
      type: String
    },

    role: {
      type: String,
      enum: ["SUPER_ADMIN", "COMPANY_OWNER", "HR", "MANAGER", "EMPLOYEE"],
      required: true
    },

    companyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Company",
      default: null
    },

    employeeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Employee",
      default: null
    },

    accountStatus: {
      type: String,
      enum: ["INVITED", "ACTIVE", "SUSPENDED"],
      default: "INVITED"
    },

    otp: otpSchema
  },
  { timestamps: true }
);

/* Unique email per company */
userSchema.index({ companyId: 1, email: 1 }, { unique: true });

/* =========================================
   VALIDATION LOGIC
========================================= */
userSchema.pre("validate", function (next) {
  if (this.role === "SUPER_ADMIN") {
    this.companyId = null;
    this.employeeId = null;
  } else {
    if (!this.companyId || !this.employeeId) {
      return next(
        new Error(
          "companyId and employeeId are required for non-super admin users"
        )
      );
    }
  }
  next();
});

module.exports = mongoose.model("User", userSchema);
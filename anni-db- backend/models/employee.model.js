const mongoose = require("mongoose");

/* =========================================
   SALARY HISTORY SUB-SCHEMA
========================================= */

const salaryHistorySchema = new mongoose.Schema({
  baseSalary: {
    type: Number,
    default: 0
  },

  bonus: {
    type: Number,
    default: 0
  },

  medicalAllowance: {
    type: Number,
    default: 0
  },

  updatedAt: {
    type: Date,
    default: Date.now,
    index: true
  }

}, { _id: false });


/* =========================================
   MAIN EMPLOYEE SCHEMA
========================================= */

const employeeSchema = new mongoose.Schema({

  /* ================= COMPANY ================= */

  companyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Company",
    required: true,
    index: true
  },

  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    default: null
  },


  /* ================= PERSONAL ================= */

  personal: {

    name: {
      type: String,
      required: true,
      trim: true
    },

    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
      index: true
    },

    phone: {
      type: String,
      default: ""
    },

    address: {
      type: String,
      default: ""
    }

  },


  /* ================= PROFESSIONAL ================= */

  professional: {

    departmentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Department",
      default: null
    },

    /* reporting manager (org hierarchy) */

    reportingManagerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Employee",
      default: null
    },

    employmentType: {
      type: String,
      enum: ["FULL_TIME", "PART_TIME", "CONTRACT", "TRAINEE"],
      default: "TRAINEE"
    },

    experienceLevel: {
      type: String,
      enum: ["JUNIOR", "MID", "SENIOR", "LEAD"],
      default: "JUNIOR"
    },

    joiningDate: {
      type: Date,
      default: Date.now
    }

  },


  /* ================= EMPLOYMENT LIFECYCLE ================= */

  employmentStatus: {
    type: String,
    enum: ["INVITED", "ACTIVE", "TERMINATED", "BLACKLISTED"],
    default: "INVITED",
    index: true
  },

  hiredAt: Date,

  terminatedAt: Date,

  blacklistReason: String,


  /* ================= SALARY ================= */

  salary: {

    baseSalary: {
      type: Number,
      default: 0
    },

    bonus: {
      type: Number,
      default: 0
    },

    medicalAllowance: {
      type: Number,
      default: 0
    },

    salaryHistory: [salaryHistorySchema]

  },


  /* ================= LEAVE ================= */

  leaveBalance: {

    total: {
      type: Number,
      default: 20
    },

    used: {
      type: Number,
      default: 0
    },

    remaining: {
      type: Number,
      default: 20
    }

  }

}, { timestamps: true });


/* =========================================
   AUTO CALCULATE REMAINING LEAVE
========================================= */

employeeSchema.pre("save", function (next) {

  if (this.leaveBalance) {

    const total = this.leaveBalance.total || 0;
    const used = this.leaveBalance.used || 0;

    this.leaveBalance.remaining = Math.max(total - used, 0);

  }

  next();

});


/* =========================================
   INDEXES (PERFORMANCE)
========================================= */

/* Unique employee email inside company */

employeeSchema.index(
  { companyId: 1, "personal.email": 1 },
  { unique: true, sparse: true }
);

/* Department queries */

employeeSchema.index({
  companyId: 1,
  "professional.departmentId": 1
});

/* Manager hierarchy queries */

employeeSchema.index({
  companyId: 1,
  "professional.reportingManagerId": 1
});

/* Employment status filtering */

employeeSchema.index({
  companyId: 1,
  employmentStatus: 1
});


module.exports = mongoose.model("Employee", employeeSchema);
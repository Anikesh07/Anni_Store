const express = require("express");
const router = express.Router();

const { protect, checkPermission } = require("../services/permission.middleware");
const payrollController = require("../controllers/payroll.controller");

/* ==========================================
   HR: GENERATE PAYROLL
========================================== */
router.post(
  "/generate",
  protect,
  checkPermission("PAYROLL_PROCESS"),
  payrollController.generatePayroll
);

/* ==========================================
   HR: MARK SALARY AS PAID
========================================== */
router.put(
  "/pay/:id",
  protect,
  checkPermission("PAYROLL_PROCESS"),
  payrollController.markPaid
);

/* ==========================================
   EMPLOYEE: VIEW MY PAYSLIPS
========================================== */
router.get(
  "/my",
  protect,
  checkPermission("SELF_PAYROLL"), // or PAYROLL_VIEW if you want simpler
  payrollController.getMyPayroll
);

/* ==========================================
   HR / OWNER: VIEW COMPANY PAYROLL
========================================== */
router.get(
  "/company",
  protect,
  checkPermission("PAYROLL_VIEW"),
  payrollController.getCompanyPayroll
);

module.exports = router;
const express = require("express");
const router = express.Router();

const { protect, allowRoles } = require("../services/permission.middleware");
const payrollController = require("../controllers/payroll.controller");

/* HR GENERATE PAYROLL */

router.post(
"/generate",
protect,
allowRoles("HR","COMPANY_OWNER"),
payrollController.generatePayroll
);

/* MARK AS PAID */

router.put(
"/pay/:id",
protect,
allowRoles("HR","COMPANY_OWNER"),
payrollController.markPaid
);

/* EMPLOYEE VIEW PAYSLIPS */

router.get(
"/my",
protect,
payrollController.getMyPayroll
);

/* HR VIEW COMPANY PAYROLL */

router.get(
"/company",
protect,
allowRoles("HR","COMPANY_OWNER"),
payrollController.getCompanyPayroll
);

module.exports = router;
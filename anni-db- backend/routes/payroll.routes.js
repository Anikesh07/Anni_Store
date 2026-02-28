const express = require("express");
const router = express.Router();

const { protect, allowRoles } = require("../services/permission.middleware");
const payrollController = require("../controllers/payroll.controller");

router.get(
  "/monthly/:id",
  protect,
  allowRoles("HR", "CEO"),
  payrollController.getMonthlyPayroll
);

module.exports = router;

router.get(
  "/monthly-summary",
  protect,
  allowRoles("HR", "CEO"),
  payrollController.getMonthlySummary
);

exports.overridePayroll = async (req, res) => {
  try {
    const { year, month, adjustedSalary, reason } = req.body;

    const employee = await Employee.findById(req.params.id);

    if (!employee) {
      return res.status(404).json({ message: "Employee not found" });
    }

    employee.payrollOverride = {
      year,
      month,
      adjustedSalary,
      reason
    };

    await employee.save();

    res.json({
      message: "Payroll overridden successfully",
      override: employee.payrollOverride
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
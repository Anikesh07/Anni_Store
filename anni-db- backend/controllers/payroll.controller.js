const Attendance = require("../models/attendance.model");
const Leave = require("../models/leave.model");
const Employee = require("../models/employee.model");

/* ======================================================
   GENERATE PAYROLL FOR ONE EMPLOYEE
====================================================== */

exports.generatePayroll = async (req, res) => {
  try {

    const { year, month } = req.body;
    const employeeId = req.body.employeeId;

    if (!year || !month || !employeeId) {
      return res.status(400).json({
        message: "employeeId, year and month are required"
      });
    }

    const employee = await Employee.findById(employeeId);

    if (!employee) {
      return res.status(404).json({
        message: "Employee not found"
      });
    }

    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0);

    /* WORKING DAYS */
    let workingDays = 0;
    let current = new Date(startDate);

    while (current <= endDate) {
      const day = current.getDay();
      if (day !== 0 && day !== 6) workingDays++;
      current.setDate(current.getDate() + 1);
    }

    const attendanceRecords = await Attendance.find({
      employee: employee._id,
      date: { $gte: startDate, $lte: endDate }
    });

    const approvedLeaves = await Leave.find({
      employee: employee._id,
      status: "APPROVED",
      startDate: { $gte: startDate, $lte: endDate }
    });

    const baseSalary = employee.salary.baseSalary;
    const dailySalary = workingDays ? baseSalary / workingDays : 0;

    let presentDays = 0;
    let halfDays = 0;

    attendanceRecords.forEach(record => {

      if (record.status === "PRESENT" || record.status === "LATE")
        presentDays++;

      if (record.status === "HALF_DAY")
        halfDays++;

    });

    const leaveDays = approvedLeaves.length;

    const absentDays =
      workingDays - presentDays - halfDays - leaveDays;

    const deductions =
      (absentDays * dailySalary) +
      (halfDays * dailySalary * 0.5);

    const finalSalary = baseSalary - deductions;

    res.json({
      employeeId,
      baseSalary,
      workingDays,
      presentDays,
      halfDays,
      leaveDays,
      absentDays,
      deductions: Number(deductions.toFixed(2)),
      finalSalary: Number(finalSalary.toFixed(2))
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/* ======================================================
   MARK PAYROLL AS PAID
====================================================== */

exports.markPaid = async (req, res) => {
  try {

    const employee = await Employee.findById(req.params.id);

    if (!employee) {
      return res.status(404).json({
        message: "Employee not found"
      });
    }

    employee.lastSalaryPaidAt = new Date();

    await employee.save();

    res.json({
      message: "Payroll marked as paid"
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/* ======================================================
   EMPLOYEE VIEW OWN PAYROLL
====================================================== */

exports.getMyPayroll = async (req, res) => {
  try {

    const employee = await Employee.findOne({
      userId: req.user.userId
    });

    if (!employee) {
      return res.status(404).json({
        message: "Employee profile not found"
      });
    }

    res.json({
      employeeId: employee._id,
      baseSalary: employee.salary.baseSalary,
      bonus: employee.salary.bonus,
      medicalAllowance: employee.salary.medicalAllowance
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/* ======================================================
   COMPANY PAYROLL SUMMARY
====================================================== */

exports.getCompanyPayroll = async (req, res) => {
  try {

    const employees = await Employee.find({
      companyId: req.user.companyId
    });

    const result = employees.map(emp => ({
      id: emp._id,
      name: emp.personal.name,
      baseSalary: emp.salary.baseSalary
    }));

    res.json(result);

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
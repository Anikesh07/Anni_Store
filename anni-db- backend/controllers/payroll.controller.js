const Attendance = require("../models/attendance.model");
const Leave = require("../models/leave.model");
const Employee = require("../models/employee.model");

exports.getMonthlyPayroll = async (req, res) => {
  try {
    const { year, month } = req.query;

    if (!year || !month) {
      return res.status(400).json({ message: "Year and month required" });
    }

    const employee = await Employee.findById(req.params.id);

    if (!employee) {
      return res.status(404).json({ message: "Employee not found" });
    }

    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0);

    const today = new Date();

    // 🚀 Adjust endDate if month is current month
    if (
      year == today.getFullYear() &&
      month - 1 == today.getMonth()
    ) {
      endDate.setDate(today.getDate());
    }

    // 🚀 Respect joining date
    const joiningDate = new Date(employee.professional.joiningDate);
    if (joiningDate > startDate) {
      startDate.setTime(joiningDate.getTime());
    }

    // 🚀 Calculate working days dynamically (Mon–Fri)
    let workingDays = 0;
    let current = new Date(startDate);

    while (current <= endDate) {
      const day = current.getDay();
      if (day !== 0 && day !== 6) {
        workingDays++;
      }
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
    const dailySalary = baseSalary / workingDays;

    let presentDays = 0;
    let halfDays = 0;

    attendanceRecords.forEach(record => {
      if (record.status === "PRESENT" || record.status === "LATE") {
        presentDays++;
      }
      if (record.status === "HALF_DAY") {
        halfDays++;
      }
    });

    const leaveDays = approvedLeaves.length;

    const absentDays =
      workingDays - presentDays - halfDays - leaveDays;

    const deductions =
      (absentDays * dailySalary) +
      (halfDays * dailySalary * 0.5);

    const finalSalary = baseSalary - deductions;

    res.json({
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

exports.getMonthlySummary = async (req, res) => {
  try {
    const { year, month } = req.query;

    if (!year || !month) {
      return res.status(400).json({ message: "Year and month required" });
    }

    const employees = await Employee.find({ isActive: true });

    let totalBaseSalary = 0;
    let totalDeductions = 0;
    let totalPayout = 0;

    const results = [];

    for (const emp of employees) {

      const startDate = new Date(year, month - 1, 1);
      const endDate = new Date(year, month, 0);

      let workingDays = 0;
      let current = new Date(startDate);

      while (current <= endDate) {
        const day = current.getDay();
        if (day !== 0 && day !== 6) workingDays++;
        current.setDate(current.getDate() + 1);
      }

      const attendance = await Attendance.find({
        employee: emp._id,
        date: { $gte: startDate, $lte: endDate }
      });

      const approvedLeaves = await Leave.find({
        employee: emp._id,
        status: "APPROVED",
        startDate: { $gte: startDate, $lte: endDate }
      });

      let present = 0;
      let half = 0;

      attendance.forEach(r => {
        if (r.status === "PRESENT" || r.status === "LATE") present++;
        if (r.status === "HALF_DAY") half++;
      });

      const leaveDays = approvedLeaves.length;

      const baseSalary = emp.salary.baseSalary;
      const dailySalary = workingDays > 0 ? baseSalary / workingDays : 0;

      const absent = workingDays - present - half - leaveDays;

      const deductions =
        (absent * dailySalary) +
        (half * dailySalary * 0.5);

      const finalSalary = baseSalary - deductions;

      totalBaseSalary += baseSalary;
      totalDeductions += deductions;
      totalPayout += finalSalary;

      results.push({
        employeeId: emp._id,
        name: emp.personal.name,
        baseSalary,
        finalSalary: Number(finalSalary.toFixed(2))
      });
    }

    res.json({
      year,
      month,
      totalEmployees: employees.length,
      totalBaseSalary: Number(totalBaseSalary.toFixed(2)),
      totalDeductions: Number(totalDeductions.toFixed(2)),
      totalPayout: Number(totalPayout.toFixed(2)),
      employees: results
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


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
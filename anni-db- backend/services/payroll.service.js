const Payroll = require("../models/payroll.model");
const Employee = require("../models/employee.model");
const auditService = require("./audit.service");

/* GENERATE PAYROLL */

exports.generatePayroll = async (authUser, data) => {

  const employee = await Employee.findOne({
    _id: data.employeeId,
    companyId: authUser.companyId
  });

  if (!employee) throw new Error("Employee not found");

  const baseSalary = employee.salary.baseSalary;

  const bonus = data.bonus || 0;
  const deductions = data.deductions || 0;

  const netSalary = baseSalary + bonus - deductions;

  const payroll = await Payroll.create({
    companyId: authUser.companyId,
    employeeId: employee._id,
    month: data.month,
    year: data.year,
    baseSalary,
    bonus,
    deductions,
    netSalary
  });

  await auditService.logAction({
    userId: authUser.userId,
    companyId: authUser.companyId,
    action: "PAYROLL_GENERATED",
    targetType: "Payroll",
    targetId: payroll._id
  });

  return payroll;
};


/* MARK AS PAID */

exports.markPaid = async (authUser, payrollId) => {

  const payroll = await Payroll.findOne({
    _id: payrollId,
    companyId: authUser.companyId
  });

  if (!payroll) throw new Error("Payroll record not found");

  payroll.status = "PAID";

  await payroll.save();

  await auditService.logAction({
    userId: authUser.userId,
    companyId: authUser.companyId,
    action: "PAYROLL_PAID",
    targetType: "Payroll",
    targetId: payroll._id
  });

  return payroll;
};


/* EMPLOYEE VIEW PAYSLIPS */

exports.getMyPayroll = async (authUser) => {

  const employee = await Employee.findOne({
    userId: authUser.userId,
    companyId: authUser.companyId
  });

  return Payroll.find({
    companyId: authUser.companyId,
    employeeId: employee._id
  }).sort({ year: -1, month: -1 });

};


/* HR VIEW COMPANY PAYROLL */

exports.getCompanyPayroll = async (authUser) => {

  return Payroll.find({
    companyId: authUser.companyId
  })
  .populate("employeeId")
  .sort({ year: -1, month: -1 });

};
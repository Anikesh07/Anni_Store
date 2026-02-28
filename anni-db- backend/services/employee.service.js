const Employee = require("../models/employee.model");

/* ==========================================
   CREATE EMPLOYEE
========================================== */
exports.createEmployee = async (data) => {

  const existing = await Employee.findOne({
    "personal.email": data.personal.email
  });

  if (existing) {
    throw new Error("Employee already exists");
  }

  const employee = await Employee.create({
    personal: data.personal,
    professional: {
      role: data.professional?.role || "TRAINEE",
      skills: data.professional?.skills || []
    },
    isRegistered: false,
    isActive: true
  });

  return employee;
};

/* ==========================================
   GET ALL EMPLOYEES
========================================== */
exports.getAllEmployees = async () => {
  return await Employee.find().select("-password -otp");
};

/* ==========================================
   UPDATE ROLE
========================================== */
exports.updateRole = async (id, newRole) => {

  const employee = await Employee.findById(id);

  if (!employee) throw new Error("Employee not found");

  employee.professional.role = newRole;

  await employee.save();

  return employee;
};

/* ==========================================
   TOGGLE ACTIVE STATUS
========================================== */
exports.toggleStatus = async (id) => {

  const employee = await Employee.findById(id);

  if (!employee) throw new Error("Employee not found");

  employee.isActive = !employee.isActive;

  await employee.save();

  return employee;
};


exports.updateSalary = async (id, salaryData) => {

  const employee = await Employee.findById(id);
  if (!employee) throw new Error("Employee not found");

  // Save current salary to history
  employee.salary.salaryHistory.push({
    baseSalary: employee.salary.baseSalary,
    bonus: employee.salary.bonus,
    medicalAllowance: employee.salary.medicalAllowance
  });

  // Update salary
  employee.salary.baseSalary = salaryData.baseSalary;
  employee.salary.bonus = salaryData.bonus;
  employee.salary.medicalAllowance = salaryData.medicalAllowance;

  await employee.save();

  return employee;
};
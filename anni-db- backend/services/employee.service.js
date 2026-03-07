const Employee = require("../models/employee.model");
const User = require("../models/user.model");
const auditService = require("./audit.service");


/* ==========================================
   CREATE EMPLOYEE (INVITED)
========================================== */
exports.createEmployee = async (authUser, data) => {
  console.log("AUTH USER:", authUser);
  console.log("EMPLOYEE DATA:", data);

  const companyId = authUser.companyId;

  /* ==============================
     VALIDATION
  ============================== */

  if (!data.name) {
    throw new Error("Employee name is required");
  }

  if (!data.email) {
    throw new Error("Employee email is required");
  }

  const email = data.email.toLowerCase();


  /* ==============================
     CHECK EXISTING USER
  ============================== */

  const existingUser = await User.findOne({
    companyId,
    email
  });

  if (existingUser) {
    throw new Error("User with this email already exists");
  }


  /* ==============================
     CREATE EMPLOYEE PROFILE
  ============================== */

  const employee = await Employee.create({
    companyId,
    personal: {
      name: data.name,
      email: email,
      phone: data.phone || "",
      address: data.address || ""
    },
    professional: {
      departmentId: data.departmentId || null,
      employmentType: data.employmentType || "TRAINEE",
      experienceLevel: data.experienceLevel || "JUNIOR"
    },
    employmentStatus: "INVITED"
  });


  /* ==============================
     CREATE USER ACCOUNT
  ============================== */

  const user = await User.create({
    email,
    role: data.role || "EMPLOYEE",
    companyId,
    employeeId: employee._id,
    accountStatus: "INVITED"
  });


  /* ==============================
     LINK EMPLOYEE → USER
  ============================== */

  employee.userId = user._id;
  await employee.save();


  /* ==============================
     AUDIT LOG
  ============================== */

  await auditService.logAction({
    userId: authUser.userId,
    companyId,
    action: "EMPLOYEE_CREATED",
    targetType: "Employee",
    targetId: employee._id,
    meta: {
      email,
      role: user.role
    }
  });


  /* ==============================
     RESPONSE
  ============================== */

  return {
    message: "Employee invited successfully",
    employee,
    user
  };

};

/* ==========================================
   UPDATE EMPLOYEE
========================================== */
exports.updateEmployee = async (authUser, id, body) => {

  const employee = await Employee.findOne({
    _id: id,
    companyId: authUser.companyId
  });

  if (!employee) {
    throw new Error("Employee not found");
  }

  const changes = {};

  /* PERSONAL */
  if (body.personal) {

    if (body.personal.name !== undefined) {
      employee.personal.name = body.personal.name;
      changes.name = body.personal.name;
    }

    if (body.personal.phone !== undefined) {
      employee.personal.phone = body.personal.phone;
      changes.phone = body.personal.phone;
    }

    if (body.personal.address !== undefined) {
      employee.personal.address = body.personal.address;
      changes.address = body.personal.address;
    }
  }

  /* PROFESSIONAL */
  if (body.professional) {

    if (body.professional.departmentId !== undefined) {
      employee.professional.departmentId = body.professional.departmentId;
      changes.departmentId = body.professional.departmentId;
    }

    if (body.professional.employmentType !== undefined) {
      employee.professional.employmentType = body.professional.employmentType;
      changes.employmentType = body.professional.employmentType;
    }

    if (body.professional.experienceLevel !== undefined) {
      employee.professional.experienceLevel = body.professional.experienceLevel;
      changes.experienceLevel = body.professional.experienceLevel;
    }
  }

  await employee.save();

  /* Audit */
  await auditService.logAction({
    userId: authUser.userId,
    companyId: authUser.companyId,
    action: "EMPLOYEE_UPDATED",
    targetType: "Employee",
    targetId: employee._id,
    changes
  });

  return employee;
};


/* ==========================================
   HIRE EMPLOYEE
========================================== */
exports.hireEmployee = async (authUser, id) => {

  const employee = await Employee.findOne({
    _id: id,
    companyId: authUser.companyId
  });

  if (!employee) throw new Error("Employee not found");

  employee.employmentStatus = "ACTIVE";
  employee.hiredAt = new Date();
  employee.terminatedAt = null;
  employee.blacklistReason = null;

  await employee.save();

  await auditService.logAction({
    userId: authUser.userId,
    companyId: authUser.companyId,
    action: "EMPLOYEE_HIRED",
    targetType: "Employee",
    targetId: employee._id
  });

  return employee;
};


/* ==========================================
   TERMINATE EMPLOYEE
========================================== */
exports.terminateEmployee = async (authUser, id, reason) => {

  const employee = await Employee.findOne({
    _id: id,
    companyId: authUser.companyId
  });

  if (!employee) throw new Error("Employee not found");

  employee.employmentStatus = "TERMINATED";
  employee.terminatedAt = new Date();

  await employee.save();

  await auditService.logAction({
    userId: authUser.userId,
    companyId: authUser.companyId,
    action: "EMPLOYEE_TERMINATED",
    targetType: "Employee",
    targetId: employee._id,
    meta: { reason }
  });

  return employee;
};


/* ==========================================
   BLACKLIST EMPLOYEE
========================================== */
exports.blacklistEmployee = async (authUser, id, reason) => {

  const employee = await Employee.findOne({
    _id: id,
    companyId: authUser.companyId
  });

  if (!employee) throw new Error("Employee not found");

  employee.employmentStatus = "BLACKLISTED";
  employee.blacklistReason = reason;
  employee.terminatedAt = new Date();

  await employee.save();

  await auditService.logAction({
    userId: authUser.userId,
    companyId: authUser.companyId,
    action: "EMPLOYEE_BLACKLISTED",
    targetType: "Employee",
    targetId: employee._id,
    meta: { reason }
  });

  return employee;
};


/* ==========================================
   REACTIVATE EMPLOYEE
========================================== */
exports.reactivateEmployee = async (authUser, id) => {

  const employee = await Employee.findOne({
    _id: id,
    companyId: authUser.companyId
  });

  if (!employee) throw new Error("Employee not found");

  employee.employmentStatus = "ACTIVE";
  employee.terminatedAt = null;
  employee.blacklistReason = null;

  await employee.save();

  await auditService.logAction({
    userId: authUser.userId,
    companyId: authUser.companyId,
    action: "EMPLOYEE_REACTIVATED",
    targetType: "Employee",
    targetId: employee._id
  });

  return employee;
};


/* ==========================================
   UPDATE SALARY
========================================== */
exports.updateSalary = async (authUser, id, salaryData) => {

  const employee = await Employee.findOne({
    _id: id,
    companyId: authUser.companyId
  });

  if (!employee) throw new Error("Employee not found");

  const oldSalary = {
    baseSalary: employee.salary.baseSalary,
    bonus: employee.salary.bonus,
    medicalAllowance: employee.salary.medicalAllowance
  };

  employee.salary.salaryHistory.push(oldSalary);

  if (salaryData.baseSalary !== undefined)
    employee.salary.baseSalary = salaryData.baseSalary;

  if (salaryData.bonus !== undefined)
    employee.salary.bonus = salaryData.bonus;

  if (salaryData.medicalAllowance !== undefined)
    employee.salary.medicalAllowance = salaryData.medicalAllowance;

  await employee.save();

  await auditService.logAction({
    userId: authUser.userId,
    companyId: authUser.companyId,
    action: "SALARY_UPDATED",
    targetType: "Employee",
    targetId: employee._id,
    changes: {
      oldSalary,
      newSalary: salaryData
    }
  });

  return employee;
};

exports.getDirectReports = async (authUser, managerId) => {

  const employees = await Employee.find({
    companyId: authUser.companyId,
    "professional.reportingManagerId": managerId
  }).populate("professional.departmentId");

  return employees;
};


exports.getTeamTree = async (authUser, managerId) => {

  const directReports = await Employee.find({
    companyId: authUser.companyId,
    "professional.reportingManagerId": managerId
  });

  const team = [];

  for (const employee of directReports) {
    const subTeam = await exports.getTeamTree(authUser, employee._id);

    team.push({
      employee,
      reports: subTeam
    });
  }

  return team;
};
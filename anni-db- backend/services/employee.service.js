const Employee = require("../models/employee.model");
const User = require("../models/user.model");
const auditService = require("./audit.service");


/* =====================================================
   CREATE EMPLOYEE (INVITED)
===================================================== */
exports.createEmployee = async (authUser, data) => {

  const companyId = authUser.companyId;

  if (!data.name) throw new Error("Employee name is required");
  if (!data.email) throw new Error("Employee email is required");

  const email = data.email.toLowerCase();

  /* prevent duplicate users */

  const existingUser = await User.findOne({
    companyId,
    email,
    accountStatus: { $ne: "TERMINATED" } 
  });

  if (existingUser) {
    throw new Error("User with this email already exists");
  }

  /* create employee */

  const employee = await Employee.create({
    companyId,

    personal: {
      name: data.name,
      email,
      phone: data.phone || "",
      address: data.address || ""
    },

    professional: {
      departmentId: data.departmentId || null,
      employmentType: data.employmentType || "TRAINEE",
      experienceLevel: data.experienceLevel || "JUNIOR",
      reportingManagerId: data.reportingManagerId || null
    },

    employmentStatus: "INVITED"
  });

  /* create login user */

  const user = await User.create({
    email,
    role: data.role || "EMPLOYEE",
    companyId,
    employeeId: employee._id,
    accountStatus: "INVITED"
  });

  employee.userId = user._id;
  await employee.save();

  await auditService.logAction({
    userId: authUser.userId,
    companyId,
    action: "EMPLOYEE_CREATED",
    targetType: "Employee",
    targetId: employee._id,
    meta: { email, role: user.role }
  });

  return {
    message: "Employee invited successfully",
    employee,
    user
  };
};



/* =====================================================
   UPDATE EMPLOYEE
===================================================== */
exports.updateEmployee = async (authUser, id, body) => {

  const employee = await Employee.findOne({
    _id: id,
    companyId: authUser.companyId
  });

  if (!employee) throw new Error("Employee not found");

  const user = await User.findOne({
    employeeId: employee._id,
    companyId: authUser.companyId
  });

  const changes = {};


  /* ================= PERSONAL ================= */

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

    if (body.personal.email !== undefined && user) {

      const newEmail = body.personal.email.toLowerCase();

      const duplicate = await User.findOne({
        email: newEmail,
        companyId: authUser.companyId,
        _id: { $ne: user._id }
      });

      if (duplicate) {
        throw new Error("Email already used by another employee");
      }

      employee.personal.email = newEmail;
      user.email = newEmail;

      changes.email = newEmail;
    }

  }


  /* ================= PROFESSIONAL ================= */

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

    if (body.professional.reportingManagerId !== undefined) {
      employee.professional.reportingManagerId = body.professional.reportingManagerId;
      changes.reportingManagerId = body.professional.reportingManagerId;
    }

  }


  /* ================= ROLE ================= */

  if (body.role !== undefined && user) {
    user.role = body.role;
    changes.role = body.role;
  }


  /* ================= SALARY ================= */

  if (body.salary) {

    const oldSalary = {
      baseSalary: employee.salary.baseSalary,
      bonus: employee.salary.bonus,
      medicalAllowance: employee.salary.medicalAllowance
    };

    let salaryChanged = false;

    if (body.salary.baseSalary !== undefined) {
      employee.salary.baseSalary = body.salary.baseSalary;
      salaryChanged = true;
    }

    if (body.salary.bonus !== undefined) {
      employee.salary.bonus = body.salary.bonus;
      salaryChanged = true;
    }

    if (body.salary.medicalAllowance !== undefined) {
      employee.salary.medicalAllowance = body.salary.medicalAllowance;
      salaryChanged = true;
    }

    if (salaryChanged) {
      employee.salary.salaryHistory.push(oldSalary);
      changes.salaryUpdated = true;
    }

  }


  /* ================= LEAVE ================= */

  if (body.leaveBalance) {

    if (body.leaveBalance.total !== undefined)
      employee.leaveBalance.total = body.leaveBalance.total;

    if (body.leaveBalance.used !== undefined)
      employee.leaveBalance.used = body.leaveBalance.used;

    employee.leaveBalance.remaining =
      employee.leaveBalance.total - employee.leaveBalance.used;

    changes.leaveUpdated = true;
  }


  await employee.save();
  if (user) await user.save();


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



/* =====================================================
   HIRE EMPLOYEE
===================================================== */
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



/* =====================================================
   TERMINATE EMPLOYEE
===================================================== */
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



/* =====================================================
   BLACKLIST EMPLOYEE
===================================================== */
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



/* =====================================================
   REACTIVATE EMPLOYEE
===================================================== */
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



/* =====================================================
   TEAM FUNCTIONS
===================================================== */

exports.getDirectReports = async (authUser, managerId) => {

  return Employee.find({
    companyId: authUser.companyId,
    "professional.reportingManagerId": managerId
  }).populate("professional.departmentId");

};


exports.getTeamTree = async (authUser, managerId) => {

  const directReports = await Employee.find({
    companyId: authUser.companyId,
    "professional.reportingManagerId": managerId
  });

  const team = [];

  for (const emp of directReports) {

    const reports = await exports.getTeamTree(authUser, emp._id);

    team.push({
      employee: emp,
      reports
    });

  }

  return team;
};
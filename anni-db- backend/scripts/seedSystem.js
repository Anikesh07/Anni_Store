const bcrypt = require("bcryptjs");

const User = require("../models/user.model");
const Company = require("../models/company.model");
const CompanySettings = require("../models/companySettings.model");
const Department = require("../models/department.model");
const Employee = require("../models/employee.model");
const Role = require("../models/role.model");

async function seedSystem() {

  console.log("🌱 Running system seed...");

  /* =====================================
     SUPER ADMIN (GLOBAL)
  ===================================== */

  const adminEmail = "anni123@gmail.com";
  const adminPassword = "Anni123";

  let superAdmin = await User.findOne({ email: adminEmail });

  if (!superAdmin) {

    const passwordHash = await bcrypt.hash(adminPassword, 10);

    superAdmin = await User.create({
      email: adminEmail,
      password: passwordHash,
      accountStatus: "ACTIVE"
      // roleId = null → handled as SUPER ADMIN in middleware
    });

    console.log("✅ SUPER_ADMIN created");

  } else {
    console.log("SUPER_ADMIN already exists");
  }

  /* =====================================
     DEFAULT COMPANY
  ===================================== */

  let company = await Company.findOne({ slug: "annisystems" });

  if (!company) {

    company = await Company.create({
      name: "Anni Systems",
      slug: "annisystems",
      subscriptionPlan: "FREE",
      status: "ACTIVE"
    });

    await CompanySettings.create({
      companyId: company._id
    });

    console.log("✅ Default company created");
  }

  /* =====================================
     DEPARTMENTS
  ===================================== */

  const departments = ["HR", "Engineering", "Sales", "Finance", "Chatbot"];

  for (const dept of departments) {

    const exists = await Department.findOne({
      name: dept,
      companyId: company._id
    });

    if (!exists) {
      await Department.create({
        name: dept,
        companyId: company._id
      });

      console.log(`✅ Department created: ${dept}`);
    }
  }

  /* =====================================
     ROLES + PERMISSIONS (UPDATE SAFE)
  ===================================== */

  const roles = [

    {
      name: "COMPANY_OWNER",
      permissions: ["ADMIN_ALL"]
    },

    {
      name: "COMPANY_CEO",
      permissions: ["ADMIN_ALL"]
    },

    {
      name: "HR",
      permissions: [
        "EMPLOYEE_CREATE",
        "EMPLOYEE_EDIT",
        "EMPLOYEE_VIEW",
        "PAYROLL_VIEW",
        "LEAVE_APPROVE"
      ]
    },

    {
      name: "MANAGER",
      permissions: [
        "TEAM_VIEW",
        "EMPLOYEE_VIEW",
        "LEAVE_APPROVE"
      ]
    },

    {
      name: "EMPLOYEE",
      permissions: [
        "SELF_PROFILE",
        "APPLY_LEAVE"
      ]
    },

    {
      name: "CHATBOT_ENGINEER",
      permissions: [
        "CHATBOT_VIEW",
        "CHATBOT_MANAGE_INTENTS",
        "CHATBOT_TRAIN",
        "CHATBOT_CONTROL",
        "CHATBOT_VIEW_CONVERSATIONS"
      ]
    },

    {
      name: "CHATBOT_SUPPORT",
      permissions: [
        "CHATBOT_VIEW",
        "CHATBOT_VIEW_CONVERSATIONS"
      ]
    }

  ];

  const roleMap = {};

  for (const role of roles) {

    let existing = await Role.findOne({
      name: role.name,
      companyId: company._id
    });

    if (!existing) {

      existing = await Role.create({
        name: role.name,
        companyId: company._id,
        permissions: role.permissions
      });

      console.log(`✅ Role created: ${role.name}`);

    } else {

      // 🔥 THIS IS THE FIX YOU WERE MISSING
      existing.permissions = role.permissions;
      await existing.save();

      console.log(`♻️ Role updated: ${role.name}`);
    }

    roleMap[role.name] = existing;
  }

  /* =====================================
     OWNER EMPLOYEE
  ===================================== */

  const ownerEmail = "anikeshmanitripathi23@gmail.com";

  let employee = await Employee.findOne({
    "personal.email": ownerEmail
  });

  if (!employee) {

    employee = await Employee.create({
      companyId: company._id,
      personal: {
        name: "Anikesh",
        email: ownerEmail
      },
      employmentStatus: "ACTIVE"
    });

    console.log("✅ Owner employee created");
  }

  /* =====================================
     OWNER USER
  ===================================== */

  let ownerUser = await User.findOne({ email: ownerEmail });

  if (!ownerUser) {

    ownerUser = await User.create({
      email: ownerEmail,
      roleId: roleMap["COMPANY_OWNER"]._id,
      companyId: company._id,
      employeeId: employee._id,
      accountStatus: "ACTIVE"
    });

    employee.userId = ownerUser._id;
    await employee.save();

    console.log("✅ Company owner created");

  } else {

    // 🔥 Ensure correct role if already exists
    ownerUser.roleId = roleMap["COMPANY_OWNER"]._id;
    await ownerUser.save();

    console.log("♻️ Owner role updated");
  }

  console.log("🌱 System seed complete");

}

module.exports = seedSystem;
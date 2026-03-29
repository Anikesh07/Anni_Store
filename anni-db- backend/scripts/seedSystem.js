const bcrypt = require("bcryptjs");

const User = require("../models/user.model");
const Company = require("../models/company.model");
const CompanySettings = require("../models/companySettings.model");
const Department = require("../models/department.model");
const Employee = require("../models/employee.model");
const Role = require("../models/role.model");

async function seedSystem() {

  try {

    console.log("🌱 Running system seed...");

    /* =====================================
       SUPER ADMIN
    ===================================== */

    const adminEmail = "anni123@gmail.com";
    const adminPassword = "Anni123";

    let superAdmin = await User.findOne({ email: adminEmail });

    if (!superAdmin) {

      const passwordHash = await bcrypt.hash(adminPassword, 10);

      superAdmin = await User.create({
        email: adminEmail,
        password: passwordHash,
        role: "SUPER_ADMIN",
        accountStatus: "ACTIVE"
      });

      console.log("✅ SUPER_ADMIN created");

    } else {

      if (superAdmin.role !== "SUPER_ADMIN") {
        superAdmin.role = "SUPER_ADMIN";
        await superAdmin.save();
      }

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
       DEFAULT DEPARTMENTS
    ===================================== */

    const departments = ["HR", "Engineering", "Sales", "Finance"];

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
        role: "COMPANY_OWNER",
        companyId: company._id,
        employeeId: employee._id,
        accountStatus: "ACTIVE"
      });

      employee.userId = ownerUser._id;
      await employee.save();

      console.log("✅ Company owner created");
    }

    /* =====================================
       DEFAULT ROLES
    ===================================== */

    const defaultRoles = [
      {
        name: "COMPANY_OWNER",
        permissions: ["ALL"]
      },
      {
        name: "HR",
        permissions: [
          "EMPLOYEE_CREATE",
          "EMPLOYEE_EDIT",
          "PAYROLL_VIEW",
          "LEAVE_APPROVE"
        ]
      },
      {
        name: "MANAGER",
        permissions: [
          "TEAM_VIEW",
          "LEAVE_APPROVE"
        ]
      },
      {
        name: "EMPLOYEE",
        permissions: [
          "SELF_PROFILE",
          "APPLY_LEAVE"
        ]
      }
    ];

    for (const role of defaultRoles) {

      const exists = await Role.findOne({
        name: role.name,
        companyId: company._id
      });

      if (!exists) {

        await Role.create({
          name: role.name,
          companyId: company._id,
          permissions: role.permissions
        });

        console.log(`✅ Role created: ${role.name}`);
      }
    }

    /* =====================================
       NOTE: CHATBOT INIT REMOVED
    ===================================== */

    console.log("🌱 System seed complete");

  } catch (err) {

    console.error("❌ Seed failed:", err);
    throw err;

  }

}

module.exports = seedSystem;
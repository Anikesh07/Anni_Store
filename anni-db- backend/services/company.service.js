const Company = require("../models/company.model");
const CompanySettings = require("../models/companySettings.model");
const Employee = require("../models/employee.model");
const User = require("../models/user.model");

exports.createCompany = async (data) => {
  const {
    name,
    subscriptionPlan,
    ownerName,
    ownerEmail
  } = data;

  // 1️⃣ Create Company
  const company = await Company.create({
    name,
    subscriptionPlan
  });

  // 2️⃣ Create Company Settings
  await CompanySettings.create({
    companyId: company._id
  });

  // 3️⃣ Create Employee for Owner
  const employee = await Employee.create({
    companyId: company._id,
    userId: null, // temporary
    personal: {
      name: ownerName
    },
    employmentStatus: "INVITED"
  });

  // 4️⃣ Create User (COMPANY_OWNER)
  const user = await User.create({
    email: ownerEmail,
    role: "COMPANY_OWNER",
    companyId: company._id,
    employeeId: employee._id,
    accountStatus: "INVITED"
  });

  // 5️⃣ Link employee to user
  employee.userId = user._id;
  await employee.save();

  return {
    message: "Company created successfully",
    company
  };
};
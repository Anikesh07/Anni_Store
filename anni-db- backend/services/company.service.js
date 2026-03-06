const Company = require("../models/company.model");
const CompanySettings = require("../models/companySettings.model");
const Employee = require("../models/employee.model");
const User = require("../models/user.model");
const Department = require("../models/department.model");
const sendEmail = require("../utils/sendEmail");

exports.createCompany = async (data) => {

  const { name, subscriptionPlan } = data;

  const ownerName = "Anikesh";
  const ownerEmail = "anikeshmanitripathi23@gmail.com";

  /* ======================================
     CHECK OWNER EXISTS
  ====================================== */

  const existing = await User.findOne({ email: ownerEmail });

  if (existing) {
    throw new Error("Owner already exists");
  }

  /* ======================================
     1️⃣ CREATE COMPANY
  ====================================== */

  const company = await Company.create({
    name,
    subscriptionPlan: subscriptionPlan || "FREE"
  });

  /* ======================================
     2️⃣ COMPANY SETTINGS
  ====================================== */

  await CompanySettings.create({
    companyId: company._id
  });

  /* ======================================
     3️⃣ CREATE DEFAULT DEPARTMENTS
  ====================================== */

  const departments = [
    "HR",
    "Engineering",
    "Sales",
    "Finance"
  ];

  for (const dept of departments) {
    await Department.create({
      name: dept,
      companyId: company._id
    });
  }

  /* ======================================
     4️⃣ CREATE OWNER EMPLOYEE
  ====================================== */

  const employee = await Employee.create({
    companyId: company._id,
    personal: {
      name: ownerName,
      email: ownerEmail
    },
    employmentStatus: "INVITED"
  });

  /* ======================================
     5️⃣ GENERATE OTP
  ====================================== */

  const otp = Math.floor(100000 + Math.random() * 900000).toString();

  const otpExpiry = new Date(Date.now() + 10 * 60 * 1000);

  /* ======================================
     6️⃣ CREATE USER (OWNER)
  ====================================== */

  const user = await User.create({
    email: ownerEmail,
    role: "COMPANY_OWNER",
    companyId: company._id,
    employeeId: employee._id,
    accountStatus: "PENDING",
    otp,
    otpExpiry
  });

  employee.userId = user._id;
  await employee.save();

  /* ======================================
     7️⃣ SEND OTP EMAIL
  ====================================== */

  await sendEmail({
    to: ownerEmail,
    subject: "Activate your company account",
    text: `Your OTP is ${otp}. It expires in 10 minutes.`
  });

  return {
    message: "Company created. Owner must verify OTP.",
    companyId: company._id
  };
};
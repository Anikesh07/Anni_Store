const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");

const User = require("../models/user.model");
const Company = require("../models/company.model");
const Employee = require("../models/employee.model");

/* =========================================
   LOGIN
========================================= */

exports.login = async (companySlug, email, password) => {

  if (!email || !password) {
    throw new Error("Email and password are required");
  }

  email = email.toLowerCase();

  /* ============================
     SUPER ADMIN LOGIN
  ============================ */

  const superAdmin = await User.findOne({
    email,
    role: "SUPER_ADMIN"
  });

  if (superAdmin) {

    const isMatch = await bcrypt.compare(password, superAdmin.password);

    if (!isMatch) {
      throw new Error("Invalid credentials");
    }

    const token = jwt.sign(
      {
        userId: superAdmin._id,
        role: superAdmin.role,
        companyId: null
      },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    return token;
  }

  /* ============================
     COMPANY USER LOGIN
  ============================ */

  if (!companySlug) {
    throw new Error("Company slug is required");
  }

  const company = await Company.findOne({ slug: companySlug });

  if (!company || company.status !== "ACTIVE") {
    throw new Error("Company not found or inactive");
  }

  const user = await User.findOne({
    companyId: company._id,
    email
  });

  if (!user) {
    throw new Error("Invalid credentials");
  }

  if (user.accountStatus !== "ACTIVE") {
    throw new Error("Account not active");
  }

  const isMatch = await bcrypt.compare(password, user.password);

  if (!isMatch) {
    throw new Error("Invalid credentials");
  }

  const token = jwt.sign(
    {
      userId: user._id,
      role: user.role,
      companyId: user.companyId,
      employeeId: user.employeeId
    },
    process.env.JWT_SECRET,
    { expiresIn: "1d" }
  );

  return token;
};


/* =========================================
   REQUEST OTP
========================================= */

exports.requestOTP = async (companySlug, email) => {

  email = email.toLowerCase();

  if (!companySlug) {
    throw new Error("Company slug is required");
  }

  const company = await Company.findOne({ slug: companySlug });

  if (!company) {
    throw new Error("Company not found");
  }

  const user = await User.findOne({
    companyId: company._id,
    email
  });

  if (!user) {
    throw new Error("User not found");
  }

  const otp = crypto.randomInt(100000, 999999).toString();

  const hashedOTP = await bcrypt.hash(otp, 10);

  user.otp = {
    code: hashedOTP,
    expiresAt: Date.now() + 5 * 60 * 1000
  };

  await user.save();

  return otp;
};


/* =========================================
   VERIFY OTP
========================================= */

exports.verifyOTP = async (companySlug, email, otp, newPassword) => {

  email = email.toLowerCase();

  if (!companySlug) {
    throw new Error("Company slug is required");
  }

  const company = await Company.findOne({ slug: companySlug });

  if (!company) {
    throw new Error("Company not found");
  }

  const user = await User.findOne({
    companyId: company._id,
    email
  });

  if (!user || !user.otp?.code) {
    throw new Error("Invalid request");
  }

  if (Date.now() > user.otp.expiresAt) {
    throw new Error("OTP expired");
  }

  const isMatch = await bcrypt.compare(otp, user.otp.code);

  if (!isMatch) {
    throw new Error("Invalid OTP");
  }

  /* SET PASSWORD */

  user.password = await bcrypt.hash(newPassword, 10);

  if (user.accountStatus === "INVITED") {
    user.accountStatus = "ACTIVE";
  }

  user.otp = undefined;

  await user.save();

  /* ACTIVATE EMPLOYEE */

  if (user.employeeId) {

    const employee = await Employee.findById(user.employeeId);

    if (employee && employee.employmentStatus === "INVITED") {

      employee.employmentStatus = "ACTIVE";
      employee.hiredAt = new Date();

      await employee.save();
    }
  }

  return true;
};
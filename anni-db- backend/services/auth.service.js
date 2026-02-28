// const Admin = require("../models/admin.model");
// const bcrypt = require("bcryptjs");
// const jwt = require("jsonwebtoken");

// exports.register = async (data) => {
//   const hashedPassword = await bcrypt.hash(data.password, 10);

//   return await Admin.create({
//     name: data.name,
//     email: data.email,
//     password: hashedPassword,
//     role: data.role
//   });
// };

// exports.login = async (email, password) => {
//   const admin = await Admin.findOne({ email });
//   if (!admin) throw new Error("Admin not found");

//   const isMatch = await bcrypt.compare(password, admin.password);
//   if (!isMatch) throw new Error("Invalid credentials");

//   const token = jwt.sign(
//     { id: admin._id, role: admin.role },
//     process.env.JWT_SECRET,
//     { expiresIn: "1d" }
//   );

//   return token;
// };




const Admin = require("../models/admin.model");
const Employee = require("../models/employee.model");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");

/* ==============================
   ADMIN REGISTER
============================== */
exports.register = async (data) => {
  const hashedPassword = await bcrypt.hash(data.password, 10);

  return await Admin.create({
    name: data.name,
    email: data.email,
    password: hashedPassword,
    role: data.role
  });
};

/* ==============================
   LOGIN (Admin + Employee)
============================== */
exports.login = async (email, password) => {

  // 1️⃣ Check Admin
  const admin = await Admin.findOne({ email });

  if (admin) {
    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) throw new Error("Invalid credentials");

    return jwt.sign(
      { id: admin._id, role: admin.role, type: "ADMIN" },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );
  }

  // 2️⃣ Check Employee
  const employee = await Employee.findOne({ "personal.email": email });

  if (!employee) throw new Error("User not found");

  if (!employee.isRegistered)
    throw new Error("Account not activated");

  if (!employee.isActive)
    throw new Error("Account disabled");

  const isMatch = await bcrypt.compare(password, employee.password);
  if (!isMatch) throw new Error("Invalid credentials");

  return jwt.sign(
    {
      id: employee._id,
      role: employee.professional.role,
      type: "EMPLOYEE"
    },
    process.env.JWT_SECRET,
    { expiresIn: "1d" }
  );
};

/* ==============================
   REQUEST OTP
============================== */
exports.requestOTP = async (email) => {

  const employee = await Employee.findOne({ "personal.email": email });

  if (!employee)
    throw new Error("No data found. Contact HR.");

  if (employee.isRegistered)
    throw new Error("Account already activated.");

  const otp = crypto.randomInt(100000, 999999).toString();
  const hashedOTP = await bcrypt.hash(otp, 10);

  employee.otp = {
    code: hashedOTP,
    expiresAt: Date.now() + 5 * 60 * 1000
  };

  await employee.save();

  return otp; // we will email this
};

/* ==============================
   VERIFY OTP
============================== */
exports.verifyOTP = async (email, otp, password) => {

  const employee = await Employee.findOne({ "personal.email": email });

  if (!employee || !employee.otp?.code)
    throw new Error("Invalid request");

  if (Date.now() > employee.otp.expiresAt)
    throw new Error("OTP expired");

  const isMatch = await bcrypt.compare(otp, employee.otp.code);
  if (!isMatch) throw new Error("Invalid OTP");

  employee.password = await bcrypt.hash(password, 10);
  employee.isRegistered = true;
  employee.isActive = true;
  employee.otp = undefined;

  await employee.save();

  return true;
};
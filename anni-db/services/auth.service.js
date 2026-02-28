const Admin = require("../models/admin.model");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

exports.register = async (data) => {
  const hashedPassword = await bcrypt.hash(data.password, 10);

  return await Admin.create({
    name: data.name,
    email: data.email,
    password: hashedPassword,
    role: data.role
  });
};

exports.login = async (email, password) => {
  const admin = await Admin.findOne({ email });
  if (!admin) throw new Error("Admin not found");

  const isMatch = await bcrypt.compare(password, admin.password);
  if (!isMatch) throw new Error("Invalid credentials");

  const token = jwt.sign(
    { id: admin._id, role: admin.role },
    process.env.JWT_SECRET,
    { expiresIn: "1d" }
  );

  return token;
};
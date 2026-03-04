require("dotenv").config();
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const connectMongo = require("../config/db");
const User = require("../models/user.model");

const createSuperAdmin = async () => {
  try {
    await connectMongo();

    const existing = await User.findOne({ role: "SUPER_ADMIN" });

    if (existing) {
      console.log("SUPER_ADMIN already exists.");
      process.exit();
    }

    const hashedPassword = await bcrypt.hash("SuperAdmin@123", 10);

    const superAdmin = await User.create({
      email: "superadmin@platform.com",
      password: hashedPassword,
      role: "SUPER_ADMIN",
      accountStatus: "ACTIVE"
    });

    console.log("SUPER_ADMIN created successfully:");
    console.log("Email: superadmin@platform.com");
    console.log("Password: SuperAdmin@123");

    process.exit();

  } catch (error) {
    console.error("Error creating SUPER_ADMIN:", error.message);
    process.exit(1);
  }
};

createSuperAdmin();
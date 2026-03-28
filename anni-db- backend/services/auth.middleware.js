const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");
const User = require("../models/user.model");

/* =========================================
   AUTHENTICATION MIDDLEWARE
========================================= */

exports.protect = async (req, res, next) => {

  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    console.warn("⚠️ No Authorization header");
    return res.status(401).json({ message: "Unauthorized" });
  }

  const token = authHeader.split(" ")[1];

  try {

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log("🔐 Decoded Token:", decoded);

    const user = await User.findById(decoded.userId);

    if (!user) {
      console.warn("⚠️ User not found");
      return res.status(401).json({ message: "Invalid user" });
    }

    if (user.accountStatus !== "ACTIVE") {
      return res.status(401).json({ message: "User inactive" });
    }

    /* =========================================
       HANDLE COMPANY LOGIC PROPERLY
    ========================================= */

    let companyId = user.companyId;

    // 🔥 SUPER ADMIN SUPPORT
    if (!companyId && user.role === "SUPER_ADMIN") {

      console.warn("⚠️ SUPER_ADMIN detected → assigning default company");

      // 👉 You can improve this later
      const Company = require("../models/company.model");
      const company = await Company.findOne();

      if (!company) {
        return res.status(500).json({
          message: "No company found in system"
        });
      }

      companyId = company._id;
    }

    // ❌ Still no company → block
    if (!companyId) {
      return res.status(400).json({
        message: "User not assigned to any company"
      });
    }

    req.user = {
      userId: user._id,
      role: user.role,
      companyId: new mongoose.Types.ObjectId(companyId)
    };

    console.log("👤 Authenticated User:", req.user);

    next();

  } catch (err) {

    console.error("❌ Auth Error:", err.message);

    return res.status(401).json({
      message: "Invalid or expired token"
    });
  }
};


/* =========================================
   ROLE AUTHORIZATION
========================================= */

exports.allowRoles = (...allowedRoles) => {

  return (req, res, next) => {

    if (!req.user || !allowedRoles.includes(req.user.role)) {
      console.warn("⛔ Access denied for role:", req.user?.role);
      return res.status(403).json({ message: "Access denied" });
    }

    next();
  };

};
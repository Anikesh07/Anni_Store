
const jwt = require("jsonwebtoken");
const User = require("../models/user.model");

/* =========================================
   AUTHENTICATION MIDDLEWARE
========================================= */

exports.protect = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // 🔥 Fetch user + populate role
    const user = await User.findById(decoded.userId)
      .populate("roleId");

    if (!user || user.accountStatus !== "ACTIVE") {
      return res.status(401).json({ message: "Invalid user" });
    }

    let permissions = [];

    // 🔥 SUPER_ADMIN → full access
    if (!user.roleId) {
      permissions = ["ADMIN_ALL"];
    } else {
      permissions = user.roleId.permissions || [];
    }

    req.user = {
      userId: user._id,
      role: user.roleId ? user.roleId.name : "SUPER_ADMIN",
      permissions: permissions,
      companyId: user.companyId,
      employeeId: user.employeeId   // 🔥 THIS LINE FIXES YOUR LIFE
    };

    next();

  } catch (err) {
    return res.status(401).json({ message: "Invalid or expired token" });
  }
};

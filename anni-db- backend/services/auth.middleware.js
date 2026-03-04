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

    // Fetch fresh user from DB (important)
    const user = await User.findById(decoded.userId);

    if (!user || user.accountStatus !== "ACTIVE") {
      return res.status(401).json({ message: "Invalid user" });
    }

    req.user = {
      userId: user._id,
      role: user.role,
      companyId: user.companyId
    };

    next();

  } catch (err) {
    return res.status(401).json({ message: "Invalid or expired token" });
  }
};

/* =========================================
   ROLE AUTHORIZATION
========================================= */

exports.allowRoles = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ message: "Access denied" });
    }
    next();
  };
};
const ROLE_HIERARCHY = {
  SUPER_ADMIN: 5,
  COMPANY_OWNER: 4,
  HR: 3,
  MANAGER: 2,
  EMPLOYEE: 1
};

/* =========================================
   AUTH CHECK (already exists as protect)
========================================= */

exports.protect = require("./auth.middleware").protect;

/* =========================================
   STRICT ROLE CHECK
========================================= */

exports.allowRoles = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ message: "Access denied" });
    }

    next();
  };
};

/* =========================================
   HIERARCHY ENFORCEMENT
   Prevent creating/modifying higher roles
========================================= */

exports.canManageRole = (targetRole) => {
  return (req, res, next) => {

    const currentRole = req.user.role;

    if (!ROLE_HIERARCHY[currentRole]) {
      return res.status(403).json({ message: "Invalid role" });
    }

    if (ROLE_HIERARCHY[currentRole] <= ROLE_HIERARCHY[targetRole]) {
      return res.status(403).json({
        message: "You cannot manage a user with equal or higher role"
      });
    }

    next();
  };
};
/* =========================================
   AUTH CHECK (REUSE)
========================================= */

exports.protect = require("./auth.middleware").protect;


/* =========================================
   PERMISSION CHECK (CORE RBAC)
========================================= */

exports.checkPermission = (requiredPermission) => {

  return (req, res, next) => {

    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const permissions = req.user.permissions || [];

    // 🔥 ADMIN (CEO + SUPER_ADMIN) BYPASS
    if (permissions.includes("ADMIN_ALL")) {
      return next();
    }

    // ✅ Check required permission
    if (!permissions.includes(requiredPermission)) {
      return res.status(403).json({ message: "Access denied" });
    }

    next();
  };

};


/* =========================================
   MULTIPLE PERMISSIONS (OPTIONAL)
========================================= */

exports.checkAnyPermission = (requiredPermissions = []) => {

  return (req, res, next) => {

    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const permissions = req.user.permissions || [];

    // 🔥 ADMIN bypass
    if (permissions.includes("ADMIN_ALL")) {
      return next();
    }

    const hasPermission = requiredPermissions.some(p =>
      permissions.includes(p)
    );

    if (!hasPermission) {
      return res.status(403).json({ message: "Access denied" });
    }

    next();
  };

};


/* =========================================
   ROLE HIERARCHY (KEEP FOR HR LOGIC ONLY)
========================================= */

const ROLE_HIERARCHY = {
  SUPER_ADMIN: 5,
  COMPANY_OWNER: 4,
  COMPANY_CEO: 4,
  HR: 3,
  MANAGER: 2,
  EMPLOYEE: 1
};

exports.canManageRole = (targetRole) => {

  return (req, res, next) => {

    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const currentRole = req.user.role;

    // 🔥 SUPER ADMIN
    if (currentRole === "SUPER_ADMIN") {
      return next();
    }

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
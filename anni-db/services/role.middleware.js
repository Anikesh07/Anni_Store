module.exports = function (allowedRoles) {
  return (req, res, next) => {
    if (!req.admin) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    if (!allowedRoles.includes(req.admin.role)) {
      return res.status(403).json({ message: "Forbidden: Access denied" });
    }

    next();
  };
};
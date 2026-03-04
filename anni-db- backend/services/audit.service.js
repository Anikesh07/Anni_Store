const AuditLog = require("../models/auditLog.model");

/* ==========================================
   CREATE AUDIT LOG
========================================== */
exports.logAction = async ({
  userId,
  companyId,
  action,
  targetType,
  targetId,
  changes = null,
  meta = null
}) => {
  try {
    await AuditLog.create({
      userId,
      companyId,
      action,
      targetType,
      targetId,
      changes,
      meta
    });
  } catch (error) {
    // Logging should never break main flow
    console.error("Audit log failed:", error.message);
  }
};

/* ==========================================
   GET COMPANY AUDIT LOGS
========================================== */
exports.getCompanyLogs = async (companyId, page = 1, limit = 20) => {

  const skip = (page - 1) * limit;

  const logs = await AuditLog.find({ companyId })
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .populate("userId", "email role")
    .populate("targetId");

  const total = await AuditLog.countDocuments({ companyId });

  return {
    total,
    page,
    logs
  };
};

/* ==========================================
   GET EMPLOYEE HISTORY
========================================== */
exports.getEmployeeHistory = async (companyId, employeeId) => {

  return await AuditLog.find({
    companyId,
    targetType: "Employee",
    targetId: employeeId
  })
    .sort({ createdAt: -1 })
    .populate("userId", "email role");
};
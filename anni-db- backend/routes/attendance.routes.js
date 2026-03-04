const express = require("express");
const router = express.Router();

const { protect, allowRoles } = require("../services/permission.middleware");
const attendanceController = require("../controllers/attendance.controller");

/* ==========================================
   CLOCK IN
========================================== */
router.post(
  "/clock-in",
  protect,
  allowRoles("EMPLOYEE", "MANAGER", "HR", "COMPANY_OWNER"),
  attendanceController.clockIn
);

/* ==========================================
   CLOCK OUT
========================================== */
router.post(
  "/clock-out",
  protect,
  allowRoles("EMPLOYEE", "MANAGER", "HR", "COMPANY_OWNER"),
  attendanceController.clockOut
);

/* ==========================================
   MY ATTENDANCE HISTORY
========================================== */
router.get(
  "/my",
  protect,
  attendanceController.getMyAttendance
);

/* ==========================================
   MANAGER: TEAM ATTENDANCE
========================================== */
router.get(
  "/team",
  protect,
  allowRoles("MANAGER", "HR", "COMPANY_OWNER"),
  attendanceController.getTeamAttendance
);

/* ==========================================
   HR / OWNER: COMPANY ATTENDANCE
========================================== */
router.get(
  "/company",
  protect,
  allowRoles("HR", "COMPANY_OWNER"),
  attendanceController.getCompanyAttendance
);

module.exports = router;
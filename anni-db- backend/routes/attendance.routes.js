const express = require("express");
const router = express.Router();

const { protect, checkPermission } = require("../services/permission.middleware");
const attendanceController = require("../controllers/attendance.controller");

/* ==========================================
   CLOCK IN
========================================== */
router.post(
  "/clock-in",
  protect,
  checkPermission("ATTENDANCE_MARK"),
  attendanceController.clockIn
);

/* ==========================================
   CLOCK OUT
========================================== */
router.post(
  "/clock-out",
  protect,
  checkPermission("ATTENDANCE_MARK"),
  attendanceController.clockOut
);

/* ==========================================
   MY ATTENDANCE HISTORY
========================================== */
router.get(
  "/my",
  protect,
  checkPermission("SELF_ATTENDANCE"),
  attendanceController.getMyAttendance
);

/* ==========================================
   MANAGER: TEAM ATTENDANCE
========================================== */
router.get(
  "/team",
  protect,
  checkPermission("TEAM_VIEW"),
  attendanceController.getTeamAttendance
);

/* ==========================================
   HR / OWNER: COMPANY ATTENDANCE
========================================== */
router.get(
  "/company",
  protect,
  checkPermission("ATTENDANCE_VIEW"),
  attendanceController.getCompanyAttendance
);

module.exports = router;
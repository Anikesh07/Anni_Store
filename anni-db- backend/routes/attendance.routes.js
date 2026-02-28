const express = require("express");
const router = express.Router();

const { protect, allowRoles } = require("../services/permission.middleware");
const attendanceController = require("../controllers/attendance.controller");

router.post("/clock-in", protect, attendanceController.clockIn);
router.post("/clock-out", protect, attendanceController.clockOut);
router.get("/my", protect, attendanceController.getMyAttendance);
router.get("/all", protect, allowRoles("HR", "CEO"), attendanceController.getAllAttendance);

module.exports = router;
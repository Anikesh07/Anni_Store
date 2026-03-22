const express = require("express");
const router = express.Router();

const { protect, checkPermission } = require("../services/permission.middleware");
const leaveController = require("../controllers/leave.controller");

/* ==========================================
   APPLY LEAVE
========================================== */
router.post(
  "/apply",
  protect,
  checkPermission("APPLY_LEAVE"),
  leaveController.applyLeave
);

/* ==========================================
   GET MY LEAVES
========================================== */
router.get(
  "/my",
  protect,
  checkPermission("APPLY_LEAVE"), // or create LEAVE_VIEW_OWN later
  leaveController.getMyLeaves
);

/* ==========================================
   MANAGER: TEAM LEAVES
========================================== */
router.get(
  "/team",
  protect,
  checkPermission("TEAM_VIEW"),
  leaveController.getTeamLeaves
);

/* ==========================================
   REVIEW LEAVE (Approve / Reject)
========================================== */
router.put(
  "/review/:id",
  protect,
  checkPermission("LEAVE_APPROVE"),
  leaveController.reviewLeave
);

/* ==========================================
   ALL COMPANY LEAVES
========================================== */
router.get(
  "/all",
  protect,
  checkPermission("LEAVE_VIEW"),
  leaveController.getAllLeaves
);

/* ==========================================
   HR OVERRIDE
========================================== */
router.put(
  "/override/:id",
  protect,
  checkPermission("LEAVE_APPROVE"),
  leaveController.overrideLeaveStatus
);

module.exports = router;
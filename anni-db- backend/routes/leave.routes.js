const express = require("express");
const router = express.Router();

const { protect, allowRoles } = require("../services/permission.middleware");
const leaveController = require("../controllers/leave.controller");

/* ==========================================
   APPLY LEAVE (EMPLOYEE)
========================================== */
router.post(
  "/apply",
  protect,
  allowRoles("EMPLOYEE", "MANAGER", "HR", "COMPANY_OWNER"),
  leaveController.applyLeave
);

/* ==========================================
   GET MY LEAVES
========================================== */
router.get(
  "/my",
  protect,
  leaveController.getMyLeaves
);

/* ==========================================
   MANAGER: VIEW TEAM LEAVE REQUESTS
========================================== */
router.get(
  "/team",
  protect,
  allowRoles("MANAGER", "HR", "COMPANY_OWNER"),
  leaveController.getTeamLeaves
);

/* ==========================================
   MANAGER: APPROVE / REJECT LEAVE
========================================== */
router.put(
  "/review/:id",
  protect,
  allowRoles("MANAGER", "HR", "COMPANY_OWNER"),
  leaveController.reviewLeave
);

/* ==========================================
   HR / OWNER: VIEW ALL COMPANY LEAVES
========================================== */
router.get(
  "/all",
  protect,
  allowRoles("HR", "COMPANY_OWNER"),
  leaveController.getAllLeaves
);

/* ==========================================
   HR OVERRIDE (OPTIONAL)
========================================== */
router.put(
  "/override/:id",
  protect,
  allowRoles("HR", "COMPANY_OWNER"),
  leaveController.overrideLeaveStatus
);

module.exports = router;
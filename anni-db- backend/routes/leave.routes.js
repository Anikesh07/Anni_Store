const express = require("express");
const router = express.Router();

const { protect, allowRoles } = require("../services/permission.middleware");
const leaveController = require("../controllers/leave.controller");

/* APPLY LEAVE */
router.post("/apply", protect, leaveController.applyLeave);

/* MY LEAVES */
router.get("/my", protect, leaveController.getMyLeaves);

/* HR VIEW ALL */
router.get(
  "/all",
  protect,
  allowRoles("HR", "CEO"),
  leaveController.getAllLeaves
);

/* HR APPROVE / REJECT */
router.put(
  "/update-status/:id",
  protect,
  allowRoles("HR", "CEO"),
  leaveController.updateLeaveStatus
);

module.exports = router;
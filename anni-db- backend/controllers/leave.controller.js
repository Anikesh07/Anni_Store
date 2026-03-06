const Leave = require("../models/leave.model");
const Employee = require("../models/employee.model");

/* ==========================================
   APPLY LEAVE
========================================== */
exports.applyLeave = async (req, res) => {
  try {

    const leave = await Leave.create({
      employee: req.user.employeeId || req.user.id,
      type: req.body.type,
      startDate: req.body.startDate,
      endDate: req.body.endDate,
      reason: req.body.reason
    });

    res.status(201).json(leave);

  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

/* ==========================================
   GET MY LEAVES
========================================== */
exports.getMyLeaves = async (req, res) => {
  try {

    const leaves = await Leave.find({
      employee: req.user.employeeId || req.user.id
    }).sort({ createdAt: -1 });

    res.json(leaves);

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/* ==========================================
   TEAM LEAVES (MANAGER)
========================================== */
exports.getTeamLeaves = async (req, res) => {
  try {

    const managerId = req.user.employeeId;

    const teamEmployees = await Employee.find({
      manager: managerId
    }).select("_id");

    const employeeIds = teamEmployees.map(e => e._id);

    const leaves = await Leave.find({
      employee: { $in: employeeIds }
    })
      .populate("employee", "personal.name")
      .sort({ createdAt: -1 });

    res.json(leaves);

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/* ==========================================
   GET ALL LEAVES
========================================== */
exports.getAllLeaves = async (req, res) => {
  try {

    const leaves = await Leave.find()
      .populate("employee", "personal.name")
      .sort({ createdAt: -1 });

    res.json(leaves);

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/* ==========================================
   REVIEW LEAVE
========================================== */
exports.reviewLeave = async (req, res) => {
  try {

    const { status } = req.body;

    const leave = await Leave.findById(req.params.id);

    if (!leave) {
      return res.status(404).json({
        message: "Leave not found"
      });
    }

    leave.status = status;
    leave.reviewedBy = req.user.employeeId || req.user.id;

    await leave.save();

    /* Deduct leave balance */

    if (status === "APPROVED") {

      const employee = await Employee.findById(leave.employee);

      const days =
        Math.ceil(
          (new Date(leave.endDate) - new Date(leave.startDate)) /
          (1000 * 60 * 60 * 24)
        ) + 1;

      if (employee.leaveBalance.remaining < days) {
        return res.status(400).json({
          message: "Not enough leave balance"
        });
      }

      employee.leaveBalance.used += days;
      employee.leaveBalance.remaining -= days;

      await employee.save();
    }

    res.json(leave);

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/* ==========================================
   HR OVERRIDE
========================================== */
exports.overrideLeaveStatus = async (req, res) => {
  try {

    const leave = await Leave.findById(req.params.id);

    if (!leave) {
      return res.status(404).json({
        message: "Leave not found"
      });
    }

    leave.status = req.body.status;
    leave.reviewedBy = req.user.employeeId || req.user.id;

    await leave.save();

    res.json({
      message: "Leave status overridden",
      leave
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
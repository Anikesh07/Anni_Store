const Leave = require("../models/leave.model");
const Employee = require("../models/employee.model");

/* ==========================================
   APPLY LEAVE (EMPLOYEE)
========================================== */
exports.applyLeave = async (req, res) => {
  try {
    if (req.user.type !== "EMPLOYEE") {
      return res.status(403).json({
        message: "Only employees can apply for leave"
      });
    }

    const leave = await Leave.create({
      employee: req.user.id,
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
   GET MY LEAVES (EMPLOYEE)
========================================== */
exports.getMyLeaves = async (req, res) => {
  try {
    const leaves = await Leave.find({
      employee: req.user.id
    }).sort({ createdAt: -1 });

    res.json(leaves);

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


/* ==========================================
   GET ALL LEAVES (HR / CEO)
========================================== */
exports.getAllLeaves = async (req, res) => {
  try {
    const leaves = await Leave.find()
      .populate("employee", "personal.name personal.email")
      .sort({ createdAt: -1 });

    res.json(leaves);

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


/* ==========================================
   UPDATE LEAVE STATUS (HR / CEO)
========================================== */
exports.updateLeaveStatus = async (req, res) => {
  try {
    const { status } = req.body;

    const leave = await Leave.findById(req.params.id);

    if (!leave) {
      return res.status(404).json({
        message: "Leave not found"
      });
    }

    // Prevent double approval deduction
    if (leave.status === "APPROVED" && status === "APPROVED") {
      return res.json(leave);
    }

    leave.status = status;
    leave.reviewedBy = req.user.id;

    await leave.save();

    // If approved → deduct leave balance
    if (status === "APPROVED") {

      const employee = await Employee.findById(leave.employee);

      if (!employee) {
        return res.status(404).json({
          message: "Employee not found"
        });
      }

      const days =
        Math.ceil(
          (new Date(leave.endDate) - new Date(leave.startDate)) /
          (1000 * 60 * 60 * 24)
        ) + 1;

      // Safety check
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
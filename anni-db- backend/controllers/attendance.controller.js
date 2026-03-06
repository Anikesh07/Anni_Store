const Attendance = require("../models/attendance.model");
const Employee = require("../models/employee.model");

/* ==========================================
   CLOCK IN
========================================== */
exports.clockIn = async (req, res) => {
  try {

    const today = new Date();
    today.setHours(0,0,0,0);

    const existing = await Attendance.findOne({
      employee: req.user.employeeId,
      date: today
    });

    if (existing) {
      return res.status(400).json({
        message: "Already clocked in today"
      });
    }

    const now = new Date();

    const lateThreshold = new Date();
    lateThreshold.setHours(9,30,0,0);

    let status = "PRESENT";

    if (now > lateThreshold) {
      status = "LATE";
    }

    const attendance = await Attendance.create({
      employee: req.user.employeeId,
      date: today,
      clockIn: now,
      status
    });

    res.status(201).json(attendance);

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


/* ==========================================
   CLOCK OUT
========================================== */
exports.clockOut = async (req, res) => {
  try {

    const today = new Date();
    today.setHours(0,0,0,0);

    const attendance = await Attendance.findOne({
      employee: req.user.employeeId,
      date: today
    });

    if (!attendance) {
      return res.status(400).json({
        message: "You have not clocked in today"
      });
    }

    if (attendance.clockOut) {
      return res.status(400).json({
        message: "Already clocked out today"
      });
    }

    const now = new Date();
    attendance.clockOut = now;

    const hours =
      (attendance.clockOut - attendance.clockIn) /
      (1000 * 60 * 60);

    attendance.workingHours = Number(hours.toFixed(2));

    if (attendance.workingHours < 4) {
      attendance.status = "HALF_DAY";
    }

    await attendance.save();

    res.json(attendance);

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


/* ==========================================
   GET MY ATTENDANCE
========================================== */
exports.getMyAttendance = async (req, res) => {
  try {

    const records = await Attendance.find({
      employee: req.user.employeeId
    }).sort({ date: -1 });

    res.json(records);

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


/* ==========================================
   MANAGER: TEAM ATTENDANCE
========================================== */
exports.getTeamAttendance = async (req, res) => {
  try {

    const managerId = req.user.employeeId;

    const team = await Employee.find({
      managerId: managerId
    });

    const ids = team.map(emp => emp._id);

    const records = await Attendance.find({
      employee: { $in: ids }
    }).populate("employee","personal.name");

    res.json(records);

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


/* ==========================================
   HR / OWNER: COMPANY ATTENDANCE
========================================== */
exports.getCompanyAttendance = async (req, res) => {
  try {

    const records = await Attendance.find()
      .populate("employee","personal.name")
      .sort({ date: -1 });

    res.json(records);

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
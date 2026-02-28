const Employee = require("../models/employee.model");

/* ==========================================
   GET EMPLOYEES WITH FILTERING
========================================== */
exports.getEmployees = async (req, res) => {
  try {
    const {
      role,
      department,
      isActive,
      search,
      page = 1,
      limit = 10
    } = req.query;

    const query = {};

    if (role) query["professional.role"] = role;
    if (department) query["professional.department"] = department;
    if (isActive !== undefined)
      query.isActive = isActive === "true";

    if (search) {
      query["personal.name"] = {
        $regex: search,
        $options: "i"
      };
    }

    const skip = (Number(page) - 1) * Number(limit);

    const employees = await Employee.find(query)
      .select("-password -otp")
      .skip(skip)
      .limit(Number(limit))
      .sort({ createdAt: -1 });

    const total = await Employee.countDocuments(query);

    res.json({
      total,
      page: Number(page),
      employees
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/* ==========================================
   GET EMPLOYEE BY ID
========================================== */
exports.getEmployeeById = async (req, res) => {
  try {
    const employee = await Employee.findById(req.params.id)
      .select("-password -otp");

    if (!employee) {
      return res.status(404).json({
        message: "Employee not found"
      });
    }

    res.json(employee);

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/* ==========================================
   GET OWN PROFILE
========================================== */
exports.getOwnProfile = async (user) => {
  if (user.type !== "EMPLOYEE") {
    throw new Error("Only employees can access this endpoint");
  }

  const employee = await Employee.findById(user.id)
    .select("-password -otp");

  if (!employee) {
    throw new Error("Employee not found");
  }

  return employee;
};
const Employee = require("../models/employee.model");

/* ==========================================
   GET EMPLOYEES WITH FILTERING
========================================== */
exports.getEmployees = async (req, res) => {
  try {

    const {
      department,
      employmentType,
      status,
      search,
      page = 1,
      limit = 10
    } = req.query;

    const query = {};

    /* Department filter */
    if (department) {
      query["professional.departmentId"] = department;
    }

    /* Employment type filter */
    if (employmentType) {
      query["professional.employmentType"] = employmentType;
    }

    /* Status filter */
    if (status) {
      query["employmentStatus"] = status;
    }

    /* Search filter */
    if (search) {
      query["personal.name"] = {
        $regex: search,
        $options: "i"
      };
    }

    const skip = (Number(page) - 1) * Number(limit);

    const employees = await Employee.find(query)
      .populate("professional.departmentId")
      .populate("userId", "role email accountStatus")
      .skip(skip)
      .limit(Number(limit))
      .sort({ createdAt: -1 });

    const total = await Employee.countDocuments(query);

    /* Format response so frontend gets role cleanly */

    const formattedEmployees = employees.map(emp => {

      const obj = emp.toObject();

      obj.user = {
        role: emp.userId?.role || null,
        email: emp.userId?.email || null,
        accountStatus: emp.userId?.accountStatus || null
      };

      return obj;
    });

    res.json({
      total,
      page: Number(page),
      employees: formattedEmployees
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
      .populate("professional.departmentId")
      .populate("userId", "role email accountStatus");

    if (!employee) {
      return res.status(404).json({
        message: "Employee not found"
      });
    }

    const obj = employee.toObject();

    obj.user = {
      role: employee.userId?.role || null,
      email: employee.userId?.email || null,
      accountStatus: employee.userId?.accountStatus || null
    };

    res.json(obj);

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
    .populate("professional.departmentId")
    .populate("userId", "role email accountStatus");

  if (!employee) {
    throw new Error("Employee not found");
  }

  const obj = employee.toObject();

  obj.user = {
    role: employee.userId?.role || null,
    email: employee.userId?.email || null,
    accountStatus: employee.userId?.accountStatus || null
  };

  return obj;
};
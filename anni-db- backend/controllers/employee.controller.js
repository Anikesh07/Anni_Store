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

    if (department) {
      query["professional.departmentId"] = department;
    }

    if (employmentType) {
      query["professional.employmentType"] = employmentType;
    }

    if (status) {
      query["employmentStatus"] = status;
    }

    if (search) {
      query["personal.name"] = {
        $regex: search,
        $options: "i"
      };
    }

    const skip = (Number(page) - 1) * Number(limit);

    const employees = await Employee.find(query)
      .populate("professional.departmentId")
      .populate({
        path: "userId",
        populate: {
          path: "roleId",
          select: "name"
        }
      })
      .skip(skip)
      .limit(Number(limit))
      .sort({ createdAt: -1 });

    const total = await Employee.countDocuments(query);

    const formattedEmployees = employees.map(emp => {
      const obj = emp.toObject();

      obj.user = {
        role: emp.userId?.roleId?.name || null,
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
      .populate({
        path: "userId",
        populate: {
          path: "roleId",
          select: "name"
        }
      });

    if (!employee) {
      return res.status(404).json({
        message: "Employee not found"
      });
    }

    const obj = employee.toObject();

    obj.user = {
      role: employee.userId?.roleId?.name || null,
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

  // 🔥 Normalize employeeId (this is the whole issue)
  const employeeId =
    typeof user.employeeId === "object"
      ? user.employeeId?._id
      : user.employeeId;

  console.log("Fetching employeeId:", employeeId);

  if (!employeeId) {
    throw new Error("Employee ID missing in token");
  }

  const employee = await Employee.findById(employeeId)
    .populate("professional.departmentId")
    .populate({
      path: "userId",
      populate: {
        path: "roleId",
        select: "name"
      }
    });

  if (!employee) {
    throw new Error("Employee not found");
  }

  const obj = employee.toObject();

  obj.user = {
    role: employee.userId?.roleId?.name || null,
    email: employee.userId?.email || null,
    accountStatus: employee.userId?.accountStatus || null
  };

  return obj;
};
const express = require("express");
const router = express.Router();

const {
  protect,
  allowRoles
} = require("../services/permission.middleware");

const employeeService = require("../services/employee.service");
const employeeController = require("../controllers/employee.controller");

/* ==========================================
   CREATE EMPLOYEE
   OWNER / HR only
========================================== */
router.post(
  "/",
  protect,
  allowRoles("COMPANY_OWNER", "HR"),
  async (req, res) => {
    try {
      const employee = await employeeService.createEmployee(
        req.user,
        req.body
      );

      res.status(201).json(employee);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }
);

/* ==========================================
   GET EMPLOYEE LIST (COMPANY SCOPED)
========================================== */
router.get(
  "/",
  protect,
  allowRoles("COMPANY_OWNER", "HR", "MANAGER"),
  employeeController.getEmployees
);

/* ==========================================
   GET OWN PROFILE
========================================== */
router.get(
  "/me",
  protect,
  async (req, res) => {
    try {
      const employee = await employeeController.getOwnProfile(req.user);
      res.json(employee);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }
);

/* ==========================================
   GET EMPLOYEE BY ID
========================================== */
router.get(
  "/:id",
  protect,
  allowRoles("COMPANY_OWNER", "HR", "MANAGER"),
  employeeController.getEmployeeById
);

/* ==========================================
   UPDATE EMPLOYEE
========================================== */
router.put(
  "/:id",
  protect,
  allowRoles("COMPANY_OWNER", "HR"),
  async (req, res) => {
    try {
      const updated = await employeeService.updateEmployee(
        req.user,
        req.params.id,
        req.body
      );

      res.json(updated);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }
);

/* ==========================================
   HIRE EMPLOYEE
========================================== */
router.put(
  "/hire/:id",
  protect,
  allowRoles("COMPANY_OWNER", "HR"),
  async (req, res) => {
    try {
      const updated = await employeeService.hireEmployee(
        req.user,
        req.params.id
      );

      res.json(updated);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }
);

/* ==========================================
   TERMINATE EMPLOYEE
========================================== */
router.put(
  "/terminate/:id",
  protect,
  allowRoles("COMPANY_OWNER", "HR"),
  async (req, res) => {
    try {
      const updated = await employeeService.terminateEmployee(
        req.user,
        req.params.id,
        req.body.reason
      );

      res.json(updated);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }
);

/* ==========================================
   BLACKLIST EMPLOYEE
========================================== */
router.put(
  "/blacklist/:id",
  protect,
  allowRoles("COMPANY_OWNER", "HR"),
  async (req, res) => {
    try {
      const updated = await employeeService.blacklistEmployee(
        req.user,
        req.params.id,
        req.body.reason
      );

      res.json(updated);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }
);

/* ==========================================
   REACTIVATE EMPLOYEE
========================================== */
router.put(
  "/reactivate/:id",
  protect,
  allowRoles("COMPANY_OWNER", "HR"),
  async (req, res) => {
    try {
      const updated = await employeeService.reactivateEmployee(
        req.user,
        req.params.id
      );

      res.json(updated);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }
);

/* ==========================================
   UPDATE SALARY
========================================== */
router.put(
  "/salary/:id",
  protect,
  allowRoles("COMPANY_OWNER", "HR"),
  async (req, res) => {
    try {
      const updated = await employeeService.updateSalary(
        req.user,
        req.params.id,
        req.body
      );

      res.json(updated);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }
);


router.get(
  "/team/direct",
  protect,
  allowRoles("COMPANY_OWNER", "HR", "MANAGER"),
  async (req, res) => {

    const team = await employeeService.getDirectReports(
      req.user,
      req.user.employeeId
    );

    res.json(team);
  }
);

router.get(
  "/team/tree",
  protect,
  allowRoles("COMPANY_OWNER", "HR", "MANAGER"),
  async (req, res) => {

    const team = await employeeService.getTeamTree(
      req.user,
      req.user.employeeId
    );

    res.json(team);
  }
);





module.exports = router;



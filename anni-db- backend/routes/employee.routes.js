const express = require("express");
const router = express.Router();

const { protect, allowRoles } = require("../services/permission.middleware");
const employeeService = require("../services/employee.service");
const employeeController = require("../controllers/employee.controller");

/* ==========================================
   CREATE EMPLOYEE (HR / CEO)
========================================== */
router.post(
  "/create",
  protect,
  allowRoles("HR", "CEO"),
  async (req, res) => {
    try {
      const employee = await employeeService.createEmployee(req.body);
      res.status(201).json(employee);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }
);

/* ==========================================
   GET FILTERED LIST (HR / CEO)
========================================== */
router.get(
  "/list",
  protect,
  allowRoles("HR", "CEO"),
  employeeController.getEmployees
);

/* ==========================================
   GET EMPLOYEE PROFILE BY ID
========================================== */
router.get(
  "/:id",
  protect,
  allowRoles("HR", "CEO"),
  employeeController.getEmployeeById
);

/* ==========================================
   UPDATE EMPLOYEE ROLE
========================================== */
router.put(
  "/update-role/:id",
  protect,
  allowRoles("HR", "CEO"),
  async (req, res) => {
    try {
      const updated = await employeeService.updateRole(
        req.params.id,
        req.body.role
      );
      res.json(updated);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }
);

/* ==========================================
   ACTIVATE / DEACTIVATE EMPLOYEE
========================================== */
router.put(
  "/toggle-status/:id",
  protect,
  allowRoles("HR", "CEO"),
  async (req, res) => {
    try {
      const updated = await employeeService.toggleStatus(req.params.id);
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
  "/update-salary/:id",
  protect,
  allowRoles("HR", "CEO"),
  async (req, res) => {
    try {
      const updated = await employeeService.updateSalary(
        req.params.id,
        req.body
      );
      res.json(updated);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }
);

module.exports = router;
const express = require("express");
const router = express.Router();

const { protect, allowRoles } = require("../services/auth.middleware");
const companyService = require("../services/company.service");

/* =========================================
   CREATE COMPANY (SUPER_ADMIN ONLY)
========================================= */

router.post(
  "/",
  protect,
  allowRoles("SUPER_ADMIN"),
  async (req, res) => {
    try {
      const result = await companyService.createCompany(req.body);
      res.status(201).json(result);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }
);

module.exports = router;
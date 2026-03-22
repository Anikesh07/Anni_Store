const express = require("express");
const router = express.Router();

const { protect } = require("../services/permission.middleware");
const Role = require("../models/role.model");

router.get("/", protect, async (req, res) => {
  const roles = await Role.find({
    companyId: req.user.companyId
  });

  res.json(roles);
});

module.exports = router;
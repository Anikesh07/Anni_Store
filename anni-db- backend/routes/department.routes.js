const express = require("express");
const router = express.Router();

const Department = require("../models/department.model");
const { protect } = require("../services/permission.middleware");

/* =========================================
   GET ALL DEPARTMENTS
========================================= */

router.get("/", protect, async (req,res)=>{

try{

const departments = await Department.find({
companyId: req.user.companyId
}).sort({ name:1 });

res.json(departments);

}catch(err){

res.status(500).json({message:err.message});

}

});

module.exports = router;
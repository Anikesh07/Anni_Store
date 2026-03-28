const express = require("express");
const router = express.Router();

const intentController = require("../chatbot/controllers/intent.controller");
const { protect } = require("../services/auth.middleware");

/* =========================================
   INTENT ROUTES (FIXED)
========================================= */

router.get("/", protect, intentController.getAllIntents);
router.post("/", protect, intentController.createIntent);
router.delete("/:id", protect, intentController.deleteIntent);

module.exports = router;
const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");

const intentController = require("../chatbot/controllers/intent.controller");
const { protect } = require("../services/auth.middleware");

/* =========================================
   ROLE CHECK MIDDLEWARE
========================================= */
const requireAdmin = (req, res, next) => {
  if (req.user.role !== "SUPER_ADMIN") {
    return res.status(403).json({ error: "Unauthorized" });
  }
  next();
};

/* =========================================
   VALIDATE OBJECT ID
========================================= */
const validateId = (param) => (req, res, next) => {
  const value = req.params[param];

  if (!mongoose.Types.ObjectId.isValid(value)) {
    return res.status(400).json({ error: `Invalid ${param}` });
  }

  next();
};

/* =========================================
   SAFETY CHECK (IMPORTANT 🔥)
========================================= */
function safeRoute(handler, name) {
  if (typeof handler !== "function") {
    console.error(`❌ ${name} is undefined`);
    return (req, res) =>
      res.status(500).json({ error: `${name} not implemented` });
  }
  return handler;
}

/* =========================================
   INTENT ROUTES
========================================= */

// GET all intents
router.get(
  "/",
  protect,
  safeRoute(intentController.getAllIntents, "getAllIntents")
);

// CREATE intent
router.post(
  "/",
  protect,
  requireAdmin,
  safeRoute(intentController.createIntent, "createIntent")
);

// UPDATE intent
router.put(
  "/:id",
  protect,
  requireAdmin,
  validateId("id"),
  safeRoute(intentController.updateIntent, "updateIntent")
);

// DELETE intent
router.delete(
  "/:id",
  protect,
  requireAdmin,
  validateId("id"),
  safeRoute(intentController.deleteIntent, "deleteIntent")
);

module.exports = router;
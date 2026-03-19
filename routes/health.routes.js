const express = require("express");
const router = express.Router();

const { runHealth, getHealth } = require("../controller/health.controller");
const { authMiddleware } = require("../middlewares/auth.middleware");

router.post("/:id/health-check", authMiddleware, runHealth);
router.get("/:id", authMiddleware, getHealth);

module.exports = router;
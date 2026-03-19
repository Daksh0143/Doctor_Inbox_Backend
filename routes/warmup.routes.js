const express = require("express");
const { authMiddleware } = require("../middlewares/auth.middleware");
const { runWarmups, getWarmupReports } = require("../controller/warmup.controller");
const router = express.Router();


// Run scheduler
router.post("/run", authMiddleware, runWarmups);

// Report
router.get("/mailboxes/:id/warmup-report", authMiddleware, getWarmupReports);

module.exports = router;
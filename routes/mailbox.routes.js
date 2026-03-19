const { getAllMailboxes, pauseMailbox, resumeMailbox, getMailBoxState } = require("../controller/mailbox.controller");
const { authMiddleware } = require("../middlewares/auth.middleware");

const express = require("express");

const router = express.Router();


router.get("/", authMiddleware, getAllMailboxes);
router.post("/:id/pause", authMiddleware, pauseMailbox);
router.post("/:id/resume", authMiddleware, resumeMailbox);
router.get("/:id/state", authMiddleware, getMailBoxState);

module.exports = router;
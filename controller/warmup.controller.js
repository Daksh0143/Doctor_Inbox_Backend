const { mailboxes } = require("../data/mailboxes");
const { scheduleDayPool, evaluateMailboxHealth } = require("../warmup/algogrithm");

function generateMockStats() {
    return {
        bounceRate: Math.random() * 0.05,
        complaintRate: Math.random() * 0.02,
        spamFolderRate: Math.random() * 0.05,
        replyRate: Math.random() * 0.3
    };
}

const SUBJECTS = [
    "Quick question",
    "Following up",
    "Small update",
    "Need your input",
    "Checking this"
];


const runWarmups = (req, res) => {
    try {
        const date = new Date();

        const jobs = scheduleDayPool(mailboxes, date);

        res.json({
            message: "Warmup scheduled successfully",
            totalJobs: jobs.length,
            jobs
        });

    } catch (err) {
        res.status(500).json({ message: "Error running warmup" });
    }
}

const getWarmupReports = (req, res) => {
    try {
        const { id } = req.params;
        const { date } = req.query;

        if (!date) {
            return res.status(400).json({ message: "Date is required" });
        }

        const selectedDate = new Date(date);

        const mailbox = mailboxes.find(m => m.id === id);

        if (!mailbox) {
            return res.status(404).json({ message: "Mailbox not found" });
        }

        // 🔹 Generate jobs
        const jobs = scheduleDayPool(mailboxes, selectedDate);

        // 🔹 Filter related jobs
        const relatedJobs = jobs.filter(
            job => job.fromId === id || job.toId === id
        );

        const totalSent = relatedJobs.filter(j => j.fromId === id).length;
        const totalReceived = relatedJobs.filter(j => j.toId === id).length;

        // 🔹 Pair list
        const pairs = relatedJobs.map(job => {
            const from = mailboxes.find(m => m.id === job.fromId);
            const to = mailboxes.find(m => m.id === job.toId);

            return {
                fromEmail: from.email,
                toEmail: to.email,
                sentAt: job.scheduledAt,
                status: Math.random() > 0.1 ? "sent" : "failed"
            };
        });

        // 🔹 Health
        const stats = generateMockStats();

        const healthResult = evaluateMailboxHealth({
            ...stats,
            dayNumber: mailbox.dayNumber
        });

        // 🔹 Subjects
        const sampleSubjects = SUBJECTS
            .sort(() => 0.5 - Math.random())
            .slice(0, 3);

        res.json({
            totalSent,
            totalReceived,
            pairs,
            health: {
                ...stats,
                action: healthResult.action,
                reason: healthResult.reason
            },
            dayNumber: mailbox.dayNumber,
            dailyTarget: mailbox.dailyTarget,
            sampleSubjects
        });

    } catch (err) {
        console.log("Internal Server Error:-", err);
        res.status(500).json({ message: "Internal server error" });
    }
}

module.exports = { runWarmups, getWarmupReports }
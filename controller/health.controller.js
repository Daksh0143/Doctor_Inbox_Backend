const { mailboxes } = require("../data/mailboxes");
const { runHealthCheck } = require("../health/checker");

const runHealth = async (req, res) => {
    try {
        const { id } = req.params;

        console.log("Running health check for mailbox ID:", id);

        const mailbox = mailboxes.find(m => m.id === id);

        if (!mailbox) {
            return res.status(404).json({ message: "Mailbox not found" });
        }

        const domain = mailbox.email.split("@")[1];

        const result = await runHealthCheck(domain);

        mailbox.health = result;

        // 🔹 Update status
        if (result.score < 60) {
            mailbox.status = "pending";
        } else {
            mailbox.status = "active";
        }

        res.json(result);


    } catch (error) {
        console.log("Error running health check:", error);
        return res.status(500).json({ message: 'Internal server error' });
    }
}

const getHealth = (req, res) => {
    try {
        const { id } = req.params;

        const mailbox = mailboxes.find(m => m.id === id);

        if (!mailbox) {
            return res.status(404).json({ message: "Mailbox not found" });
        }

        res.json(mailbox.health || {});
    } catch (error) {
        return res.status(500).json({ message: 'Internal server error' });
    }
}


module.exports = {
    runHealth,
    getHealth
}
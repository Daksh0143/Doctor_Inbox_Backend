const { mailboxes } = require("../data/mailboxes");

const getAllMailboxes = (req, res) => {
    try {
        return res.json({ mailboxes });
    } catch (error) {
        return res.status(500).json({ message: 'Internal server error' });
    }
}

const pauseMailbox = (req, res) => {
    try {
        const { id } = req.params;

        if (!id) {
            return res.status(400).json({ message: "Mailbox ID is required" });
        }

        const mailbox = mailboxes.find(mailbox => mailbox.id === id);

        if (!mailbox) {
            return res.status(404).json({ message: "Mailbox not found" });
        }
        mailbox.status = "paused";
        return res.json({ message: "Mailbox paused successfully", mailbox });
    } catch (error) {
        return res.status(500).json({ message: 'Internal server error' });
    }
}

const resumeMailbox = (req, res) => {
    try {
        const { id } = req.params;

        if (!id) {
            return res.status(400).json({ message: "Mailbox ID is required" });
        }

        const mailbox = mailboxes.find(m => m.id === id);

        if (!mailbox) {
            return res.status(404).json({ message: "Mailbox not found" });
        }

        mailbox.status = "active";

        res.json({ message: "Mailbox resumed successfully", mailbox });
    } catch (error) {
        return res.status(500).json({ message: 'Internal server error' });
    }
}

const getMailBoxState = (req, res) => {
    try {
        const { id } = req.params;

        if (!id) {
            return res.status(400).json({ message: "Mailbox ID is required" });
        }
        const mailbox = mailboxes.find(m => m.id === id);

        if (!mailbox) {
            return res.status(404).json({ message: "Mailbox not found" });
        }

        const dailySends = mailbox.dailySends;

        const total = dailySends.reduce((sum, val) => sum + val, 0);

        const average = total / dailySends.length;

        res.json({
            dailySends,
            total,
            average
        });
    } catch (error) {
        return res.status(500).json({ message: 'Internal server error' });
    }
}

module.exports = { getAllMailboxes, pauseMailbox, resumeMailbox, getMailBoxState }

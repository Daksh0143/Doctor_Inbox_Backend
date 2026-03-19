let mailboxes = [
    {
        id: "1",
        email: "user1@gmail.com",
        provider: "gmail",

        // 🔹 Warmup status
        status: "pending", // pending | active | paused

        // 🔹 Warmup progress
        dayNumber: 5,
        dailyTarget: 10,

        // 🔹 Last 7 days sending stats
        dailySends: [5, 6, 7, 8, 6, 7, 9],

        // 🔹 Health check result (initially empty)
        health: {
            score: 0,
            checks: {
                spf: { pass: false, detail: "" },
                dkim: { pass: false, selector: "", detail: "" },
                dmarc: { pass: false, policy: "", detail: "" },
                mx: { pass: false, records: [], smtpReachable: false },
                domainBlacklist: { pass: false, rbls: {} },
                ipBlacklist: { pass: false, ip: "", rbls: {} },
                tls: { pass: false, starttlsAdvertised: false },
                domainAge: { pass: false, ageInDays: 0, detail: "" }
            },
            problems: [],
            checkedAt: null
        }
    },
    {
        id: "2",
        email: "user2@outlook.com",
        provider: "outlook",

        status: "pending",

        dayNumber: 3,
        dailyTarget: 6,

        dailySends: [2, 3, 4, 3, 2, 3, 4],

        health: {
            score: 0,
            checks: {
                spf: { pass: false, detail: "" },
                dkim: { pass: false, selector: "", detail: "" },
                dmarc: { pass: false, policy: "", detail: "" },
                mx: { pass: false, records: [], smtpReachable: false },
                domainBlacklist: { pass: false, rbls: {} },
                ipBlacklist: { pass: false, ip: "", rbls: {} },
                tls: { pass: false, starttlsAdvertised: false },
                domainAge: { pass: false, ageInDays: 0, detail: "" }
            },
            problems: [],
            checkedAt: null
        }
    },
    {
        id: "3",
        email: "user3@yahoo.com",
        provider: "other",

        status: "pending",

        dayNumber: 2,
        dailyTarget: 5,

        dailySends: [1, 2, 2, 3, 2, 3, 3],

        health: {
            score: 0,
            checks: {
                spf: { pass: false, detail: "" },
                dkim: { pass: false, selector: "", detail: "" },
                dmarc: { pass: false, policy: "", detail: "" },
                mx: { pass: false, records: [], smtpReachable: false },
                domainBlacklist: { pass: false, rbls: {} },
                ipBlacklist: { pass: false, ip: "", rbls: {} },
                tls: { pass: false, starttlsAdvertised: false },
                domainAge: { pass: false, ageInDays: 0, detail: "" }
            },
            problems: [],
            checkedAt: null
        }
    }
];

module.exports = { mailboxes };
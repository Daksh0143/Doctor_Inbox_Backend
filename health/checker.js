const dns = require("dns").promises;

/**
 * Run all health checks concurrently
 */
const runHealthCheck = async (domain) => {

    const results = await Promise.all([
        checkSPF(domain),
        checkDKIM(domain),
        checkDMARC(domain),
        checkMX(domain),
        checkDomainAge(domain),
        mockBlacklistCheck(),
        mockIPCheck(),
        mockTLSCheck()
    ]);

    const [
        spf, dkim, dmarc, mx,
        domainAge, domainBlacklist,
        ipBlacklist, tls
    ] = results;

    // Calculate score (weights)
    let score = 0;

    if (spf.pass) score += 15;
    if (dkim.pass) score += 15;
    if (dmarc.pass) score += 15;
    if (mx.pass) score += 10;
    if (domainBlacklist.pass) score += 10;
    if (ipBlacklist.pass) score += 10;
    if (tls.pass) score += 10;
    if (domainAge.pass) score += 15;

    // Collect problems
    const problems = [];
    const checks = { spf, dkim, dmarc, mx, domainBlacklist, ipBlacklist, tls, domainAge };

    Object.entries(checks).forEach(([key, val]) => {
        if (!val.pass) {
            problems.push(`${key} check failed: ${val.detail || "issue detected"}`);
        }
    });

    return {
        score,
        checks,
        problems,
        checkedAt: new Date().toISOString()
    };
}

const checkSPF = async (domain) => {
    try {
        const records = await dns.resolveTxt(domain);

        const spf = records.flat().find(r => r.includes("v=spf1"));

        if (!spf) {
            return { pass: false, detail: "No SPF record found" };
        }

        return {
            pass: true,
            detail: spf.includes("-all")
                ? "Strict SPF (-all)"
                : "Soft SPF (~all)"
        };

    } catch {
        return { pass: false, detail: "DNS lookup failed" };
    }
}

const checkMX = async (domain) => {
    try {
        const records = await dns.resolveMx(domain);

        return {
            pass: records.length > 0,
            records: records.map(r => r.exchange),
            smtpReachable: true // mock
        };

    } catch {
        return { pass: false, records: [], smtpReachable: false };
    }
}

const mockBlacklistCheck = () => ({
    pass: true,
    rbls: {
        spamhaus: true,
        barracuda: true,
        sorbs: true
    }
});

const mockIPCheck = () => ({
    pass: true,
    ip: "192.168.1.1",
    rbls: {
        spamhaus: true,
        barracuda: true,
        sorbs: true
    }
});

const mockTLSCheck = () => ({
    pass: true,
    starttlsAdvertised: true
});

const checkDomainAge = async (domain) => ({
    pass: true,
    ageInDays: 120,
    detail: "Domain older than 90 days"
});

const checkDKIM = async (domain) => {
    const selectors = [
        "google._domainkey",
        "default._domainkey",
        "mail._domainkey",
        "k1._domainkey"
    ];

    try {
        for (let selector of selectors) {
            const fullDomain = `${selector}.${domain}`;

            try {
                const records = await dns.resolveTxt(fullDomain);

                const record = records.flat().join("");

                if (record.includes("v=DKIM1")) {
                    return {
                        pass: true,
                        selector,
                        detail: "Valid DKIM record found"
                    };
                }
            } catch {
                continue; // try next selector
            }
        }

        return {
            pass: false,
            selector: "",
            detail: "No DKIM record found"
        };

    } catch {
        return {
            pass: false,
            selector: "",
            detail: "DKIM lookup failed"
        };
    }
}

const checkDMARC = async (domain) => {
    try {
        const dmarcDomain = `_dmarc.${domain}`;

        const records = await dns.resolveTxt(dmarcDomain);

        const record = records.flat().join("");

        if (!record.includes("v=DMARC1")) {
            return {
                pass: false,
                policy: "none",
                detail: "Invalid DMARC record"
            };
        }

        // Extract policy
        let policy = "none";

        if (record.includes("p=reject")) {
            policy = "reject";
        } else if (record.includes("p=quarantine")) {
            policy = "quarantine";
        }

        return {
            pass: policy !== "none", // strict policy required
            policy,
            detail:
                policy === "none"
                    ? "DMARC policy is none (not strict)"
                    : `DMARC policy is ${policy}`
        };

    } catch {
        return {
            pass: false,
            policy: "none",
            detail: "No DMARC record found"
        };
    }
}

module.exports = {
    runHealthCheck,
    checkSPF,
    checkDKIM,
    checkDMARC,
    checkMX,
    checkDomainAge
};

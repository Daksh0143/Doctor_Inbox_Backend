const getDailyTarget = (dayNumber, provider) => {

    // 🔹 Day 1 base volume
    // We start with 5 emails to avoid ESP suspicion (safe for new mailboxes)
    const BASE_VOLUME = 5;

    let growthRate;
    let maxLimit;

    // 🔹 Provider-specific configuration
    switch (provider) {
        case "gmail":
            growthRate = 1.5;   // Gmail tolerates slightly faster ramp-up
            maxLimit = 100;
            break;

        case "outlook":
            growthRate = 1.35;  // More conservative than Gmail
            maxLimit = 80;
            break;

        default:
            growthRate = 1.25;  // Unknown providers → safest approach
            maxLimit = 60;
    }

    // 🔹 Exponential growth formula
    let target = BASE_VOLUME * Math.pow(growthRate, dayNumber - 1);

    // 🔹 Round to integer
    target = Math.floor(target);

    // 🔹 Enforce ceiling (never exceed limit)
    return Math.min(target, maxLimit);
}

const getSendSchedule = (targetCount, date) => {
    if (!targetCount || targetCount <= 0) return [];

    const schedule = [];

    // 🔹 Waking hours: 9 AM to 6 PM
    const startHour = 9;
    const endHour = 18;

    // Total available minutes
    const totalMinutes = (endHour - startHour) * 60;

    // 🔹 Minimum gap between emails (in minutes)
    const minGap = 5;

    // Base gap (dynamic spacing)
    const baseGap = Math.floor(totalMinutes / targetCount);

    let currentMinutes = 0;

    for (let i = 0; i < targetCount; i++) {
        // 🔹 Add randomness (jitter)
        const jitter = Math.floor(Math.random() * 10); // 0–9 minutes

        let minutesToAdd = baseGap + jitter;

        // Ensure minimum gap
        if (minutesToAdd < minGap) {
            minutesToAdd = minGap;
        }

        currentMinutes += minutesToAdd;

        // Prevent overflow beyond endHour
        if (currentMinutes > totalMinutes) {
            currentMinutes = totalMinutes - Math.floor(Math.random() * 10);
        }

        const hours = startHour + Math.floor(currentMinutes / 60);
        const minutes = currentMinutes % 60;

        const scheduledTime = new Date(date);
        scheduledTime.setHours(hours);
        scheduledTime.setMinutes(minutes);
        scheduledTime.setSeconds(Math.floor(Math.random() * 60)); // extra randomness

        schedule.push(scheduledTime);
    }

    return schedule;
}

const evaluateMailboxHealth = (stats) => {
    const {
        bounceRate,
        complaintRate,
        spamFolderRate,
        replyRate,
        dayNumber
    } = stats;

    // 🔹 Stage-based thresholds
    let thresholds;

    if (dayNumber <= 7) {
        // EARLY STAGE (very strict)
        thresholds = {
            bounce: 0.05,        // >5% → pause
            complaint: 0.02,     // >2% → pause
            spam: 0.05,          // >5% → pause
            reduceBounce: 0.03,  // >3% → reduce
            reduceComplaint: 0.01
        };
    } else if (dayNumber <= 14) {
        // MID STAGE
        thresholds = {
            bounce: 0.08,
            complaint: 0.03,
            spam: 0.08,
            reduceBounce: 0.05,
            reduceComplaint: 0.02
        };
    } else {
        // MATURE STAGE (more tolerant)
        thresholds = {
            bounce: 0.1,
            complaint: 0.05,
            spam: 0.1,
            reduceBounce: 0.07,
            reduceComplaint: 0.03
        };
    }

    // 🔴 HARD FAIL → PAUSE
    if (bounceRate > thresholds.bounce) {
        return {
            action: "pause",
            reason: `High bounce rate (${(bounceRate * 100).toFixed(1)}%) exceeds safe threshold`
        };
    }

    if (complaintRate > thresholds.complaint) {
        return {
            action: "pause",
            reason: `High complaint rate (${(complaintRate * 100).toFixed(1)}%) indicates spam complaints`
        };
    }

    if (spamFolderRate > thresholds.spam) {
        return {
            action: "pause",
            reason: `High spam folder placement (${(spamFolderRate * 100).toFixed(1)}%)`
        };
    }

    // 🟡 WARNING → REDUCE
    if (
        bounceRate > thresholds.reduceBounce ||
        complaintRate > thresholds.reduceComplaint
    ) {
        return {
            action: "reduce",
            reason: `Moderate risk detected (bounce/complaint slightly elevated)`
        };
    }

    // 🟢 POSITIVE SIGNAL → BOOST CONFIDENCE
    if (replyRate > 0.25) {
        return {
            action: "continue",
            reason: `Strong engagement (${(replyRate * 100).toFixed(1)}% replies) — safe to ramp up`
        };
    }

    // 🟢 DEFAULT HEALTHY
    return {
        action: "continue",
        reason: "Mailbox health is stable with no risk signals"
    };
}

const selectWarmupPairs = (mailboxes) => {

    // 🔹 Helper: extract domain
    const getDomain = (email) => email.split("@")[1];

    // 🔹 Shuffle for rotation (avoids same pairs daily)
    const shuffled = [...mailboxes].sort(() => Math.random() - 0.5);

    const pairs = [];

    // Track how many emails each mailbox has already assigned
    const senderUsage = {};

    shuffled.forEach(m => {
        senderUsage[m.id] = 0;
    });

    // 🔹 Separate cross-provider and same-provider pairs
    const crossPairs = [];
    const samePairs = [];

    for (let i = 0; i < shuffled.length; i++) {
        for (let j = 0; j < shuffled.length; j++) {

            if (i === j) continue; // ❌ no self

            const from = shuffled[i];
            const to = shuffled[j];

            // ❌ skip same domain
            if (getDomain(from.email) === getDomain(to.email)) continue;

            const pair = { from, to };

            if (from.provider !== to.provider) {
                crossPairs.push(pair); // ✅ preferred
            } else {
                samePairs.push(pair);
            }
        }
    }

    // 🔹 Prioritize cross-provider first
    const allPairs = [...crossPairs, ...samePairs];

    for (const pair of allPairs) {
        const { from, to } = pair;

        // Skip if sender reached limit
        if (senderUsage[from.id] >= from.dailyTarget) continue;

        // Remaining capacity
        const remaining = from.dailyTarget - senderUsage[from.id];

        // Assign sendCount (small chunk for distribution)
        const sendCount = Math.min(remaining, 3); // max 3 per pair

        if (sendCount <= 0) continue;

        pairs.push({
            from,
            to,
            sendCount
        });

        senderUsage[from.id] += sendCount;
    }

    return pairs;
}

const scheduleDayPool = (mailboxes, date) => {

    // 🔹 Step 1: Filter active + healthy mailboxes
    const activeMailboxes = mailboxes.filter(
        m => m.status === "active" && m.health?.score  >= 60
    );

    // 🔹 Step 2: Generate pairs
    const pairs = selectWarmupPairs(activeMailboxes);

    const jobs = [];

    // Track sender usage to ensure dailyTarget not exceeded
    const senderUsage = {};
    activeMailboxes.forEach(m => {
        senderUsage[m.id] = 0;
    });

    // 🔹 Step 3: Process each pair
    for (const pair of pairs) {
        const { from, to, sendCount } = pair;

        // Remaining capacity
        const remaining = from.dailyTarget - senderUsage[from.id];

        if (remaining <= 0) continue;

        const finalSendCount = Math.min(sendCount, remaining);

        // 🔹 Generate schedule timestamps
        const timestamps = getSendSchedule(finalSendCount, date);

        timestamps.forEach(time => {
            jobs.push({
                fromId: from.id,
                toId: to.id,
                scheduledAt: time,
                status: "pending"
            });
        });

        senderUsage[from.id] += finalSendCount;
    }

    // 🔹 Step 4: Ensure total jobs match expected count
    const expectedTotal = activeMailboxes.reduce(
        (sum, m) => sum + m.dailyTarget,
        0
    );

    let currentTotal = jobs.length;

    // 🔹 Fill remaining jobs if needed
    if (currentTotal < expectedTotal) {
        for (const mailbox of activeMailboxes) {
            while (
                senderUsage[mailbox.id] < mailbox.dailyTarget &&
                currentTotal < expectedTotal
            ) {
                const timestamps = getSendSchedule(1, date);

                jobs.push({
                    fromId: mailbox.id,
                    toId: mailbox.id, // fallback (rare case)
                    scheduledAt: timestamps[0],
                    status: "pending"
                });

                senderUsage[mailbox.id]++;
                currentTotal++;
            }
        }
    }

    return jobs;
}



module.exports = {
    getDailyTarget,
    getSendSchedule,
    evaluateMailboxHealth,
    selectWarmupPairs,
    scheduleDayPool
};
import { pool } from "../db/neon.js";

export async function scanEntry(value, type) {
  // Step 1 — Check database for exact match
  const dbResult = await pool.query(
    `SELECT * FROM scam_entries 
     WHERE value = $1 AND type = $2`,
    [value, type],
  );

  if (dbResult.rows.length > 0) {
    const entry = dbResult.rows[0];
    return {
      value,
      type,
      riskLevel: entry.risk_level,
      riskScore: entry.risk_level === "SCAM" ? 95 : 60,
      reason: entry.reason,
      source: "database",
      verified: entry.verified,
    };
  }

  // Step 2 — Pattern matching for suspicious patterns
  const patternResult = checkPatterns(value, type);
  if (patternResult.isSuspicious) {
    return {
      value,
      type,
      riskLevel: "SUSPICIOUS",
      riskScore: patternResult.score,
      reason: patternResult.reason,
      source: "pattern-match",
      verified: false,
    };
  }

  // Step 3 — Not found anywhere — return SAFE
  return {
    value,
    type,
    riskLevel: "SAFE",
    riskScore: 5,
    reason: "No fraud reports found. Always verify before paying.",
    source: "clean",
    verified: false,
  };
}

function checkPatterns(value, type) {
  if (type === "upi") {
    const scamKeywords = [
      "support",
      "helpdesk",
      "help",
      "refund",
      "cashback",
      "kyc",
      "verify",
      "update",
      "care",
      "service",
      "customer",
      "agent",
      "reward",
      "prize",
      "lucky",
    ];

    const lowerValue = value.toLowerCase();
    const foundKeyword = scamKeywords.find((k) => lowerValue.includes(k));

    if (foundKeyword) {
      return {
        isSuspicious: true,
        score: 65,
        reason: `UPI ID contains suspicious keyword "${foundKeyword}". Legitimate businesses don't use this pattern.`,
      };
    }

    // Check for number-heavy IDs (scammers use random numbers)
    const numberCount = (value.match(/\d/g) || []).length;
    if (numberCount > 6) {
      return {
        isSuspicious: true,
        score: 55,
        reason:
          "UPI ID has too many numbers — common in temporary scam accounts.",
      };
    }
  }

  if (type === "phone") {
    // Check for known scam prefixes
    const scamPrefixes = ["1800", "1860", "140"];
    const startsWithScam = scamPrefixes.some((p) => value.startsWith(p));
    if (startsWithScam) {
      return {
        isSuspicious: true,
        score: 70,
        reason: "Phone number matches known scam call center prefix.",
      };
    }
  }

  return { isSuspicious: false };
}

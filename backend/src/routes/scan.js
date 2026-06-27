import { Router } from "express";
import { scanEntry } from "../services/scanner.js";

export const scanRouter = Router();

// POST /api/scan
// Body: { value: "paytm-support@ybl", type: "upi" }
scanRouter.post("/scan", async (req, res) => {
  try {
    const { value, type } = req.body;

    // Basic validation
    if (!value || !type) {
      return res.status(400).json({
        error: "Missing required fields: value and type",
      });
    }

    if (!["upi", "phone", "url"].includes(type)) {
      return res.status(400).json({
        error: "Type must be upi, phone, or url",
      });
    }

    const result = await scanEntry(value.trim().toLowerCase(), type);
    res.json(result);
  } catch (err) {
    console.error("Scan error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// GET /api/reports/recent
scanRouter.get("/reports/recent", async (req, res) => {
  try {
    const { pool } = await import("../db/neon.js");
    const result = await pool.query(
      `SELECT value, type, risk_level, reason, created_at 
       FROM scam_entries 
       WHERE verified = true 
       ORDER BY created_at DESC 
       LIMIT 10`,
    );
    res.json(result.rows);
  } catch (err) {
    console.error("Recent reports error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});
// POST /api/report
// Body: { value: "scammer@ybl", type: "upi", description: "..." }
scanRouter.post("/report", async (req, res) => {
  try {
    const { value, type, description } = req.body;

    if (!value || !type) {
      return res.status(400).json({
        error: "Missing required fields: value and type",
      });
    }

    const { pool } = await import("../db/neon.js");

    // Save the report
    await pool.query(
      `INSERT INTO reports (type, value, description) 
       VALUES ($1, $2, $3)`,
      [type, value.trim().toLowerCase(), description || null],
    );

    // Check how many times this has been reported
    const countResult = await pool.query(
      `SELECT COUNT(*) FROM reports WHERE value = $1`,
      [value.trim().toLowerCase()],
    );

    const reportCount = parseInt(countResult.rows[0].count);

    // If reported 3+ times, auto-add to scam_entries
    if (reportCount >= 3) {
      await pool.query(
        `INSERT INTO scam_entries (type, value, risk_level, reason, source, verified)
         VALUES ($1, $2, 'SUSPICIOUS', $3, 'user-report', false)
         ON CONFLICT (value) DO NOTHING`,
        [
          type,
          value.trim().toLowerCase(),
          `Reported ${reportCount} times by users`,
        ],
      );
    }

    res.json({
      success: true,
      message: "Report submitted successfully",
      totalReports: reportCount,
    });
  } catch (err) {
    console.error("Report error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// GET /api/stats
scanRouter.get("/stats", async (req, res) => {
  try {
    const { pool } = await import("../db/neon.js");

    const totalScams = await pool.query(
      `SELECT COUNT(*) FROM scam_entries WHERE risk_level = 'SCAM'`,
    );

    const totalSuspicious = await pool.query(
      `SELECT COUNT(*) FROM scam_entries WHERE risk_level = 'SUSPICIOUS'`,
    );

    const totalReports = await pool.query(`SELECT COUNT(*) FROM reports`);

    const recentActivity = await pool.query(
      `SELECT value, type, created_at FROM reports 
       ORDER BY created_at DESC LIMIT 5`,
    );

    res.json({
      totalScamsBlocked: parseInt(totalScams.rows[0].count),
      totalSuspicious: parseInt(totalSuspicious.rows[0].count),
      totalUserReports: parseInt(totalReports.rows[0].count),
      recentActivity: recentActivity.rows,
    });
  } catch (err) {
    console.error("Stats error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

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

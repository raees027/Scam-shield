import { pool } from "./src/db/neon.js";

const result = await pool.query("SELECT * FROM scam_entries");
console.log("Connected! Scam entries found:", result.rows.length);
console.log(result.rows);
pool.end();

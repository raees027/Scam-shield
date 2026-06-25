import express from "express";
import cors from "cors";
import helmet from "helmet";
import dotenv from "dotenv";
import { scanRouter } from "./routes/scan.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Security middleware
app.use(helmet());
app.use(cors());
app.use(express.json());

// Routes
app.use("/api", scanRouter);

// Health check — lets you verify server is running
app.get("/", (req, res) => {
  res.json({ status: "ScamShield API is running 🛡️" });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

import dotenv from "dotenv";
dotenv.config();

/*console.log("RAW GMAIL_ACCOUNTS =", process.env.GMAIL_ACCOUNTS);
*/
import express from "express";
import helmet from "helmet";
import crypto from "crypto";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";

import progressRoutes from "./routes/progress.js";
import { enqueue, pauseQueue, resumeQueue, stopQueue } from "./mailer/queue.js";
import { sendMail } from "./mailer/sendMail.js";
import { emailSchema } from "./validation/emailSchema.js";

const app = express();

/* ---------- MIDDLEWARE ---------- */
app.use(express.json());
app.use(helmet());
app.use(cors());

/* ---------- API ROUTES ---------- */
app.use("/api", progressRoutes);

/* ---------- QUEUE CONTROLS ---------- */
app.post("/api/pause", (req, res) => {
  pauseQueue();
  res.json({ status: "paused" });
});

app.post("/api/resume", (req, res) => {
  resumeQueue();
  res.json({ status: "resumed" });
});

app.post("/api/stop", (req, res) => {
  stopQueue();
  res.json({ status: "stopped" });
});

/* ---------- BULK SEND ---------- */
app.post("/api/bulk-send", (req, res) => {
  const {
    recipients,
    subject,
    body,
    format,
    fromName,
    delayMin = 1,
    delayMax = 60
  } = req.body;

  if (!Array.isArray(recipients) || recipients.length === 0) {
    return res.status(400).json({ error: "Recipients required" });
  }

  const campaignId = `cmp_${Date.now()}`;

  recipients.forEach(to =>
    enqueue({
      campaignId,
      to,
      subject,
      body,
      format,
      fromName,
      delayMin,
      delayMax
    })
  );

  res.json({
    campaignId,
    queued: recipients.length
  });
});

/* ---------- SINGLE SEND ---------- */
app.post("/api/send-email", async (req, res) => {
  const { error, value } = emailSchema.validate(req.body);
  if (error) return res.status(400).json({ error: error.message });

  try {
    await sendMail(value);
    res.json({ success: true });
  } catch (e) {
    res.status(500).json({ error: "Mail failed" });
  }
});

/* ---------- HEALTH CHECK (Docker / Compose) ---------- */
app.get("/api/health", (req, res) => {
  res.json({ status: "ok" });
});

/* ---------- SERVE FRONTEND (Docker) ---------- */
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const frontendPath = path.join(__dirname, "../frontend/dist");

app.use(express.static(frontendPath));

/**
 * FALLBACK (Express 5 compatible)
 * MUST be last route
 */
app.get(/.*/, (req, res) => {
  res.status(404).json({ error: "Not found" });
});

const PORT = process.env.PORT || 4000;

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Backend running on port ${PORT}`);
});


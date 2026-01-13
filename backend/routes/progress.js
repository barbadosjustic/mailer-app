import express from "express";
import { progressEvents } from "../mailer/progressEvents.js";

const router = express.Router();

router.get("/progress/:campaignId", (req, res) => {
  const { campaignId } = req.params;

  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  res.flushHeaders?.();

  const onUpdate = (payload) => {
    if (payload.campaignId !== campaignId) return;

    res.write(`event: update\n`);
    res.write(`data: ${JSON.stringify(payload)}\n\n`);
  };

  progressEvents.on("update", onUpdate);

  req.on("close", () => {
    progressEvents.off("update", onUpdate);
  });
});

export default router;

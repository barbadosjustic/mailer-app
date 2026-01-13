import { campaigns } from "../mailer/campaigns.js";
import { enqueue } from "../mailer/queue.js";
import crypto from "crypto";

const campaignId = crypto.randomUUID();

campaigns.set(campaignId, {
  id: campaignId,
  total: recipients.length,
  sent: 0,
  failed: 0,
  status: "sending"
});

for (const email of recipients) {
  enqueue({
    to: email,
    subject,
    body,
    fromName,
    delayMin,
    delayMax,
    campaignId
  });
}

res.json({
  queued: recipients.length,
  campaignId
});


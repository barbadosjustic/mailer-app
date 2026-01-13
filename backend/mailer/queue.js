import { sendMail } from "./sendMail.js";
import { progressEvents } from "./progressEvents.js";

const queue = [];

let running = false;
let paused = false;
let stopped = false;

let sent = 0;
let failed = 0;
let currentCampaignId = null;

/* ---------- STATS ---------- */
export function getStats() {
  return {
    queued: queue.length,
    sent,
    failed,
    running,
    paused
  };
}

function randomDelay(min = 1, max = 60) {
  const seconds =
    Math.floor(Math.random() * (max - min + 1)) + min;
  return seconds * 1000;
}

/* ---------- QUEUE PROCESSOR ---------- */
async function processQueue() {
  if (running) return;
  running = true;
  stopped = false;

  while (queue.length) {
    if (stopped) break;

    while (paused) {
      await new Promise(r => setTimeout(r, 300));
    }

    const job = queue.shift();

    try {
      await sendMail(job);
      sent++;

      // 🔥 UI UPDATE EVENT
      progressEvents.emit("update", {
        campaignId: job.campaignId,
        to: job.to,
        sent
      });

    } catch (e) {
      failed++;
    }

    const delay = randomDelay(job.delayMin, job.delayMax);
    await new Promise(r => setTimeout(r, delay));
  }

  running = false;

  // 🔥 CAMPAIGN COMPLETE EVENT
  if (currentCampaignId && !stopped) {
    progressEvents.emit("update", {
      campaignId: currentCampaignId,
      status: "completed"
    });
  }
}

/* ---------- ENQUEUE ---------- */
export function enqueue(job) {
  currentCampaignId = job.campaignId;
  queue.push(job);
  processQueue();
}

/* ---------- CONTROLS ---------- */
export function pauseQueue() {
  paused = true;
}

export function resumeQueue() {
  if (!paused) return;
  paused = false;
  processQueue();
}

export function stopQueue() {
  stopped = true;
  paused = false;
  queue.length = 0;
  running = false;
}


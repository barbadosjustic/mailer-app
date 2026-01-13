import { progressEvents } from "../progress/events.js";

progressEvents.emit("update", {
  campaignId,
  type: "sent", // or "failed"
  email
});


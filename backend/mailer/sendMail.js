import { getTransport } from "./transports.js";
import { progressEvents } from "./events.js";

export async function sendMail(payload) {
  const {
    to,
    subject,
    body,
    format = "text",
    fromName,
    campaignId
  } = payload;

  if (!to) {
    throw new Error("Recipient (to) missing");
  }

  const transport = getTransport();

  const mail = {
    from: fromName
      ? `"${fromName}" <${transport.options.auth.user}>`
      : transport.options.auth.user,
    to,
    subject,
    ...(format === "html" ? { html: body } : { text: body })
  };

  await transport.sendMail(mail);

  // 🔥 THIS is what your UI needs
  if (campaignId) {
    console.log("📤 EMIT sent", { campaignId, to });
    progressEvents.emit("update", {
      campaignId,
      to,
      status: "sent"
    });
  }
}


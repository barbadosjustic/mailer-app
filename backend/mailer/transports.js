import "dotenv/config";
import nodemailer from "nodemailer";

const raw = process.env.GMAIL_ACCOUNTS;

if (!raw) {
  throw new Error("GMAIL_ACCOUNTS missing");
}

let accounts;
try {
  accounts = JSON.parse(raw);
} catch (err) {
  console.error("RAW GMAIL_ACCOUNTS =", raw);
  throw new Error("Configuration Error: GMAIL_ACCOUNTS is not valid JSON");
}

let index = 0;

export function getTransport() {
  const acc = accounts[index];
  index = (index + 1) % accounts.length;

  return nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: acc.user,
      pass: acc.pass
    }
  });
}


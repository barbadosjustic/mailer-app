export function  parseEmails(text) {
  return text
    .split(/\r?\n/)
    .map(e => e.trim())
    .filter(Boolean);
}


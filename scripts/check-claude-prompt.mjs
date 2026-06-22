// Verifies the "Write with claude.ai" button copies a correct prompt. Dev server
// up, auth off. Stubs clipboard + window.open, clicks the button, checks the text.
import puppeteer from "puppeteer";

const payload = {
  week: { startDate: "2026-06-22", endDate: "2026-06-28", theme: "Matcha Studio" },
  events: [
    { name: "Sip & Paint Sunset", typeSlug: "sip", date: "2026-06-25", time: "6:00 PM", location: "NomadGao Backyard, Lower Dharamkot", price: "₹600", description: "Brushes, canvas and a sundowner." },
  ],
};

const browser = await puppeteer.launch({ headless: "new", args: ["--no-sandbox"] });
const page = await browser.newPage();
await page.setViewport({ width: 1440, height: 1200, deviceScaleFactor: 1 });
await page.goto("http://localhost:3000/", { waitUntil: "networkidle0" });
await page.evaluate((p) => sessionStorage.setItem("ng:open-week", JSON.stringify(p)), payload);
await page.reload({ waitUntil: "networkidle0" });
await page.waitForSelector("#cal-square", { timeout: 8000 });

// Capture clipboard writes and block the new-tab open.
await page.evaluate(() => {
  window.__copied = [];
  navigator.clipboard.writeText = (t) => { window.__copied.push(t); return Promise.resolve(); };
  window.open = () => null;
});

// Click the first "Copy prompt" button (the calendar caption-prompt card).
const clicked = await page.evaluate(() => {
  const btn = [...document.querySelectorAll("button")].find((b) => b.textContent.includes("Copy prompt"));
  if (!btn) return false;
  btn.click();
  return true;
});

await new Promise((r) => setTimeout(r, 300));
const copied = await page.evaluate(() => window.__copied || []);
await import("node:fs/promises").then((fs) => fs.mkdir(".render-test", { recursive: true }));
await page.screenshot({ path: ".render-test/studio-tight.png" });
await browser.close();

const text = copied[0] || "";
const checks = {
  "button found & copied": clicked && copied.length === 1,
  "names the event": text.includes("Sip & Paint Sunset"),
  "asks to web-search both brands": /web search/i.test(text) && text.includes("The Hotpot House Dharamkot"),
  "includes exact RSVP line": text.includes("📞 RSVP Bipasha · 77700 28833"),
  "no hashtag rule": /NO hashtags/i.test(text),
  "asks for 3 options": text.includes("3 options"),
  "includes the event location": text.includes("NomadGao Backyard, Lower Dharamkot"),
};
let ok = true;
for (const [k, v] of Object.entries(checks)) { console.log(`${v ? "PASS" : "FAIL"} — ${k}`); if (!v) ok = false; }
console.log("\n----- copied prompt (first 400 chars) -----\n" + text.slice(0, 400));
process.exit(ok ? 0 : 1);

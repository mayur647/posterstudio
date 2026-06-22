// Confirms the event Time field is now a 30-minute dropdown. Dev server up, auth off.
import puppeteer from "puppeteer";
const browser = await puppeteer.launch({ headless: "new", args: ["--no-sandbox"] });
const page = await browser.newPage();
await page.goto("http://localhost:3000/", { waitUntil: "networkidle0" });
await page.waitForSelector("select", { timeout: 8000 });
const info = await page.evaluate(() => {
  // The Time select is the one whose options include "6:00 PM".
  const sels = [...document.querySelectorAll("select")];
  const timeSel = sels.find((s) => [...s.options].some((o) => o.value === "6:00 PM"));
  if (!timeSel) return { found: false };
  const opts = [...timeSel.options].map((o) => o.value);
  return {
    found: true,
    total: opts.length,
    placeholder: opts[0],
    first: opts[1],
    sampleHas: ["12:00 AM", "9:30 AM", "6:00 PM", "11:30 PM"].filter((t) => opts.includes(t)),
    halfHourCount: opts.filter((o) => o.endsWith(":30 AM") || o.endsWith(":30 PM")).length,
  };
});
console.log(JSON.stringify(info, null, 2));
await browser.close();
process.exit(info.found && info.total === 49 && info.sampleHas.length === 4 ? 0 : 1);

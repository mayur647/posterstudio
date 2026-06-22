// Captures the screenshots used by the in-app /guide page. Dev server up on
// :3000 with auth OFF. Saves PNGs into public/guide/.
import { mkdir } from "node:fs/promises";
import puppeteer from "puppeteer";

const BASE = "http://localhost:3000";
const OUT = "public/guide";
await mkdir(OUT, { recursive: true });

const payload = {
  week: { startDate: "2026-06-22", endDate: "2026-06-28", theme: "Matcha Studio" },
  events: [
    { name: "Sip & Paint Sunset", typeSlug: "sip", date: "2026-06-25", time: "6:00 PM", location: "The Hotpot House, NomadGao Rooftop, Lower Dharamkot", price: "₹600", description: "Brushes, canvas and a sundowner." },
    { name: "Board Game Night", typeSlug: "board", date: "2026-06-22", time: "7:00 PM", location: "NomadGao Backyard, Lower Dharamkot", price: "Free", description: "Cards, dice and good company." },
  ],
};

const browser = await puppeteer.launch({ headless: "new", args: ["--no-sandbox"] });
const page = await browser.newPage();
await page.setViewport({ width: 1200, height: 900, deviceScaleFactor: 1.5 });

// 1) Login
await page.goto(`${BASE}/login`, { waitUntil: "networkidle0" });
await new Promise((r) => setTimeout(r, 300));
await page.screenshot({ path: `${OUT}/login.png` });
console.log("saved login.png");

// 2) Form (top: header + The week + first event card)
await page.goto(`${BASE}/`, { waitUntil: "networkidle0" });
await new Promise((r) => setTimeout(r, 400));
await page.screenshot({ path: `${OUT}/form.png` });
console.log("saved form.png");

// 3) Studio — restore a sample week, screenshot the calendar block (images + prompt)
await page.evaluate((p) => sessionStorage.setItem("ng:open-week", JSON.stringify(p)), payload);
await page.reload({ waitUntil: "networkidle0" });
await page.waitForSelector("#cal-square", { timeout: 8000 });
await page.evaluate(() => document.fonts.ready);
await new Promise((r) => setTimeout(r, 600));
const section = await page.$("section");
await section.screenshot({ path: `${OUT}/studio.png` });
console.log("saved studio.png");
// also an event block (2nd section) to show an event poster + its prompt
const sections = await page.$$("section");
if (sections[1]) {
  await sections[1].screenshot({ path: `${OUT}/event.png` });
  console.log("saved event.png");
}

// 4) Image Library / Admin
await page.evaluate(() => sessionStorage.removeItem("ng:open-week"));
await page.goto(`${BASE}/library`, { waitUntil: "networkidle0" });
await new Promise((r) => setTimeout(r, 500));
await page.screenshot({ path: `${OUT}/library.png` });
console.log("saved library.png");

await browser.close();
console.log("done");

// Renders posters with real locations to eyeball the new WHERE line + calendar
// place chip. Dev server up on :3000 (auth off). Saves PNGs to .render-test/.
import { mkdir } from "node:fs/promises";
import puppeteer from "puppeteer";

const BASE = "http://localhost:3000";
const OUT = ".render-test";
await mkdir(OUT, { recursive: true });

const eventTypes = [
  { slug: "sip", name: "Sip & Paint", emoji: "🎨" },
  { slug: "board", name: "Board Game Night", emoji: "🎲" },
];
const payload = {
  week: { startDate: "2026-06-22", endDate: "2026-06-28", theme: "Matcha Studio" },
  events: [
    { name: "Sip & Paint Sunset", typeSlug: "sip", date: "2026-06-25", time: "6:00 PM", location: "The Hotpot House, NomadGao Rooftop, Lower Dharamkot", price: "₹600", description: "Brushes, canvas and a sundowner." },
    { name: "Board Game Night", typeSlug: "board", date: "2026-06-22", time: "7:00 PM", location: "NomadGao Backyard, Lower Dharamkot", price: "Free", description: "Cards, dice and good company." },
  ],
};

const encode = (s) => Buffer.from(JSON.stringify(s), "utf8").toString("base64url");
const specs = [
  { kind: "event", format: "square", eventIndex: 0, w: 600, h: 600, file: "loc-event-square.png" },
  { kind: "event", format: "story", eventIndex: 0, w: 480, h: 853, file: "loc-event-story.png" },
  { kind: "calendar", format: "square", w: 600, h: 600, file: "loc-cal-square.png" },
];

const browser = await puppeteer.launch({ headless: "new", args: ["--no-sandbox"] });
const page = await browser.newPage();
for (const s of specs) {
  const spec = { kind: s.kind, format: s.format, payload, eventTypes, eventIndex: s.eventIndex ?? 0, seed: 0 };
  await page.setViewport({ width: s.w, height: s.h, deviceScaleFactor: 1 });
  await page.goto(`${BASE}/render?d=${encode(spec)}`, { waitUntil: "load" });
  await page.evaluate(() => document.fonts.ready);
  await new Promise((r) => setTimeout(r, 400));
  const el = await page.$("#poster");
  await el.screenshot({ path: `${OUT}/${s.file}` });
  console.log("saved", s.file);
}
await browser.close();

// Visual check for the reworked theme system. Drives the app's Puppeteer to the
// PUBLIC /render page (no auth gate) for several explicit styles + poster kinds,
// then saves PNGs to .render-test/. Run with the dev server up on :3000.
import { mkdir } from "node:fs/promises";
import puppeteer from "puppeteer";

const BASE = "http://localhost:3000";
const OUT = ".render-test";
await mkdir(OUT, { recursive: true });

const eventTypes = [
  { slug: "sip", name: "Sip & Paint", emoji: "🎨" },
  { slug: "board", name: "Board Game Night", emoji: "🎲" },
  { slug: "karaoke", name: "Karaoke Night", emoji: "🎤" },
  { slug: "nature", name: "Nature Walk & Cleanup", emoji: "🥾" },
];
const payload = {
  week: { startDate: "2026-06-22", endDate: "2026-06-28", theme: "Matcha Studio" },
  events: [
    { name: "Sip & Paint Sunset", typeSlug: "sip", date: "2026-06-25", time: "6:00 PM", location: "NomadGao Rooftop, Dharamkot", price: "₹600", description: "Brushes, canvas and a sundowner." },
    { name: "Board Game Night", typeSlug: "board", date: "2026-06-22", time: "7:00 PM", location: "NomadGao Rooftop, Dharamkot", price: "Free", description: "Cards, dice and good company." },
    { name: "Karaoke Night", typeSlug: "karaoke", date: "2026-06-26", time: "8:30 PM", location: "NomadGao Rooftop, Dharamkot", price: "Free", description: "Sing under the stars." },
    { name: "Nature Walk & Cleanup", typeSlug: "nature", date: "2026-06-28", time: "8:00 AM", location: "NomadGao Rooftop, Dharamkot", price: "Free", description: "Sunrise trail." },
  ],
};

// A handful of distinct, deterministic styles to show the spread.
const palettes = {
  matcha: { name: "Matcha Studio", header: ["#cdd9a5", "#36431f"], accent: "#e08a5f", tiles: [["#efe7d2","#5b5230"],["#e7b59a","#6e4430"],["#b8cccf","#33545a"],["#ecd98f","#665119"]] },
  berry:  { name: "Matcha & Berry", header: ["#c8d7a3", "#384720"], accent: "#a86cae", tiles: [["#bcd3bf","#3e4f40"],["#d9b8de","#4e3a57"],["#f3c4b1","#6e4434"],["#ecd98f","#665119"]] },
  coast:  { name: "Matcha & Coast", header: ["#c5d6a6", "#39481f"], accent: "#3f8e87", tiles: [["#bcd3bf","#3e4f40"],["#b4d6cf","#325852"],["#f5de9c","#6a5526"],["#e7b59a","#6e4430"]] },
  mango:  { name: "Matcha + Mango", header: ["#c6d79f", "#39491f"], accent: "#eaa13f", tiles: [["#bcd3bf","#3e4f40"],["#f5cf8a","#6a5320"],["#f4c3a4","#6e4632"],["#e9dcc0","#5d5330"]] },
};
const motif = (key, accent) => {
  const h = accent.replace("#", "");
  const c = `rgba(${parseInt(h.slice(0,2),16)},${parseInt(h.slice(2,4),16)},${parseInt(h.slice(4,6),16)},0.5)`;
  switch (key) {
    case "dots": return { image: `radial-gradient(${c} 2px, transparent 2.4px)`, size: "18px 18px" };
    case "rings": return { image: `radial-gradient(circle, transparent 0 3.5px, ${c} 3.5px 5px, transparent 5px)`, size: "22px 22px" };
    case "rays": return { image: `repeating-linear-gradient(45deg, ${c} 0 2px, transparent 2px 15px)`, size: "auto" };
    case "grid": return { image: `linear-gradient(${c} 1px, transparent 1px), linear-gradient(90deg, ${c} 1px, transparent 1px)`, size: "22px 22px" };
    case "waves": { const svg = `<svg xmlns='http://www.w3.org/2000/svg' width='44' height='16'><path d='M0 8 Q 11 0 22 8 T 44 8' fill='none' stroke='${accent}' stroke-width='1.4' opacity='0.5'/></svg>`; return { image: `url("data:image/svg+xml,${encodeURIComponent(svg)}")`, size: "44px 16px" }; }
  }
};
const style = (pal, fontDisplay, motifKey, radius, align, dir) => ({
  palette: palettes[pal],
  fonts: [fontDisplay, "'Hanken Grotesk'"],
  tileRadius: radius,
  accent: palettes[pal].accent,
  motif: motifKey,
  logoDir: dir,
  headerAlign: align,
});

const looks = [
  { tag: "A-matcha-dots",  style: style("matcha", "'Bricolage Grotesque'", "dots",  "18px", "left",   "row") },
  { tag: "B-berry-rings",  style: style("berry",  "'Unbounded'",           "rings", "28px", "center", "row-reverse") },
  { tag: "C-coast-waves",  style: style("coast",  "'Fraunces'",            "waves", "24px", "left",   "row") },
  { tag: "D-mango-rays",   style: style("mango",  "'Big Shoulders Display'","rays", "14px", "center", "row") },
];

const encode = (spec) => Buffer.from(JSON.stringify(spec), "utf8").toString("base64url");

const browser = await puppeteer.launch({ headless: "new", args: ["--no-sandbox"] });
const page = await browser.newPage();

for (const look of looks) {
  for (const kind of [
    { k: "calendar", f: "square", w: 600, h: 600 },
    { k: "calendar", f: "story",  w: 480, h: 853 },
    { k: "event",    f: "square", w: 600, h: 600, eventIndex: 0 },
  ]) {
    const spec = { kind: kind.k, format: kind.f, payload, eventTypes, eventIndex: kind.eventIndex ?? 0, seed: 1, style: look.style };
    await page.setViewport({ width: kind.w, height: kind.h, deviceScaleFactor: 1 });
    await page.goto(`${BASE}/render?d=${encode(spec)}`, { waitUntil: "load" });
    await page.evaluate(() => document.fonts.ready);
    await new Promise((r) => setTimeout(r, 450));
    const el = await page.$("#poster");
    const file = `${OUT}/theme-${look.tag}-${kind.k}-${kind.f}.png`;
    await el.screenshot({ path: file });
    console.log("saved", file);
  }
}
await browser.close();
console.log("done");

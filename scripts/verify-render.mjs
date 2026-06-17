// Dev utility: POST the four poster variants to /api/render, save the PNGs,
// and print their pixel dimensions. Run with the dev server up on :3000.
import { writeFile, mkdir } from "node:fs/promises";

const BASE = "http://localhost:3000";
const OUT = ".render-test";

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

const specs = [
  { kind: "calendar", format: "square", filename: "cal-square.png" },
  { kind: "calendar", format: "story", filename: "cal-story.png" },
  { kind: "event", format: "square", eventIndex: 0, filename: "event-square.png" },
  { kind: "event", format: "story", eventIndex: 0, filename: "event-story.png" },
];

await mkdir(OUT, { recursive: true });

for (const spec of specs) {
  const t0 = Date.now();
  const res = await fetch(`${BASE}/api/render`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ...spec, payload, eventTypes, seed: 0 }),
  });
  if (!res.ok) {
    console.log(`${spec.filename}: HTTP ${res.status} — ${await res.text()}`);
    continue;
  }
  const buf = Buffer.from(await res.arrayBuffer());
  await writeFile(`${OUT}/${spec.filename}`, buf);
  const w = buf.readUInt32BE(16);
  const h = buf.readUInt32BE(20);
  const ct = res.headers.get("content-type");
  console.log(
    `${spec.filename}: ${ct} ${w}x${h} ${(buf.length / 1024) | 0}KB ${Date.now() - t0}ms`,
  );
}

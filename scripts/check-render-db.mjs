// Render an event poster via /api/render using DB photos + logos, save it.
import { writeFile, mkdir } from "node:fs/promises";
const BASE = "http://localhost:3000";
const OUT = ".render-test";

const lib = await (await fetch(`${BASE}/api/library`)).json();
const photos = {};
for (const t of lib.types) photos[t.slug] = t.photos.map((p) => p.url);
const logos = { nomadgao: lib.logos.nomadgao, hotpot: lib.logos.hotpot };

const eventTypes = lib.types.map((t) => ({ slug: t.slug, name: t.name, emoji: t.emoji }));
const payload = {
  week: { startDate: "2026-06-22", endDate: "2026-06-28", theme: "Matcha Studio" },
  events: [
    { name: "Sip & Paint Sunset", typeSlug: "sip", date: "2026-06-25", time: "6:00 PM", location: "NomadGao Rooftop, Dharamkot", price: "₹600", description: "Brushes, canvas and a sundowner." },
  ],
};

await mkdir(OUT, { recursive: true });
const res = await fetch(`${BASE}/api/render`, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    kind: "event", format: "square", eventIndex: 0,
    filename: "event-db.png", payload, eventTypes, photos, logos, seed: 0,
  }),
});
console.log("status", res.status, res.headers.get("content-type"));
if (res.ok) {
  const buf = Buffer.from(await res.arrayBuffer());
  await writeFile(`${OUT}/event-db.png`, buf);
  console.log(`${buf.readUInt32BE(16)}x${buf.readUInt32BE(20)} ${(buf.length / 1024) | 0}KB`);
} else {
  console.log(await res.text());
}

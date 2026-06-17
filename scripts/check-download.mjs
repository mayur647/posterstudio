// Exercises the Download render pipeline end-to-end against the PUBLIC /render
// page (the same target /api/render screenshots), using real DB photos + logos.
// Run: node --env-file=.env.local scripts/check-download.mjs
import { createClient } from "@supabase/supabase-js";
import puppeteer from "puppeteer";
import { writeFile, mkdir } from "node:fs/promises";

const BASE = "http://localhost:3000";
const OUT = ".render-test";
const db = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { persistSession: false } },
);

const pub = (p) =>
  `${process.env.SUPABASE_URL.replace(/\/$/, "")}/storage/v1/object/public/assets/${p}`;

const { data: types } = await db.from("event_type").select("*").order("created_at");
const { data: photoRows } = await db.from("event_photo").select("*");
const { data: logoRows } = await db.from("brand_logo").select("*");

const photos = {};
for (const t of types) {
  photos[t.slug] = photoRows
    .filter((p) => p.event_type_id === t.id)
    .map((p) => pub(p.storage_path));
}
const logos = Object.fromEntries(logoRows.map((l) => [l.key, pub(l.storage_path)]));

const spec = {
  kind: "event",
  format: "square",
  eventIndex: 0,
  seed: 0,
  eventTypes: types.map((t) => ({ slug: t.slug, name: t.name, emoji: t.emoji })),
  payload: {
    week: { startDate: "2026-06-22", endDate: "2026-06-28", theme: "Matcha Studio" },
    events: [
      { name: "Sip & Paint Sunset", typeSlug: "sip", date: "2026-06-25", time: "6:00 PM", location: "NomadGao Rooftop, Dharamkot", price: "₹600", description: "Brushes, canvas and a sundowner." },
    ],
  },
  photos,
  logos,
};
const d = Buffer.from(JSON.stringify(spec), "utf8").toString("base64url");

await mkdir(OUT, { recursive: true });
const browser = await puppeteer.launch({ headless: true, args: ["--no-sandbox", "--disable-setuid-sandbox"] });
try {
  const page = await browser.newPage();
  await page.setViewport({ width: 600, height: 600, deviceScaleFactor: 1080 / 600 });
  await page.goto(`${BASE}/render?d=${encodeURIComponent(d)}`, { waitUntil: "load" });
  await page.evaluate(async () => { await document.fonts.ready; });
  await page.evaluate(() => document.querySelectorAll("nextjs-portal").forEach((el) => el.remove()));
  const el = await page.$("#poster");
  const buf = Buffer.from(await el.screenshot({ type: "png" }));
  await writeFile(`${OUT}/download-event.png`, buf);
  console.log(
    `OK ${buf.readUInt32BE(16)}x${buf.readUInt32BE(20)} ${(buf.length / 1024) | 0}KB`,
    `| photos[sip]=${photos.sip?.length ?? 0} logos=${Object.keys(logos).join(",")}`,
  );
} finally {
  await browser.close();
}

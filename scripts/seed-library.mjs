// Verifies the Image Library upload routes end-to-end AND seeds the library
// with the bundled logos + sample photos. Run with the dev server up:
//   node scripts/seed-library.mjs
import { readFileSync } from "node:fs";

const BASE = "http://localhost:3000";

async function uploadLogo(key, path) {
  const form = new FormData();
  form.append("key", key);
  form.append("file", new Blob([readFileSync(path)], { type: "image/png" }), `${key}.png`);
  const r = await fetch(`${BASE}/api/library/logos`, { method: "POST", body: form });
  const j = await r.json();
  console.log(`logo ${key}:`, r.status, j.logo?.url ? "ok" : JSON.stringify(j));
  return j.logo?.url;
}

async function uploadPhoto(eventTypeId, path) {
  const form = new FormData();
  form.append("eventTypeId", eventTypeId);
  form.append("file", new Blob([readFileSync(path)], { type: "image/png" }), "p.png");
  const r = await fetch(`${BASE}/api/library/photos`, { method: "POST", body: form });
  const j = await r.json();
  console.log("  photo:", r.status, j.photo?.url ? "ok" : JSON.stringify(j));
  return j.photo?.url;
}

const lib = await (await fetch(`${BASE}/api/library`)).json();
const bySlug = Object.fromEntries(lib.types.map((t) => [t.slug, t]));

await uploadLogo("nomadgao", "public/logos/nomadgao.png");
await uploadLogo("hotpot", "public/logos/hotpot-house.png");

const photos = {
  sip: ["public/samples/bg-sip-1.png", "public/samples/bg-sip-2.png", "public/samples/bg-sip-3.png"],
  board: ["public/samples/bg-board-1.png"],
  karaoke: ["public/samples/bg-karaoke-1.png"],
  nature: ["public/samples/bg-nature-1.png"],
};

let sampleUrl;
for (const [slug, files] of Object.entries(photos)) {
  const type = bySlug[slug];
  if (!type) { console.log(`no type ${slug}`); continue; }
  console.log(`type ${slug} (${type.id}):`);
  for (const f of files) sampleUrl = (await uploadPhoto(type.id, f)) ?? sampleUrl;
}

// Confirm a stored object is publicly reachable.
if (sampleUrl) {
  const img = await fetch(sampleUrl);
  console.log("public url check:", img.status, img.headers.get("content-type"));
}

const after = await (await fetch(`${BASE}/api/library`)).json();
console.log(
  "library now:",
  after.types.map((t) => `${t.slug}:${t.photos.length}`).join(" "),
  "| logos:",
  Object.keys(after.logos).join(","),
);

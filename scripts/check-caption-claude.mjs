// Verifies Claude caption generation with live web search end-to-end, the same
// way /api/caption does. Needs ANTHROPIC_API_KEY in .env.local.
// Run: node --env-file=.env.local scripts/check-caption-claude.mjs
import Anthropic from "@anthropic-ai/sdk";

if (!process.env.ANTHROPIC_API_KEY) {
  console.error("ANTHROPIC_API_KEY is not set in .env.local — add it and retry.");
  process.exit(1);
}

const MODEL = process.env.ANTHROPIC_MODEL || "claude-opus-4-8";
const RSVP = "Bipasha · 77700 28833";

const SYSTEM = `You are a senior social-media copywriter for NomadGao × The Hotpot House in Dharamkot, India. STEP 1 — research BOTH "NomadGao Dharamkot" and "The Hotpot House Dharamkot" with the web_search tool (real, current detail; never invent facts/prices/menu). STEP 2 — write captions that are SPECIFICALLY about the ONE event given: open with an event-specific hook (not generic "come hang out on our rooftop"), make the Description the backbone, and weave brand/venue research in only as light supporting colour. If a caption could be swapped onto a different event unnoticed, it's too generic. Audience: millennial & GenZ travellers and nomads; voice warm, vivid, playful; tasteful emoji. Rules: NO hashtags; end every caption with "📞 RSVP ${RSVP}"; include a "📍 NomadGao Rooftop, Dharamkot" line; never invent event specifics; each variant meaningfully different. OUTPUT ONLY raw JSON: {"variants":["...","..."]} with exactly the requested count, no fences or commentary.`;

const input = `Research NomadGao and The Hotpot House in Dharamkot on the web, then write 3 caption variants that are SPECIFICALLY about this one event.

Event name: 🎨 Sip & Paint Sunset
Type: Sip & Paint
When: Wed, Jun 25 · 6:00 PM
Where: NomadGao Rooftop, Dharamkot
Price: ₹600
Description (make this the backbone): Brushes, canvas and a sundowner.

Open with a hook about this specific event, expand the description, add one real venue/menu touch, include a 🎟️ price line, and end with the location and RSVP lines. Return exactly 3 variants as JSON.`;

function parseVariants(text) {
  if (!text) return null;
  const cleaned = text.replace(/```json\s*/gi, "").replace(/```/g, "").trim();
  for (const c of [cleaned, (cleaned.match(/\{[\s\S]*\}/) || [])[0]].filter(Boolean)) {
    try {
      const v = JSON.parse(c)?.variants;
      if (Array.isArray(v) && v.length && v.every((s) => typeof s === "string")) return v;
    } catch {}
  }
  return null;
}

function sources(msg) {
  const urls = new Set();
  for (const b of msg.content ?? []) {
    if (b.type === "web_search_tool_result" && Array.isArray(b.content)) {
      for (const r of b.content) if (r.url) urls.add(r.url);
    }
    if (b.type === "text" && Array.isArray(b.citations)) {
      for (const c of b.citations) if (c.url) urls.add(c.url);
    }
  }
  return [...urls];
}

const client = new Anthropic();
const t0 = Date.now();
console.log(`Researching + writing with ${MODEL} (web_search on)…`);

const params = {
  model: MODEL,
  max_tokens: 2048,
  system: SYSTEM,
  tools: [{ type: "web_search_20260209", name: "web_search", max_uses: 5 }],
  messages: [{ role: "user", content: input }],
};
let resp = await client.messages.create(params);
let guard = 0;
while (resp.stop_reason === "pause_turn" && guard < 4) {
  params.messages.push({ role: "assistant", content: resp.content });
  resp = await client.messages.create(params);
  guard++;
}

const text = resp.content.filter((b) => b.type === "text").map((b) => b.text).join("\n");
const variants = parseVariants(text);
console.log(`\n⏱  ${Date.now() - t0}ms`);
const src = sources(resp);
if (src.length) console.log(`🔎 sources: ${src.join("  ")}`);
if (!variants) {
  console.error("Could not parse variants. Raw output:\n", text);
  process.exit(1);
}
variants.forEach((v, i) => console.log(`\n———— variant ${i + 1} ————\n${v}`));
const ok = variants.every((v) => v.includes(RSVP) && !v.includes("#"));
console.log(`\n${ok ? "PASS" : "WARN"} — ${variants.length} variants, RSVP present & no hashtags: ${ok}`);

import { NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import type { EventType } from "@/lib/theme";
import type { WeekFormPayload } from "@/lib/types";
import { emojiFor } from "@/lib/posterData";
import { weekdayShort, monthDay, captionDate } from "@/lib/format";
import {
  RSVP,
  calendarCaption,
  eventCaption,
  type CaptionEvent,
} from "@/lib/captions";

export const runtime = "nodejs";
// Live web research + writing can take a while; give it the most a serverless
// function gets on Vercel Hobby. claude-haiku-4-5 stays well under this; the
// default claude-opus-4-8 is higher quality but slower/pricier.
export const maxDuration = 60;

interface CaptionRequest {
  kind: "calendar" | "event";
  payload: WeekFormPayload;
  eventTypes: EventType[];
  eventIndex?: number;
  count?: number;
}

// Any Claude 4 model supports the hosted web_search tool. Default to the most
// capable; override with ANTHROPIC_MODEL (e.g. claude-haiku-4-5 for faster,
// cheaper captions, or claude-sonnet-4-6 for a middle ground).
const MODEL = process.env.ANTHROPIC_MODEL || "claude-opus-4-8";

const SYSTEM = `You are a senior social-media copywriter for NomadGao × The Hotpot House in Dharamkot, Himachal Pradesh, India.

STEP 1 — RESEARCH (do this first, every time): use the web_search tool to research BOTH brands thoroughly so any venue detail you use is real and current:
- "NomadGao Dharamkot" — the coworking/coliving community: setting, vibe, who stays there.
- "The Hotpot House Dharamkot" — the rooftop cafe: signature dishes/drinks, food style, atmosphere.
Do at least one search per brand. NEVER invent facts, reviews, prices or menu items — if unsure, stay general.

STEP 2 — WRITE (this is the actual goal): each caption must be SPECIFICALLY about the ONE event you are given — its activity, and what a guest will actually do, see and feel there. This is an event promo, NOT a generic venue or community ad.
- Open with a hook about THIS event (the painting, the quiz, the open mic, the hike…). Do NOT open with generic lines like "come hang out on our rooftop" or "good company and mountain air".
- Make the event's Description the backbone — expand the CM's words into vivid, concrete copy. If no description is given, infer the activity from the event name + type and make it specific.
- Weave the real brand/venue research in as light supporting colour only — one rooftop / Dhauladhar / Hotpot House menu touch, never the main subject.
- Litmus test: if a caption could be swapped onto a different event without anyone noticing, it is too generic — rewrite it so it could only belong to this event.

Audience: millennial & GenZ travellers, backpackers and digital nomads. Voice: warm, vivid, a little playful; tasteful emoji.

Hard rules:
- NO hashtags anywhere. None.
- End every caption with the RSVP line exactly: "📞 RSVP ${RSVP}".
- Include a location line "📍 NomadGao Rooftop, Dharamkot" (or the event's location if one is given).
- Use only the event facts given — never invent prices, dates or times.
- Each variant must be meaningfully different in angle and wording — not a reword of another.

OUTPUT FORMAT: Return ONLY a raw JSON object of the form {"variants": ["caption one", "caption two", ...]} containing exactly the requested number of variants. No markdown, no code fences, no commentary before or after the JSON.`;

function toCaptionEvents(
  payload: WeekFormPayload,
  eventTypes: EventType[],
): CaptionEvent[] {
  return payload.events.map((e) => ({
    emoji: emojiFor(eventTypes, e.typeSlug),
    name: e.name,
    date: e.date,
    time: e.time,
    price: e.price,
    location: e.location,
    description: e.description,
  }));
}

/** Template variants used when no API key is configured or the model errors. */
function fallback(req: CaptionRequest): string[] {
  const evs = toCaptionEvents(req.payload, req.eventTypes);
  if (req.kind === "calendar") return calendarCaption(evs);
  return eventCaption(evs[req.eventIndex ?? 0]);
}

function typeNameFor(req: CaptionRequest, idx: number): string {
  const slug = req.payload.events[idx]?.typeSlug;
  return req.eventTypes.find((t) => t.slug === slug)?.name ?? "";
}

function buildUserPrompt(req: CaptionRequest, count: number): string {
  const evs = toCaptionEvents(req.payload, req.eventTypes);
  if (req.kind === "calendar") {
    const lines = evs
      .map((e, i) => {
        const dow = weekdayShort(e.date);
        const md = monthDay(e.date);
        const when = [dow, md, e.time].filter(Boolean).join(" · ");
        const price = e.price.trim() ? ` (${e.price.trim()})` : "";
        const type = typeNameFor(req, i);
        const desc = e.description.trim() ? ` — ${e.description.trim()}` : "";
        return `- ${e.emoji} ${e.name}${type ? ` [${type}]` : ""}${when ? " — " + when : ""}${price}${desc}`;
      })
      .join("\n");
    return `Research NomadGao and The Hotpot House in Dharamkot on the web, then write ${count} distinct weekly-lineup caption variants for this week at NomadGao Rooftop, Dharamkot. Name the actual events below and give each a vivid, specific touch drawn from its description — not generic filler.

Events:
${lines}

Mention that healthy Asian bowls & Vietnamese coffee from The Hotpot House are on hand. End with the location and RSVP lines. Return exactly ${count} variants as JSON.`;
  }

  const idx = req.eventIndex ?? 0;
  const e = evs[idx];
  const when = [captionDate(e.date), e.time].filter(Boolean).join(" · ");
  const price = e.price.trim() || "Free";
  const type = typeNameFor(req, idx);
  return `Research NomadGao and The Hotpot House in Dharamkot on the web, then write ${count} caption variants that are SPECIFICALLY about this one event (not generic venue promo).

Event name: ${e.emoji} ${e.name}
Type: ${type || "(general event)"}
When: ${when}
Where: ${e.location || "NomadGao Rooftop, Dharamkot"}
Price: ${price}
Description (the CM's own words — make this the backbone of the caption): ${e.description || "(none given — infer the activity from the event name and type, and write something concrete and specific to it)"}

Open with a hook about this specific event, expand the description into vivid copy, and add just one real venue/menu touch from your research. Include a 🎟️ price line (omit only if free), and end with the location and RSVP lines. Return exactly ${count} variants as JSON.`;
}

/** Pulls a {"variants":[...]} object out of the model's text, tolerating fences. */
function parseVariants(text: string): string[] | null {
  if (!text) return null;
  const cleaned = text.replace(/```json\s*/gi, "").replace(/```/g, "").trim();
  const candidates = [cleaned];
  const match = cleaned.match(/\{[\s\S]*\}/);
  if (match) candidates.push(match[0]);
  for (const c of candidates) {
    try {
      const obj = JSON.parse(c);
      const v: unknown = obj?.variants;
      if (Array.isArray(v) && v.length > 0 && v.every((s) => typeof s === "string")) {
        return v as string[];
      }
    } catch {
      /* try next candidate */
    }
  }
  return null;
}

/** Best-effort list of source URLs Claude searched/cited, for transparency. */
function extractSources(message: Anthropic.Message): string[] {
  const urls = new Set<string>();
  try {
    for (const block of message.content) {
      const b = block as unknown as {
        type: string;
        content?: unknown;
        citations?: unknown;
      };
      // web_search_tool_result block holds the result list.
      if (b.type === "web_search_tool_result" && Array.isArray(b.content)) {
        for (const r of b.content as Array<Record<string, unknown>>) {
          if (typeof r.url === "string") urls.add(r.url);
        }
      }
      // text blocks carry url_citation annotations.
      if (b.type === "text" && Array.isArray(b.citations)) {
        for (const c of b.citations as Array<Record<string, unknown>>) {
          if (typeof c.url === "string") urls.add(c.url);
        }
      }
    }
  } catch {
    /* citations are best-effort */
  }
  return [...urls].slice(0, 8);
}

export async function POST(req: Request) {
  let body: CaptionRequest;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid JSON body" }, { status: 400 });
  }
  if (!body?.kind || !body?.payload || !body?.eventTypes) {
    return NextResponse.json({ error: "missing fields" }, { status: 400 });
  }

  const count = Math.min(Math.max(body.count ?? 3, 1), 5);

  // No key → template fallback so the app works without Claude configured.
  if (!process.env.ANTHROPIC_API_KEY) {
    return NextResponse.json({
      variants: fallback(body),
      source: "template",
      reason: "ANTHROPIC_API_KEY is not set on the server",
    });
  }

  try {
    const client = new Anthropic();
    const messages: Anthropic.MessageParam[] = [
      { role: "user", content: buildUserPrompt(body, count) },
    ];
    const params: Anthropic.MessageCreateParamsNonStreaming = {
      model: MODEL,
      max_tokens: 2048,
      system: SYSTEM,
      tools: [{ type: "web_search_20260209", name: "web_search", max_uses: 5 }],
      messages,
    };

    let resp = await client.messages.create(params);
    // The server runs its own tool loop; if it pauses, re-send to continue.
    let guard = 0;
    while (resp.stop_reason === "pause_turn" && guard < 4) {
      messages.push({ role: "assistant", content: resp.content });
      resp = await client.messages.create({ ...params, messages });
      guard++;
    }

    const text = resp.content
      .filter((b): b is Anthropic.TextBlock => b.type === "text")
      .map((b) => b.text)
      .join("\n");
    const variants = parseVariants(text);
    if (!variants) throw new Error("model returned no parseable variants");

    return NextResponse.json({
      variants,
      source: "claude",
      sources: extractSources(resp),
    });
  } catch (err) {
    const reason = err instanceof Error ? err.message : "Claude request failed";
    console.error("caption generation failed; using template:", reason);
    return NextResponse.json({ variants: fallback(body), source: "template", reason });
  }
}

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
export const maxDuration = 30;

interface CaptionRequest {
  kind: "calendar" | "event";
  payload: WeekFormPayload;
  eventTypes: EventType[];
  eventIndex?: number;
  count?: number;
}

const MODEL = "claude-opus-4-8";

const SYSTEM = `You write Instagram captions for NomadGao × The Hotpot House — a Himalayan coworking/coliving community with a healthy rooftop Asian cafe, in Dharamkot.

Voice: warm, communal, free-spirited nomad/foodie. Lean on the cues that make this place specific — the Dhauladhar mountains, the rooftop, golden-hour light, good company, and healthy Asian food from The Hotpot House (bowls, Vietnamese coffee). Light, tasteful emoji are welcome.

Hard rules:
- NO hashtags anywhere. None.
- Always end with the RSVP line exactly: "📞 RSVP ${RSVP}".
- Always include a location line "📍 NomadGao Rooftop, Dharamkot" (or the event's location if given).
- Keep each caption tight — a hook, the essentials, and the sign-off. No invented prices, dates, or details beyond what you're given.
- Each variant must be meaningfully different in angle and wording, not a reword.

Example weekly-lineup caption:
"🗓 This week at NomadGao · Dharamkot

Four nights, one big table — here's what's on the rooftop this week:

🎲 Mon · Board Game Night — 7:00 PM
🎨 Wed · Sip & Paint Sunset — 6:00 PM

Good company, mountain air, and healthy Asian bowls & Vietnamese coffee from The Hotpot House. Come as you are. 🌄

📍 NomadGao Rooftop, Dharamkot
📞 RSVP ${RSVP}"

Example event caption:
"🎨 Sip & Paint Sunset · Wed, Jun 25 · 6 PM

Swap the laptop for a paintbrush. Sip something cold, watch the Dhauladhars turn gold, and let the canvas do the talking — no skills needed, just good company on the NomadGao rooftop. 🌄

Fresh Asian bowls & Vietnamese coffee from The Hotpot House on hand all evening. 🍜☕

📍 NomadGao Rooftop, Dharamkot
🎟️ ₹600 · limited spots
📞 RSVP ${RSVP}"`;

const SCHEMA = {
  type: "object",
  properties: {
    variants: {
      type: "array",
      items: { type: "string" },
      description: "The caption variants, each a complete caption string.",
    },
  },
  required: ["variants"],
  additionalProperties: false,
} as const;

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

/** Template variants used when no API key is configured or Claude errors. */
function fallback(req: CaptionRequest): string[] {
  const evs = toCaptionEvents(req.payload, req.eventTypes);
  if (req.kind === "calendar") return calendarCaption(evs);
  return eventCaption(evs[req.eventIndex ?? 0]);
}

function buildUserPrompt(req: CaptionRequest, count: number): string {
  const evs = toCaptionEvents(req.payload, req.eventTypes);
  if (req.kind === "calendar") {
    const lines = evs
      .map((e) => {
        const dow = weekdayShort(e.date);
        const md = monthDay(e.date);
        const when = [dow, md, e.time].filter(Boolean).join(" · ");
        const price = e.price.trim() ? ` (${e.price.trim()})` : "";
        return `- ${e.emoji} ${e.name}${when ? " — " + when : ""}${price}`;
      })
      .join("\n");
    return `Write ${count} distinct weekly-lineup caption variants for this week at NomadGao Rooftop, Dharamkot.

Events:
${lines}

Mention that healthy Asian bowls & Vietnamese coffee from The Hotpot House are on hand. End with the location and RSVP lines.`;
  }

  const e = evs[req.eventIndex ?? 0];
  const when = [captionDate(e.date), e.time].filter(Boolean).join(" · ");
  const price = e.price.trim() || "Free";
  return `Write ${count} distinct caption variants for this single event.

Event: ${e.emoji} ${e.name}
When: ${when}
Where: ${e.location || "NomadGao Rooftop, Dharamkot"}
Price: ${price}
Description: ${e.description || "(none given)"}

Include a 🎟️ price line (omit only if free), and end with the location and RSVP lines.`;
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
    return NextResponse.json({ variants: fallback(body), source: "template" });
  }

  try {
    const client = new Anthropic();
    const response = await client.messages.create({
      model: MODEL,
      max_tokens: 2000,
      system: SYSTEM,
      messages: [{ role: "user", content: buildUserPrompt(body, count) }],
      output_config: { format: { type: "json_schema", schema: SCHEMA } },
    });

    const text = response.content.find((b) => b.type === "text");
    const parsed = text ? JSON.parse(text.text) : null;
    const variants: unknown = parsed?.variants;
    if (
      !Array.isArray(variants) ||
      variants.some((v) => typeof v !== "string") ||
      variants.length === 0
    ) {
      throw new Error("unexpected caption shape");
    }
    return NextResponse.json({ variants, source: "claude" });
  } catch (err) {
    console.error("caption generation failed; using template", err);
    return NextResponse.json({ variants: fallback(body), source: "template" });
  }
}

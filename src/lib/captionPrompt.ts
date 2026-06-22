/**
 * Builds a ready-to-paste prompt for claude.ai (the chat product), so a CM can
 * generate researched captions on their existing Claude subscription instead of
 * the paid API. Same brand voice + event-first rules as the API route, but asks
 * for human-readable options (not JSON).
 */
import type { EventType } from "@/lib/theme";
import type { WeekFormPayload } from "@/lib/types";
import { emojiFor } from "@/lib/posterData";
import { weekdayShort, monthDay, captionDate } from "@/lib/format";
import { RSVP } from "@/lib/captions";

const HEADER = `You're a social-media copywriter for NomadGao × The Hotpot House in Dharamkot, Himachal Pradesh, India.

First, use web search to research BOTH brands so your details are real and current:
- "NomadGao Dharamkot" — the coworking / coliving community (vibe, setting, who stays there)
- "The Hotpot House Dharamkot" — the rooftop cafe (signature dishes & drinks, atmosphere)

Audience: millennial & GenZ travellers, backpackers and digital nomads. Voice: warm, vivid, a little playful; tasteful emoji.

Rules:
- NO hashtags anywhere.
- End every caption with this exact line: 📞 RSVP ${RSVP}
- Include a 📍 location line using the exact location(s) I give below — don't substitute a different venue.
- Don't invent prices, dates or times beyond what I give you below.`;

export function buildClaudePrompt(
  kind: "calendar" | "event",
  payload: WeekFormPayload,
  eventTypes: EventType[],
  eventIndex = 0,
): string {
  if (kind === "calendar") {
    const lines = payload.events
      .map((e) => {
        const emoji = emojiFor(eventTypes, e.typeSlug);
        const type = eventTypes.find((t) => t.slug === e.typeSlug)?.name ?? "";
        const when = [weekdayShort(e.date), monthDay(e.date), e.time]
          .filter(Boolean)
          .join(" · ");
        const price = e.price.trim() ? ` (${e.price.trim()})` : "";
        const where = e.location.trim() ? ` · 📍 ${e.location.trim()}` : "";
        const desc = e.description.trim() ? ` — ${e.description.trim()}` : "";
        return `- ${emoji} ${e.name}${type ? ` [${type}]` : ""}${when ? " — " + when : ""}${price}${where}${desc}`;
      })
      .join("\n");
    return `${HEADER}

Write 3 distinct weekly-lineup caption options for this week's events at NomadGao, Lower Dharamkot. Name the actual events below, give each a vivid and specific touch (not generic filler), use each event's own location, and mention that healthy Asian bowls & Vietnamese coffee from The Hotpot House are on hand.

This week's events:
${lines}

Give me 3 options I can choose from.`;
  }

  const e = payload.events[eventIndex];
  const emoji = emojiFor(eventTypes, e.typeSlug);
  const type = eventTypes.find((t) => t.slug === e.typeSlug)?.name ?? "";
  const when = [captionDate(e.date), e.time].filter(Boolean).join(" · ");
  const price = e.price.trim() || "Free";
  return `${HEADER}

Write 3 distinct Instagram caption options that are SPECIFICALLY about this one event (not generic venue promo). Open each with a hook about the actual activity, build the body from the Description, and weave in just one real venue/menu detail from your research.

Event: ${emoji} ${e.name}
Type: ${type || "(general event)"}
When: ${when}
Where: ${e.location || "The Hotpot House, NomadGao Rooftop, Lower Dharamkot"}
Price: ${price}
Description: ${e.description.trim() || "(none — infer the activity from the name/type and make it concrete)"}

Give me 3 options I can choose from.`;
}

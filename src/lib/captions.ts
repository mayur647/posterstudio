/**
 * Interim caption generator. Produces warm, communal, hashtag-free captions in
 * the brand voice (mountain + rooftop + healthy Asian food cues). Each subject
 * returns 2–3 regenerable variants — the Refresh button cycles them.
 *
 * This is template-driven for now; the real app swaps this for the Claude API
 * using these same examples as the tone reference (see DEPLOYMENT.md §7).
 */
import { captionDate, weekdayShort } from "@/lib/format";

export const RSVP = "Bipasha · 77700 28833";

function titleCaseDow(iso: string): string {
  const d = weekdayShort(iso);
  return d ? d.charAt(0) + d.slice(1).toLowerCase() : "";
}

export interface CaptionEvent {
  emoji: string;
  name: string;
  date: string;
  time: string;
  price: string;
  location: string;
  description: string;
}

/** Weekly-lineup caption variants. */
export function calendarCaption(events: CaptionEvent[]): string[] {
  const lines = events
    .map((e) => {
      const dow = titleCaseDow(e.date);
      const when = [dow, e.time].filter(Boolean).join(" · ");
      return `${e.emoji} ${when ? when + " · " : ""}${e.name}`.trimEnd();
    })
    .join("\n");
  const loc = events[0]?.location || "NomadGao Rooftop, Dharamkot";

  return [
    `🗓 This week at NomadGao · Dharamkot

Here's what's on the rooftop this week:

${lines}

Good company, mountain air, and healthy Asian bowls & Vietnamese coffee from The Hotpot House. Come as you are. 🌄

📍 ${loc}
📞 RSVP ${RSVP}`,

    `🌄 Your week in the mountains starts here.

A few easy evenings of good people on the NomadGao rooftop, Dharamkot:

${lines}

Warm bowls and Vietnamese coffee from The Hotpot House all week. Pull up a chair.

📍 ${loc}
📞 RSVP ${RSVP}`,

    `This week, the rooftop is the plan. 🏔️

Take your pick — here's the lineup at NomadGao, Dharamkot:

${lines}

Fresh Asian bowls & Vietnamese coffee from The Hotpot House on hand throughout.

📍 ${loc}
📞 RSVP ${RSVP}`,
  ];
}

/** Per-event caption variants. */
export function eventCaption(e: CaptionEvent): string[] {
  const when = [captionDate(e.date), e.time].filter(Boolean).join(" · ");
  const header = `${e.emoji} ${e.name}${when ? " · " + when : ""}`;
  const desc = e.description.trim();
  const priceLine = e.price.trim()
    ? `🎟️ ${e.price.trim()}${/free/i.test(e.price) ? "" : " · limited spots"}`
    : "";
  const tail = [
    `📍 ${e.location || "NomadGao Rooftop, Dharamkot"}`,
    priceLine,
    `📞 RSVP ${RSVP}`,
  ]
    .filter(Boolean)
    .join("\n");

  return [
    `${header}

${desc || "Come spend the evening with us on the rooftop."} 🌄

Fresh Asian bowls & Vietnamese coffee from The Hotpot House on hand all evening. 🍜☕

${tail}`,

    `${header}

Swap the laptop for something good. ${desc || "Just show up and enjoy it"} — good company as the Dhauladhars turn gold. 🌄

Grab a bowl or a Vietnamese coffee from The Hotpot House while you're here. 🍜☕

${tail}`,

    `${header}

${desc || "An easy evening on the NomadGao rooftop."} Newcomers always welcome — the only rule is enjoy it. 🏔️

Healthy Asian bowls & Vietnamese coffee from The Hotpot House all evening. 🍜☕

${tail}`,
  ];
}

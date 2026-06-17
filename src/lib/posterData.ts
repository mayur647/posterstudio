/**
 * Pure mapping from form data → poster component props. Shared by the client
 * Poster Studio and the server-side /api/render route so both produce
 * identical creatives.
 */
import type { EventType } from "@/lib/theme";
import type { EventDraft, WeekFormPayload } from "@/lib/types";
import type { CalendarTile, EventPosterProps } from "@/components/posters/types";
import { dateChip, dateRange, monthDay, weekdayShort } from "@/lib/format";

export const CAL_TITLE = "Community Gatherings";

/** Sample backgrounds per event type, rotated on shuffle (by seed). */
export const TYPE_BG: Record<string, string[]> = {
  sip: [
    "/samples/bg-sip-1.png",
    "/samples/bg-sip-2.png",
    "/samples/bg-sip-3.png",
  ],
  board: ["/samples/bg-board-1.png"],
  karaoke: ["/samples/bg-karaoke-1.png"],
  nature: ["/samples/bg-nature-1.png"],
};

export function bgFor(slug: string, seed: number): string | null {
  const imgs = TYPE_BG[slug];
  if (!imgs || imgs.length === 0) return null;
  return imgs[seed % imgs.length];
}

/** "FREE" / "₹600" / "" for the small calendar-tile price line. */
export function tilePrice(price: string): string {
  const p = price.trim();
  if (!p) return "";
  return /free/i.test(p) ? "FREE" : p;
}

/** Short value for the event poster's WHERE cell. */
export function shortWhere(location: string): string {
  if (/rooftop/i.test(location)) return "Rooftop";
  return location.split(",")[0].trim() || "—";
}

export function emojiFor(eventTypes: EventType[], slug: string): string {
  return eventTypes.find((t) => t.slug === slug)?.emoji ?? "🏷️";
}

export function calendarRange(payload: WeekFormPayload): string {
  return dateRange(payload.week.startDate, payload.week.endDate);
}

export function buildCalendarTiles(
  payload: WeekFormPayload,
  eventTypes: EventType[],
): CalendarTile[] {
  return payload.events.map((e) => ({
    emoji: emojiFor(eventTypes, e.typeSlug),
    name: e.name,
    weekday: weekdayShort(e.date),
    monthDay: monthDay(e.date),
    time: e.time.trim(),
    price: tilePrice(e.price),
  }));
}

export function buildEventProps(
  event: EventDraft | Omit<EventDraft, "id">,
  seed: number,
  photos?: Record<string, string[]>,
): EventPosterProps {
  const fromLibrary = photos?.[event.typeSlug];
  const bgUrl =
    fromLibrary && fromLibrary.length > 0
      ? fromLibrary[seed % fromLibrary.length]
      : bgFor(event.typeSlug, seed);
  return {
    dateChip: dateChip(event.date),
    title: event.name,
    description: event.description,
    time: event.time || "—",
    where: shortWhere(event.location),
    price: event.price.trim() || "Free",
    bgUrl,
  };
}

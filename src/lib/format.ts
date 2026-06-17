/**
 * Date helpers for the posters. Inputs are ISO `yyyy-mm-dd` strings from the
 * form. We parse them as LOCAL dates (not UTC) to avoid an off-by-one day.
 */

const WEEKDAYS = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];
const MONTHS = [
  "JAN", "FEB", "MAR", "APR", "MAY", "JUN",
  "JUL", "AUG", "SEP", "OCT", "NOV", "DEC",
];

function parse(iso: string): Date | null {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso);
  if (!m) return null;
  return new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]));
}

/** "WED" — empty string if the date is missing/invalid. */
export function weekdayShort(iso: string): string {
  const d = parse(iso);
  return d ? WEEKDAYS[d.getDay()] : "";
}

/** "JUN 25" — empty string if invalid. */
export function monthDay(iso: string): string {
  const d = parse(iso);
  return d ? `${MONTHS[d.getMonth()]} ${d.getDate()}` : "";
}

/** Stacked date-chip parts: { dow: "WED", md: "JUN 25" }. */
export function dateChip(iso: string): { dow: string; md: string } {
  return { dow: weekdayShort(iso), md: monthDay(iso) };
}

/**
 * Week range as shown on the calendar header:
 *   same month  → "JUN 22 – 28"
 *   spans month → "JUN 28 – JUL 4"
 */
export function dateRange(startIso: string, endIso: string): string {
  const s = parse(startIso);
  const e = parse(endIso);
  if (!s || !e) return "";
  const left = `${MONTHS[s.getMonth()]} ${s.getDate()}`;
  const right =
    s.getMonth() === e.getMonth()
      ? `${e.getDate()}`
      : `${MONTHS[e.getMonth()]} ${e.getDate()}`;
  return `${left} – ${right}`;
}

/** "MON · 7:00 PM" for calendar tiles; drops empty parts. */
export function dayTime(iso: string, time: string): string {
  return [weekdayShort(iso), time.trim()].filter(Boolean).join(" · ");
}

/** Title-case month+day for captions, e.g. "Wed, Jun 25". */
export function captionDate(iso: string): string {
  const d = parse(iso);
  if (!d) return "";
  const dow = WEEKDAYS[d.getDay()];
  const mon = MONTHS[d.getMonth()];
  const tc = (s: string) => s.charAt(0) + s.slice(1).toLowerCase();
  return `${tc(dow)}, ${tc(mon)} ${d.getDate()}`;
}

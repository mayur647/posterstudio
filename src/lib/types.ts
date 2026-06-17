/**
 * Form payload types. These mirror the `week` + `event` tables in
 * DEPLOYMENT.md §3 (minus the DB-generated id/created_at), so the Sunday
 * form's output can be written straight to the database in a later phase.
 */

export interface WeekDraft {
  /** ISO date (yyyy-mm-dd) for the first day of the week. */
  startDate: string;
  /** ISO date (yyyy-mm-dd) for the last day of the week. */
  endDate: string;
  /** Palette name; defaults to "Matcha Studio". Shuffle can reroll later. */
  theme: string;
}

export interface EventDraft {
  /** Client-only id for list keys; not persisted. */
  id: string;
  name: string;
  /** Slug into the event-type / image library (e.g. "sip"). */
  typeSlug: string;
  /** ISO date (yyyy-mm-dd). */
  date: string;
  /** Free-form time, e.g. "6:00 PM". */
  time: string;
  location: string;
  /** Display string, e.g. "₹600" or "Free". */
  price: string;
  description: string;
}

export interface WeekFormPayload {
  week: WeekDraft;
  events: Omit<EventDraft, "id">[];
}

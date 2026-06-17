import { getSupabaseAdmin } from "./supabase";
import { listEventTypes } from "./library";
import type { WeekFormPayload } from "@/lib/types";

/**
 * Persists a submitted week + its events. Event type slugs are resolved to
 * event_type ids; an unknown slug (a local-only type) saves with a null type.
 * Returns the new week id.
 */
export async function saveWeek(payload: WeekFormPayload): Promise<string> {
  const db = getSupabaseAdmin();

  const { data: week, error: we } = await db
    .from("week")
    .insert({
      start_date: payload.week.startDate || null,
      end_date: payload.week.endDate || null,
      theme: payload.week.theme,
    })
    .select("id")
    .single();
  if (we) throw new Error(we.message);
  const weekId = week.id as string;

  const types = await listEventTypes();
  const idBySlug = new Map(types.map((t) => [t.slug, t.id]));

  if (payload.events.length > 0) {
    const rows = payload.events.map((e) => ({
      week_id: weekId,
      name: e.name,
      event_type_id: idBySlug.get(e.typeSlug) ?? null,
      date: e.date || null,
      time: e.time || null,
      location: e.location || null,
      price: e.price || null,
      description: e.description || null,
    }));
    const { error: ee } = await db.from("event").insert(rows);
    if (ee) throw new Error(ee.message);
  }

  return weekId;
}

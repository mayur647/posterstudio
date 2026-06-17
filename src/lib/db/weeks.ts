import { getSupabaseAdmin } from "./supabase";
import { listEventTypes } from "./library";
import { DEFAULT_PALETTE } from "@/lib/theme";
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

export interface SavedWeek {
  id: string;
  createdAt: string;
  payload: WeekFormPayload;
}

/** Lists recently saved weeks (most recent first) with their events. */
export async function listWeeks(limit = 12): Promise<SavedWeek[]> {
  const db = getSupabaseAdmin();
  const { data: weeks, error } = await db
    .from("week")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(limit);
  if (error) throw new Error(error.message);
  if (!weeks || weeks.length === 0) return [];

  const ids = weeks.map((w) => w.id);
  const { data: events } = await db.from("event").select("*").in("week_id", ids);
  const types = await listEventTypes();
  const slugById = new Map(types.map((t) => [t.id, t.slug]));

  const byWeek = new Map<string, typeof events>();
  for (const e of events ?? []) {
    const list = byWeek.get(e.week_id) ?? [];
    list.push(e);
    byWeek.set(e.week_id, list);
  }

  return weeks.map((w) => ({
    id: w.id,
    createdAt: w.created_at,
    payload: {
      week: {
        startDate: w.start_date ?? "",
        endDate: w.end_date ?? "",
        theme: w.theme ?? DEFAULT_PALETTE,
      },
      events: (byWeek.get(w.id) ?? [])
        .slice()
        .sort((a, b) => (a.date ?? "").localeCompare(b.date ?? ""))
        .map((e) => ({
          name: e.name ?? "",
          typeSlug: e.event_type_id ? slugById.get(e.event_type_id) ?? "" : "",
          date: e.date ?? "",
          time: e.time ?? "",
          location: e.location ?? "",
          price: e.price ?? "",
          description: e.description ?? "",
        })),
    },
  }));
}

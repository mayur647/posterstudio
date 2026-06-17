import { getSupabaseAdmin, publicUrl, BUCKET } from "./supabase";
import type { EventTypeRow, EventPhotoRow, BrandLogoRow } from "./types";

/** A binary asset ready to store. */
export interface UploadInput {
  bytes: Uint8Array;
  contentType: string;
  ext: string; // without the dot, e.g. "png"
}

function slugify(raw: string): string {
  return (
    raw
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "") || "type"
  );
}

/* ── Event types ──────────────────────────────────────────────────────────── */

export async function listEventTypes(): Promise<EventTypeRow[]> {
  const db = getSupabaseAdmin();
  const { data, error } = await db
    .from("event_type")
    .select("*")
    .order("created_at", { ascending: true });
  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function createEventType(
  name: string,
  emoji: string,
): Promise<EventTypeRow> {
  const db = getSupabaseAdmin();
  const trimmed = name.trim();
  const existing = await listEventTypes();
  const taken = new Set(existing.map((t) => t.slug));
  const base = slugify(trimmed);
  let slug = base;
  let n = 2;
  while (taken.has(slug)) slug = `${base}-${n++}`;

  const { data, error } = await db
    .from("event_type")
    .insert({ slug, name: trimmed, emoji })
    .select("*")
    .single();
  if (error) throw new Error(error.message);
  return data as EventTypeRow;
}

export async function deleteEventType(id: string): Promise<void> {
  const db = getSupabaseAdmin();
  // Remove the type's stored photos first, then the rows (cascade handles DB).
  const { data: photos } = await db
    .from("event_photo")
    .select("storage_path")
    .eq("event_type_id", id);
  const paths = (photos ?? []).map((p) => p.storage_path as string);
  if (paths.length) await db.storage.from(BUCKET).remove(paths);
  const { error } = await db.from("event_type").delete().eq("id", id);
  if (error) throw new Error(error.message);
}

/* ── Event photos ─────────────────────────────────────────────────────────── */

export async function listPhotos(): Promise<EventPhotoRow[]> {
  const db = getSupabaseAdmin();
  const { data, error } = await db
    .from("event_photo")
    .select("*")
    .order("created_at", { ascending: true });
  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function uploadPhoto(
  eventTypeId: string,
  file: UploadInput,
): Promise<EventPhotoRow> {
  const db = getSupabaseAdmin();
  const path = `event-photos/${eventTypeId}/${crypto.randomUUID()}.${file.ext}`;
  const up = await db.storage
    .from(BUCKET)
    .upload(path, file.bytes, { contentType: file.contentType, upsert: false });
  if (up.error) throw new Error(up.error.message);

  const { data, error } = await db
    .from("event_photo")
    .insert({ event_type_id: eventTypeId, storage_path: path })
    .select("*")
    .single();
  if (error) throw new Error(error.message);
  return data as EventPhotoRow;
}

export async function deletePhoto(id: string): Promise<void> {
  const db = getSupabaseAdmin();
  const { data: row } = await db
    .from("event_photo")
    .select("storage_path")
    .eq("id", id)
    .single();
  if (row?.storage_path) await db.storage.from(BUCKET).remove([row.storage_path]);
  const { error } = await db.from("event_photo").delete().eq("id", id);
  if (error) throw new Error(error.message);
}

/* ── Brand logos ──────────────────────────────────────────────────────────── */

export async function listLogos(): Promise<BrandLogoRow[]> {
  const db = getSupabaseAdmin();
  const { data, error } = await db.from("brand_logo").select("*");
  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function upsertLogo(
  key: "nomadgao" | "hotpot",
  file: UploadInput,
): Promise<BrandLogoRow> {
  const db = getSupabaseAdmin();
  // Remember the previous object so we can clean it up after a successful swap.
  const { data: prev } = await db
    .from("brand_logo")
    .select("storage_path")
    .eq("key", key)
    .maybeSingle();

  const path = `logos/${key}-${crypto.randomUUID()}.${file.ext}`;
  const up = await db.storage
    .from(BUCKET)
    .upload(path, file.bytes, { contentType: file.contentType, upsert: false });
  if (up.error) throw new Error(up.error.message);

  const { data, error } = await db
    .from("brand_logo")
    .upsert(
      { key, storage_path: path, updated_at: new Date().toISOString() },
      { onConflict: "key" },
    )
    .select("*")
    .single();
  if (error) throw new Error(error.message);

  if (prev?.storage_path) {
    await db.storage.from(BUCKET).remove([prev.storage_path]);
  }
  return data as BrandLogoRow;
}

/* ── View helpers ─────────────────────────────────────────────────────────── */

export interface PhotoView {
  id: string;
  url: string;
}

export interface EventTypeView {
  id: string;
  slug: string;
  name: string;
  emoji: string;
  photos: PhotoView[];
}

/** The whole library, shaped for the admin screen and the form dropdown. */
export async function getLibrary(): Promise<{
  types: EventTypeView[];
  logos: Record<string, string>;
}> {
  const [types, photos, logos] = await Promise.all([
    listEventTypes(),
    listPhotos(),
    listLogos(),
  ]);
  const byType = new Map<string, PhotoView[]>();
  for (const p of photos) {
    const list = byType.get(p.event_type_id) ?? [];
    list.push({ id: p.id, url: publicUrl(p.storage_path) });
    byType.set(p.event_type_id, list);
  }
  return {
    types: types.map((t) => ({
      id: t.id,
      slug: t.slug,
      name: t.name,
      emoji: t.emoji,
      photos: byType.get(t.id) ?? [],
    })),
    logos: Object.fromEntries(logos.map((l) => [l.key, publicUrl(l.storage_path)])),
  };
}

import { createClient, type SupabaseClient } from "@supabase/supabase-js";

/**
 * Server-side Supabase client using the service-role key. This key bypasses
 * RLS and must never reach the browser — only import this from server code
 * (route handlers, server components). Storage bucket is "assets".
 */
export const BUCKET = "assets";

let cached: SupabaseClient | null = null;

export function isSupabaseConfigured(): boolean {
  return Boolean(
    process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY,
  );
}

export function getSupabaseAdmin(): SupabaseClient {
  if (cached) return cached;
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    throw new Error(
      "Supabase is not configured. Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env.local.",
    );
  }
  cached = createClient(url, key, { auth: { persistSession: false } });
  return cached;
}

/** Public URL for an object in the assets bucket (bucket is public-read). */
export function publicUrl(storagePath: string): string {
  const base = (process.env.SUPABASE_URL ?? "").replace(/\/$/, "");
  return `${base}/storage/v1/object/public/${BUCKET}/${storagePath}`;
}

/** Row shapes for the Supabase tables (see supabase/migrations/0001_init.sql). */

export interface EventTypeRow {
  id: string;
  slug: string;
  name: string;
  emoji: string;
  created_at: string;
}

export interface EventPhotoRow {
  id: string;
  event_type_id: string;
  storage_path: string;
  created_at: string;
}

export interface BrandLogoRow {
  id: string;
  key: "nomadgao" | "hotpot";
  storage_path: string;
  updated_at: string;
}

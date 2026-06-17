import { createBrowserClient } from "@supabase/ssr";

/** Browser-side Supabase client (anon key) — used for the auth UI only. */
export function createSupabaseBrowser() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );
}

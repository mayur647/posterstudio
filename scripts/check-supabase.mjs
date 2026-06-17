// Smoke-test the Supabase connection + migration. Run:
//   node --env-file=.env.local scripts/check-supabase.mjs
import { createClient } from "@supabase/supabase-js";

const url = process.env.SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !key) {
  console.error("Missing SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY");
  process.exit(1);
}
console.log("URL:", url);

const db = createClient(url, key, { auth: { persistSession: false } });

const { data: types, error: te } = await db
  .from("event_type")
  .select("slug,name,emoji")
  .order("created_at");
if (te) {
  console.error("event_type query failed:", te.message);
  process.exit(1);
}
console.log(
  `event_type rows: ${types.length} →`,
  types.map((t) => `${t.emoji} ${t.slug}`).join(", "),
);

const { data: buckets, error: be } = await db.storage.listBuckets();
if (be) console.error("storage listBuckets failed:", be.message);
else
  console.log(
    "buckets:",
    buckets.map((b) => `${b.name}${b.public ? " (public)" : ""}`).join(", ") ||
      "(none)",
  );

console.log("OK");

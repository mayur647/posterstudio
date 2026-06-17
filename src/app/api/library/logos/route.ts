import { NextResponse } from "next/server";
import { isSupabaseConfigured, publicUrl } from "@/lib/db/supabase";
import { upsertLogo } from "@/lib/db/library";
import { readUpload } from "@/lib/db/upload";

export const runtime = "nodejs";

export async function POST(req: Request) {
  if (!isSupabaseConfigured()) {
    return NextResponse.json({ error: "Supabase not configured" }, { status: 503 });
  }
  let form: FormData;
  try {
    form = await req.formData();
  } catch {
    return NextResponse.json({ error: "expected multipart form" }, { status: 400 });
  }
  const key = String(form.get("key") ?? "");
  if (key !== "nomadgao" && key !== "hotpot") {
    return NextResponse.json(
      { error: "key must be 'nomadgao' or 'hotpot'" },
      { status: 400 },
    );
  }
  try {
    const file = await readUpload(form);
    const row = await upsertLogo(key, file);
    return NextResponse.json({
      logo: { key: row.key, url: publicUrl(row.storage_path) },
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "upload failed";
    console.error("logo upload failed", err);
    return NextResponse.json({ error: msg }, { status: 400 });
  }
}

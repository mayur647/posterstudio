import { NextResponse } from "next/server";
import { isSupabaseConfigured, publicUrl } from "@/lib/db/supabase";
import { uploadPhoto } from "@/lib/db/library";
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
  const eventTypeId = String(form.get("eventTypeId") ?? "");
  if (!eventTypeId) {
    return NextResponse.json({ error: "eventTypeId required" }, { status: 400 });
  }
  try {
    const file = await readUpload(form);
    const row = await uploadPhoto(eventTypeId, file);
    return NextResponse.json(
      { photo: { id: row.id, url: publicUrl(row.storage_path) } },
      { status: 201 },
    );
  } catch (err) {
    const msg = err instanceof Error ? err.message : "upload failed";
    console.error("photo upload failed", err);
    return NextResponse.json({ error: msg }, { status: 400 });
  }
}

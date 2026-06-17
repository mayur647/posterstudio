import { NextResponse } from "next/server";
import { isSupabaseConfigured } from "@/lib/db/supabase";
import { deletePhoto } from "@/lib/db/library";

export const runtime = "nodejs";

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  if (!isSupabaseConfigured()) {
    return NextResponse.json({ error: "Supabase not configured" }, { status: 503 });
  }
  const { id } = await params;
  try {
    await deletePhoto(id);
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("delete photo failed", err);
    return NextResponse.json({ error: "delete failed" }, { status: 500 });
  }
}

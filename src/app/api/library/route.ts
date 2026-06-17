import { NextResponse } from "next/server";
import { isSupabaseConfigured } from "@/lib/db/supabase";
import { getLibrary } from "@/lib/db/library";

export const runtime = "nodejs";

export async function GET() {
  if (!isSupabaseConfigured()) {
    return NextResponse.json(
      { error: "Supabase not configured" },
      { status: 503 },
    );
  }
  try {
    const library = await getLibrary();
    return NextResponse.json(library, {
      headers: { "Cache-Control": "no-store" },
    });
  } catch (err) {
    console.error("GET /api/library failed", err);
    return NextResponse.json({ error: "library load failed" }, { status: 500 });
  }
}

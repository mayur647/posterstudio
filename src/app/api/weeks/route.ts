import { NextResponse } from "next/server";
import { isSupabaseConfigured } from "@/lib/db/supabase";
import { saveWeek, listWeeks } from "@/lib/db/weeks";
import type { WeekFormPayload } from "@/lib/types";

export const runtime = "nodejs";

export async function GET() {
  if (!isSupabaseConfigured()) {
    return NextResponse.json({ weeks: [] });
  }
  try {
    const weeks = await listWeeks();
    return NextResponse.json({ weeks }, { headers: { "Cache-Control": "no-store" } });
  } catch (err) {
    console.error("list weeks failed", err);
    return NextResponse.json({ error: "list failed" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  if (!isSupabaseConfigured()) {
    return NextResponse.json({ error: "Supabase not configured" }, { status: 503 });
  }
  let payload: WeekFormPayload;
  try {
    payload = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid JSON" }, { status: 400 });
  }
  if (!payload?.week || !Array.isArray(payload.events)) {
    return NextResponse.json({ error: "missing week/events" }, { status: 400 });
  }
  try {
    const weekId = await saveWeek(payload);
    return NextResponse.json({ weekId }, { status: 201 });
  } catch (err) {
    console.error("save week failed", err);
    return NextResponse.json({ error: "save failed" }, { status: 500 });
  }
}

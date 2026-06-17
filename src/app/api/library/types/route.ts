import { NextResponse } from "next/server";
import { isSupabaseConfigured } from "@/lib/db/supabase";
import { createEventType } from "@/lib/db/library";
import { emojiForType } from "@/lib/theme";

export const runtime = "nodejs";

export async function POST(req: Request) {
  if (!isSupabaseConfigured()) {
    return NextResponse.json({ error: "Supabase not configured" }, { status: 503 });
  }
  let body: { name?: string; emoji?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid JSON" }, { status: 400 });
  }
  const name = (body.name ?? "").trim();
  if (!name) {
    return NextResponse.json({ error: "name is required" }, { status: 400 });
  }
  try {
    const emoji = body.emoji?.trim() || emojiForType(name);
    const type = await createEventType(name, emoji);
    return NextResponse.json({ type }, { status: 201 });
  } catch (err) {
    console.error("create event type failed", err);
    return NextResponse.json({ error: "create failed" }, { status: 500 });
  }
}

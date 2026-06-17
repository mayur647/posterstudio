import { NextResponse } from "next/server";
import ExcelJS from "exceljs";
import { isSupabaseConfigured } from "@/lib/db/supabase";
import { listWeeks } from "@/lib/db/weeks";
import { listEventTypes } from "@/lib/db/library";

export const runtime = "nodejs";

// Admin-only (gated by middleware): export every saved event as an .xlsx.
export async function GET() {
  if (!isSupabaseConfigured()) {
    return NextResponse.json({ error: "Supabase not configured" }, { status: 503 });
  }
  try {
    const [weeks, types] = await Promise.all([listWeeks(1000), listEventTypes()]);
    const nameBySlug = new Map(types.map((t) => [t.slug, t.name]));

    const wb = new ExcelJS.Workbook();
    wb.creator = "NomadGao Poster Studio";
    const ws = wb.addWorksheet("Events");
    ws.columns = [
      { header: "Week start", key: "weekStart", width: 13 },
      { header: "Week end", key: "weekEnd", width: 13 },
      { header: "Theme", key: "theme", width: 16 },
      { header: "Event", key: "name", width: 28 },
      { header: "Type", key: "type", width: 20 },
      { header: "Date", key: "date", width: 12 },
      { header: "Time", key: "time", width: 12 },
      { header: "Location", key: "location", width: 28 },
      { header: "Price", key: "price", width: 10 },
      { header: "Description", key: "description", width: 45 },
      { header: "Saved", key: "savedAt", width: 12 },
    ];
    ws.getRow(1).font = { bold: true };
    ws.views = [{ state: "frozen", ySplit: 1 }];

    for (const w of weeks) {
      for (const e of w.payload.events) {
        ws.addRow({
          weekStart: w.payload.week.startDate,
          weekEnd: w.payload.week.endDate,
          theme: w.payload.week.theme,
          name: e.name,
          type: nameBySlug.get(e.typeSlug) ?? e.typeSlug,
          date: e.date,
          time: e.time,
          location: e.location,
          price: e.price,
          description: e.description,
          savedAt: w.createdAt ? w.createdAt.slice(0, 10) : "",
        });
      }
    }

    const buf = await wb.xlsx.writeBuffer();
    return new NextResponse(new Uint8Array(buf), {
      status: 200,
      headers: {
        "Content-Type":
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": `attachment; filename="nomadgao-events.xlsx"`,
        "Cache-Control": "no-store",
      },
    });
  } catch (err) {
    console.error("export failed", err);
    return NextResponse.json({ error: "export failed" }, { status: 500 });
  }
}

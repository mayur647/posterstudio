// Verifies the Excel export: builds the workbook from real DB data (same logic
// as /api/export) and reopens it to confirm it's a valid .xlsx with rows.
// Run: node --env-file=.env.local scripts/check-export.mjs
import { createClient } from "@supabase/supabase-js";
import ExcelJS from "exceljs";
import { writeFile, mkdir } from "node:fs/promises";

const db = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { persistSession: false } },
);

const { data: weeks } = await db.from("week").select("*").order("created_at", { ascending: false });
const { data: events } = await db.from("event").select("*");
const { data: types } = await db.from("event_type").select("id,slug,name");
const nameById = Object.fromEntries(types.map((t) => [t.id, t.name]));
const byWeek = new Map();
for (const e of events) {
  const l = byWeek.get(e.week_id) ?? [];
  l.push(e);
  byWeek.set(e.week_id, l);
}

const wb = new ExcelJS.Workbook();
const ws = wb.addWorksheet("Events");
ws.columns = [
  { header: "Week start", key: "ws" }, { header: "Week end", key: "we" },
  { header: "Theme", key: "theme" }, { header: "Event", key: "name" },
  { header: "Type", key: "type" }, { header: "Date", key: "date" },
  { header: "Time", key: "time" }, { header: "Location", key: "loc" },
  { header: "Price", key: "price" }, { header: "Description", key: "desc" },
];
let rows = 0;
for (const w of weeks) {
  for (const e of byWeek.get(w.id) ?? []) {
    ws.addRow({
      ws: w.start_date, we: w.end_date, theme: w.theme, name: e.name,
      type: nameById[e.event_type_id] ?? "", date: e.date, time: e.time,
      loc: e.location, price: e.price, desc: e.description,
    });
    rows++;
  }
}
await mkdir(".render-test", { recursive: true });
const buf = await wb.xlsx.writeBuffer();
await writeFile(".render-test/events.xlsx", Buffer.from(buf));

// Reopen to confirm validity.
const wb2 = new ExcelJS.Workbook();
await wb2.xlsx.readFile(".render-test/events.xlsx");
const ws2 = wb2.getWorksheet("Events");
const isZip = Buffer.from(buf).subarray(0, 2).toString() === "PK";
console.log(
  `rows=${rows} | sheetRows(inc header)=${ws2.rowCount} | header1=${ws2.getRow(1).getCell(1).value}`,
  `| validXlsx(PK)=${isZip} | bytes=${Buffer.from(buf).length}`,
);
console.log("sample row 2:", JSON.stringify(ws2.getRow(2).values));

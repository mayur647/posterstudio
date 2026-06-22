// Verifies the "open week survives tab switch / reload" fix. Run with the dev
// server up on :3000 AND auth temporarily disabled (anon key renamed) so the
// pages are reachable headlessly. Drives a real browser through the flow.
import puppeteer from "puppeteer";

const BASE = "http://localhost:3000";
const payload = {
  week: { startDate: "2026-06-22", endDate: "2026-06-28", theme: "Matcha Studio" },
  events: [
    { name: "Sip & Paint Sunset", typeSlug: "sip", date: "2026-06-25", time: "6:00 PM", location: "NomadGao Rooftop, Dharamkot", price: "₹600", description: "Brushes, canvas and a sundowner." },
  ],
};

const results = [];
const check = (name, ok) => { results.push({ name, ok }); console.log(`${ok ? "PASS" : "FAIL"} — ${name}`); };
const hasStudio = (page) => page.evaluate(() => !!document.querySelector("#cal-square"));
const hasForm = (page) => page.evaluate(() => document.body.innerText.includes("Plan the week."));
const urlPath = (page) => new URL(page.url()).pathname;

const browser = await puppeteer.launch({ headless: "new", args: ["--no-sandbox"] });
const page = await browser.newPage();

// 1) Fresh load → the form, no studio, storage empty.
await page.goto(`${BASE}/`, { waitUntil: "networkidle0" });
check("fresh load shows the form", await hasForm(page));
check("fresh load has no studio", !(await hasStudio(page)));

// 2) Simulate a generated week being open, then reload.
await page.evaluate((p) => sessionStorage.setItem("ng:open-week", JSON.stringify(p)), payload);
await page.reload({ waitUntil: "networkidle0" });
await page.waitForSelector("#cal-square", { timeout: 8000 }).catch(() => {});
check("after reload the studio is restored (poster present)", await hasStudio(page));
check("studio title present", await page.evaluate(() => document.body.innerText.includes("Poster studio")));

// 3) Navigate to the Image Library tab, then back to the studio tab.
await page.click('a[href="/library"]');
await page.waitForFunction(() => location.pathname === "/library", { timeout: 8000 }).catch(() => {});
check("navigated to /library", urlPath(page) === "/library");
await page.click('a[href="/"]');
await page.waitForFunction(() => location.pathname === "/", { timeout: 8000 }).catch(() => {});
await page.waitForSelector("#cal-square", { timeout: 8000 }).catch(() => {});
check("back on studio tab, posters still there", await hasStudio(page));

// 4) "Edit the week" clears the open week so it won't restore next time.
await page.evaluate(() => {
  const btn = [...document.querySelectorAll("button")].find((b) => b.textContent.includes("Edit the week"));
  if (btn) btn.click();
});
await page.waitForFunction(() => document.body.innerText.includes("Plan the week."), { timeout: 8000 }).catch(() => {});
const cleared = await page.evaluate(() => sessionStorage.getItem("ng:open-week") === null);
check("Edit the week returns to the form", await hasForm(page));
check("Edit the week clears stored open-week", cleared);

await browser.close();
const passed = results.filter((r) => r.ok).length;
console.log(`\n${passed}/${results.length} checks passed`);
process.exit(passed === results.length ? 0 : 1);

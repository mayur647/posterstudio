// Renders the in-app /guide page to a PDF (screenshots embedded). Dev server up.
import puppeteer from "puppeteer";

const OUT =
  process.argv[2] || "C:/Users/front/Downloads/NomadGao-Poster-Studio-Guide.pdf";

const browser = await puppeteer.launch({ headless: "new", args: ["--no-sandbox"] });
const page = await browser.newPage();
await page.goto("http://localhost:3000/guide", { waitUntil: "networkidle0" });
await page.evaluate(() => document.fonts.ready);
await new Promise((r) => setTimeout(r, 600));
await page.pdf({
  path: OUT,
  format: "A4",
  printBackground: true,
  margin: { top: "14mm", bottom: "14mm", left: "12mm", right: "12mm" },
});
await browser.close();
console.log("saved", OUT);

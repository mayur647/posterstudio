import type { Browser } from "puppeteer-core";

/**
 * Headless-Chromium screenshot of the /render page.
 *  - Local dev: the full `puppeteer` package (bundled Chromium).
 *  - Vercel/serverless: `puppeteer-core` + `@sparticuz/chromium`.
 * Selection is by environment; imports are dynamic so each runtime only loads
 * what it needs.
 */
let browserPromise: Promise<Browser> | null = null;

const isServerless = Boolean(
  process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME,
);

async function launch(): Promise<Browser> {
  if (isServerless) {
    const chromium = (await import("@sparticuz/chromium")).default;
    const puppeteer = (await import("puppeteer-core")).default;
    return puppeteer.launch({
      args: chromium.args,
      executablePath: await chromium.executablePath(),
      headless: true,
    }) as unknown as Browser;
  }
  const puppeteer = (await import("puppeteer")).default;
  return puppeteer.launch({
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  }) as unknown as Browser;
}

async function getBrowser(): Promise<Browser> {
  if (browserPromise) {
    const b = await browserPromise;
    if (b.connected) return b;
  }
  browserPromise = launch();
  return browserPromise;
}

export async function screenshotUrl(
  url: string,
  opts: { width: number; height: number; dsf: number },
): Promise<Buffer> {
  const browser = await getBrowser();
  const page = await browser.newPage();
  try {
    await page.setViewport({
      width: Math.ceil(opts.width),
      height: Math.ceil(opts.height),
      deviceScaleFactor: opts.dsf,
    });
    // `load` waits for images + background photos + the font stylesheet.
    await page.goto(url, { waitUntil: "load" });
    // …then make sure the glyphs themselves are ready, or text metrics shift.
    await page.evaluate(async () => {
      await (document as Document).fonts.ready;
      // Strip Next's dev-mode indicator overlay so it can't leak into the
      // captured region (it doesn't exist in production builds anyway).
      document
        .querySelectorAll("nextjs-portal, [data-nextjs-toast]")
        .forEach((el) => el.remove());
    });
    const el = await page.$("#poster");
    if (!el) throw new Error("poster element not found");
    const buf = await el.screenshot({ type: "png" });
    return Buffer.from(buf);
  } finally {
    await page.close();
  }
}

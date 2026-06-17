import { NextResponse } from "next/server";
import { encodeSpec, dsfFor, SIZES, type RenderSpec } from "@/lib/render/spec";
import { screenshotUrl } from "@/lib/render/screenshot";

// Headless Chromium needs the Node runtime; rendering can take a few seconds.
export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST(req: Request) {
  let body: (RenderSpec & { filename?: string }) | null = null;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid JSON body" }, { status: 400 });
  }

  if (!body?.payload || !body?.kind || !body?.format) {
    return NextResponse.json(
      { error: "missing kind, format, or payload" },
      { status: 400 },
    );
  }

  const { filename, ...spec } = body;

  try {
    const origin = new URL(req.url).origin;
    const url = `${origin}/render?d=${encodeURIComponent(encodeSpec(spec))}`;
    const { w, h } = SIZES[spec.format];
    const png = await screenshotUrl(url, { width: w, height: h, dsf: dsfFor(spec.format) });

    return new NextResponse(new Uint8Array(png), {
      status: 200,
      headers: {
        "Content-Type": "image/png",
        "Content-Disposition": `attachment; filename="${filename ?? "nomadgao-poster.png"}"`,
        "Cache-Control": "no-store",
      },
    });
  } catch (err) {
    console.error("render failed", err);
    return NextResponse.json({ error: "render failed" }, { status: 500 });
  }
}

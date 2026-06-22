/**
 * Poster theme state ("currentStyle" in the prototype) and how it maps to the
 * CSS custom properties the poster components read. Shuffle rerolls palette,
 * font pairing, tile radius, decorative motif, logo side, and header alignment
 * — the green brand anchor and the calendar title stay fixed.
 */
import { PALETTES, FONT_PAIRS, DEFAULT_PALETTE, type Palette } from "@/lib/theme";

/** Decorative background pattern painted faintly behind the header / card. */
export type MotifKey = "dots" | "rings" | "rays" | "grid" | "waves";

export const MOTIFS: readonly MotifKey[] = [
  "dots",
  "rings",
  "rays",
  "grid",
  "waves",
] as const;

export interface PosterStyle {
  palette: Palette;
  /** [display, body] font-family tokens (quoted), e.g. "'Bricolage Grotesque'". */
  fonts: readonly [string, string];
  /** Tile corner radius (px) — biased rounded for a friendly, playful feel. */
  tileRadius: string;
  /** Playful accent hex used for stickers, motif tint and rings. */
  accent: string;
  /** Which decorative motif tiles behind the header / event card. */
  motif: MotifKey;
  /** Logo lockup / date-chip corner: normal or swapped. */
  logoDir: "row" | "row-reverse";
  /** Calendar header text alignment. */
  headerAlign: "left" | "center";
}

// Rounded options only — corners stay friendly/playful, never sharp-corporate.
const RADII = ["14px", "18px", "24px", "28px"];

function pick<T>(arr: readonly T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

/** #rrggbb → rgba(r,g,b,a). */
function rgba(hex: string, a: number): string {
  const h = hex.replace("#", "");
  const r = parseInt(h.slice(0, 2), 16);
  const g = parseInt(h.slice(2, 4), 16);
  const b = parseInt(h.slice(4, 6), 16);
  return `rgba(${r},${g},${b},${a})`;
}

/**
 * Builds the CSS background-image + size for a motif, tinted with the accent.
 * Gradient-based motifs render reliably in the headless screenshot pipeline;
 * "waves" uses a tiny inline SVG (accent URL-encoded so the `#` survives).
 */
export function motifCss(key: MotifKey, accent: string): {
  image: string;
  size: string;
} {
  const c = rgba(accent, 0.5);
  switch (key) {
    case "dots":
      return { image: `radial-gradient(${c} 2px, transparent 2.4px)`, size: "18px 18px" };
    case "rings":
      return {
        image: `radial-gradient(circle, transparent 0 3.5px, ${c} 3.5px 5px, transparent 5px)`,
        size: "22px 22px",
      };
    case "rays":
      return {
        image: `repeating-linear-gradient(45deg, ${c} 0 2px, transparent 2px 15px)`,
        size: "auto",
      };
    case "grid":
      return {
        image: `linear-gradient(${c} 1px, transparent 1px), linear-gradient(90deg, ${c} 1px, transparent 1px)`,
        size: "22px 22px",
      };
    case "waves": {
      const svg =
        `<svg xmlns='http://www.w3.org/2000/svg' width='44' height='16'>` +
        `<path d='M0 8 Q 11 0 22 8 T 44 8' fill='none' stroke='${accent}' ` +
        `stroke-width='1.4' opacity='0.5'/></svg>`;
      return {
        image: `url("data:image/svg+xml,${encodeURIComponent(svg)}")`,
        size: "44px 16px",
      };
    }
  }
}

/** The Matcha Studio default applied on first load. */
export function defaultStyle(): PosterStyle {
  const palette =
    PALETTES.find((p) => p.name === DEFAULT_PALETTE) ?? PALETTES[0];
  return {
    palette,
    fonts: FONT_PAIRS[0],
    tileRadius: "18px",
    accent: palette.accent,
    motif: "dots",
    logoDir: "row",
    headerAlign: "left",
  };
}

/** A fresh coordinated look — used by the Shuffle button. */
export function shuffleStyle(): PosterStyle {
  const palette = pick(PALETTES);
  return {
    palette,
    fonts: pick(FONT_PAIRS),
    tileRadius: pick(RADII),
    accent: palette.accent,
    motif: pick(MOTIFS),
    logoDir: Math.random() < 0.5 ? "row" : "row-reverse",
    headerAlign: Math.random() < 0.5 ? "left" : "center",
  };
}

/** The CSS custom properties the posters consume, as a style object. */
export function styleVars(style: PosterStyle): React.CSSProperties {
  const { palette, fonts, tileRadius, accent, motif, logoDir, headerAlign } =
    style;
  const m = motifCss(motif, accent);
  const vars: Record<string, string> = {
    "--ng-header": palette.header[0],
    "--ng-header-ink": palette.header[1],
    "--ng-accent": accent,
    "--ng-motif": m.image,
    "--ng-motif-size": m.size,
    "--ng-display": fonts[0],
    "--ng-body": fonts[1],
    "--ng-tile-radius": tileRadius,
    "--ng-logo-dir": logoDir,
    "--ng-head-align": headerAlign,
  };
  palette.tiles.forEach((t, i) => {
    vars[`--ng-t${i + 1}`] = t[0];
    vars[`--ng-t${i + 1}i`] = t[1];
  });
  return vars as React.CSSProperties;
}

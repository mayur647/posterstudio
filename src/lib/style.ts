/**
 * Poster theme state ("currentStyle" in the prototype) and how it maps to the
 * CSS custom properties the poster components read. Shuffle rerolls palette,
 * font pairing, tile radius, logo side, and header alignment — the calendar
 * title stays fixed.
 */
import { PALETTES, FONT_PAIRS, DEFAULT_PALETTE, type Palette } from "@/lib/theme";

export interface PosterStyle {
  palette: Palette;
  /** [display, body] font-family tokens (quoted), e.g. "'Bricolage Grotesque'". */
  fonts: readonly [string, string];
  /** Tile corner radius, one of 6 / 14 / 24 px. */
  tileRadius: string;
  /** Logo lockup / date-chip corner: normal or swapped. */
  logoDir: "row" | "row-reverse";
  /** Calendar header text alignment. */
  headerAlign: "left" | "center";
}

const RADII = ["6px", "14px", "24px"];

function pick<T>(arr: readonly T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

/** The Matcha Studio default applied on first load. */
export function defaultStyle(): PosterStyle {
  const palette =
    PALETTES.find((p) => p.name === DEFAULT_PALETTE) ?? PALETTES[0];
  return {
    palette,
    fonts: FONT_PAIRS[0],
    tileRadius: "14px",
    logoDir: "row",
    headerAlign: "left",
  };
}

/** A fresh coordinated look — used by the Shuffle button. */
export function shuffleStyle(): PosterStyle {
  return {
    palette: pick(PALETTES),
    fonts: pick(FONT_PAIRS),
    tileRadius: pick(RADII),
    logoDir: Math.random() < 0.5 ? "row" : "row-reverse",
    headerAlign: Math.random() < 0.5 ? "left" : "center",
  };
}

/** The CSS custom properties the posters consume, as a style object. */
export function styleVars(style: PosterStyle): React.CSSProperties {
  const { palette, fonts, tileRadius, logoDir, headerAlign } = style;
  const vars: Record<string, string> = {
    "--ng-header": palette.header[0],
    "--ng-header-ink": palette.header[1],
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
